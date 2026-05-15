import { createHash, randomBytes } from "crypto";

import { Role as DbRole } from "@prisma/client";

import { getAppBaseUrl } from "@/lib/app-base-url";
import { createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email/verification";
import { ensureTeacherProfile, submitTeacherImportOnboarding } from "@/lib/persistence";
import type { ClaimableProfileOption, PendingSignup, Role } from "@/lib/types";
import type { TeacherImportSourceInput } from "@/lib/teacher-profile-import";

type PendingSignupRecord = {
  id: string;
  email: string;
  normalizedEmail: string;
  name: string;
  passwordHash: string;
  role: DbRole;
  nextPath: string | null;
  teacherWebsiteUrl: string | null;
  teacherLinkedinUrl: string | null;
  teacherInstagramUrl: string | null;
  teacherFacebookUrl: string | null;
  teacherProfileImportConsent: boolean;
  teacherResumeUrl: string | null;
  teacherResumeFileName: string | null;
  teacherResumeMimeType: string | null;
  teacherResumeText: string | null;
  selectedProfileKind: string | null;
  selectedProfileId: string | null;
  status: "PENDING" | "VERIFIED" | "CONSUMED" | "EXPIRED" | "CANCELLED";
  verifiedAt: Date | null;
  consumedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

type TokenRecord = {
  id: string;
  pendingSignupId: string;
  tokenHash: string;
  expiresAt: Date;
  consumedAt: Date | null;
  pendingSignup: PendingSignupRecord;
};

type ExistingUserCandidate = {
  id: string;
  email: string;
  name: string;
  role: Role;
  emailVerifiedAt: Date | null;
};

type ExistingTeacherCandidate = {
  id: string;
  fullName: string;
  claimEmail: string;
  userId: string | null;
  user: {
    id: string;
    email: string;
    emailVerifiedAt: Date | null;
  } | null;
};

type CandidateResolution = {
  claimableTargets: Array<
    | { kind: "user"; id: string; user: ExistingUserCandidate; option: ClaimableProfileOption }
    | { kind: "teacher"; id: string; teacher: ExistingTeacherCandidate; option: ClaimableProfileOption }
  >;
  blockedMessage?: string;
};

export type ConsumePendingSignupResult =
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string }
  | { status: "consumed"; message: string }
  | { status: "blocked"; message: string; email: string }
  | { status: "selection_required"; pendingSignup: PendingSignup; options: ClaimableProfileOption[] }
  | { status: "success"; redirectTo: string };

export type PendingSignupVerificationPageResult =
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string }
  | { status: "consumed"; message: string }
  | { status: "blocked"; message: string; email: string }
  | { status: "selection_required"; pendingSignup: PendingSignup; options: ClaimableProfileOption[] };

type CreatePendingSignupInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  nextPath?: string | null;
  teacherImport?: TeacherImportSourceInput;
};

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

const pendingSignupSelect = {
  id: true,
  email: true,
  normalizedEmail: true,
  name: true,
  passwordHash: true,
  role: true,
  nextPath: true,
  teacherWebsiteUrl: true,
  teacherLinkedinUrl: true,
  teacherInstagramUrl: true,
  teacherFacebookUrl: true,
  teacherProfileImportConsent: true,
  teacherResumeUrl: true,
  teacherResumeFileName: true,
  teacherResumeMimeType: true,
  teacherResumeText: true,
  selectedProfileKind: true,
  selectedProfileId: true,
  status: true,
  verifiedAt: true,
  consumedAt: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true
};

export async function createPendingSignupVerification(input: CreatePendingSignupInput) {
  const normalizedEmail = normalizeEmail(input.email);
  const pendingSignupId = `pending-signup-${Date.now()}-${randomBytes(4).toString("hex")}`;
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
  const passwordHash = await hashPassword(input.password);
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);

  await db.$transaction(async (tx) => {
    await tx.pendingSignup.updateMany({
      where: {
        normalizedEmail,
        status: "PENDING"
      },
      data: {
        status: "CANCELLED"
      }
    });

    await tx.pendingSignup.create({
      data: {
        id: pendingSignupId,
        email: normalizedEmail,
        normalizedEmail,
        name: input.name.trim(),
        passwordHash,
        role: mapRoleToDb(input.role),
        nextPath: normalizeOptionalPath(input.nextPath),
        teacherWebsiteUrl: input.teacherImport?.websiteUrl?.trim() || null,
        teacherLinkedinUrl: input.teacherImport?.linkedinUrl?.trim() || null,
        teacherInstagramUrl: input.teacherImport?.instagramUrl?.trim() || null,
        teacherFacebookUrl: input.teacherImport?.facebookUrl?.trim() || null,
        teacherProfileImportConsent: Boolean(input.teacherImport?.profileImportConsent),
        teacherResumeUrl: input.teacherImport?.resume?.url || null,
        teacherResumeFileName: input.teacherImport?.resume?.fileName || null,
        teacherResumeMimeType: input.teacherImport?.resume?.mimeType || null,
        teacherResumeText: input.teacherImport?.resume?.text || null,
        expiresAt
      }
    });

    await tx.emailVerificationToken.create({
      data: {
        id: `email-verification-token-${Date.now()}-${randomBytes(4).toString("hex")}`,
        pendingSignupId,
        tokenHash,
        expiresAt
      }
    });
  });

  const verificationUrl = `${getAppBaseUrl()}/auth/verify-email/complete?token=${rawToken}`;

  const mailResult = await sendVerificationEmail({
    email: normalizedEmail,
    name: input.name.trim(),
    verificationUrl
  });

  if (mailResult.delivered && mailResult.messageId) {
    const domain = normalizedEmail.includes("@") ? normalizedEmail.split("@")[1] : "unknown";
    console.info("[signup-verification-email]", { messageId: mailResult.messageId, toDomain: domain });
  }

  return {
    email: normalizedEmail,
    verificationUrl
  };
}

export async function consumePendingSignupVerification(
  rawToken: string,
  selection?: { kind: "user" | "teacher"; id: string }
): Promise<ConsumePendingSignupResult> {
  const tokenRecord = await getTokenRecord(rawToken);

  if (!tokenRecord) {
    return {
      status: "invalid",
      message: "This verification link is invalid."
    };
  }

  const now = new Date();

  if (tokenRecord.consumedAt || tokenRecord.pendingSignup.status === "CONSUMED") {
    return {
      status: "consumed",
      message: "This verification link has already been used."
    };
  }

  if (tokenRecord.expiresAt <= now || tokenRecord.pendingSignup.expiresAt <= now || tokenRecord.pendingSignup.status === "EXPIRED") {
    await markPendingSignupExpired(tokenRecord.pendingSignup.id);

    return {
      status: "expired",
      message: "This verification link has expired. Please sign up again to receive a new email."
    };
  }

  const pendingSignup = mapPendingSignup(tokenRecord.pendingSignup);
  const resolution = await resolveClaimableProfiles(pendingSignup);

  if (resolution.claimableTargets.length === 0 && resolution.blockedMessage) {
    return {
      status: "blocked",
      message: resolution.blockedMessage,
      email: pendingSignup.email
    };
  }

  if (resolution.claimableTargets.length > 1 && !selection) {
    return {
      status: "selection_required",
      pendingSignup,
      options: resolution.claimableTargets.map((target) => target.option)
    };
  }

  const chosenTarget =
    selection
      ? resolution.claimableTargets.find((target) => target.kind === selection.kind && target.id === selection.id)
      : resolution.claimableTargets[0];

  if (selection && !chosenTarget) {
    return {
      status: "selection_required",
      pendingSignup,
      options: resolution.claimableTargets.map((target) => target.option)
    };
  }

  const redirectTo = await finalizePendingSignup(tokenRecord, pendingSignup, chosenTarget);

  return {
    status: "success",
    redirectTo
  };
}

export async function getPendingSignupVerificationPageResult(
  rawToken: string
): Promise<PendingSignupVerificationPageResult> {
  const tokenRecord = await getTokenRecord(rawToken);

  if (!tokenRecord) {
    return {
      status: "invalid",
      message: "This verification link is invalid."
    };
  }

  const now = new Date();

  if (tokenRecord.consumedAt || tokenRecord.pendingSignup.status === "CONSUMED") {
    return {
      status: "consumed",
      message: "This verification link has already been used."
    };
  }

  if (tokenRecord.expiresAt <= now || tokenRecord.pendingSignup.expiresAt <= now || tokenRecord.pendingSignup.status === "EXPIRED") {
    return {
      status: "expired",
      message: "This verification link has expired. Please sign up again to receive a new email."
    };
  }

  const pendingSignup = mapPendingSignup(tokenRecord.pendingSignup);
  const resolution = await resolveClaimableProfiles(pendingSignup);

  if (resolution.claimableTargets.length === 0 && resolution.blockedMessage) {
    return {
      status: "blocked",
      message: resolution.blockedMessage,
      email: pendingSignup.email
    };
  }

  return {
    status: "selection_required",
    pendingSignup,
    options: resolution.claimableTargets.map((target) => target.option)
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeOptionalPath(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function mapRoleToDb(role: Role) {
  return role === "teacher" ? DbRole.TEACHER : DbRole.CUSTOMER;
}

function mapRoleToApp(role: DbRole): Role {
  return role === DbRole.TEACHER ? "teacher" : "customer";
}

function isYogaLocalEmail(email: string) {
  return normalizeEmail(email).endsWith("@yoga.local");
}

function mapPendingSignup(record: PendingSignupRecord): PendingSignup {
  return {
    id: record.id,
    email: record.email,
    normalizedEmail: record.normalizedEmail,
    name: record.name,
    passwordHash: record.passwordHash,
    role: mapRoleToApp(record.role),
    nextPath: record.nextPath ?? undefined,
    teacherWebsiteUrl: record.teacherWebsiteUrl ?? undefined,
    teacherLinkedinUrl: record.teacherLinkedinUrl ?? undefined,
    teacherInstagramUrl: record.teacherInstagramUrl ?? undefined,
    teacherFacebookUrl: record.teacherFacebookUrl ?? undefined,
    teacherProfileImportConsent: record.teacherProfileImportConsent,
    teacherResumeUrl: record.teacherResumeUrl ?? undefined,
    teacherResumeFileName: record.teacherResumeFileName ?? undefined,
    teacherResumeMimeType: record.teacherResumeMimeType ?? undefined,
    teacherResumeText: record.teacherResumeText ?? undefined,
    selectedProfileKind: (record.selectedProfileKind as "user" | "teacher" | null) ?? undefined,
    selectedProfileId: record.selectedProfileId ?? undefined,
    status: record.status.toLowerCase() as PendingSignup["status"],
    verifiedAt: record.verifiedAt?.toISOString(),
    consumedAt: record.consumedAt?.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString()
  };
}

async function getTokenRecord(rawToken: string): Promise<TokenRecord | null> {
  return db.emailVerificationToken.findUnique({
    where: {
      tokenHash: hashVerificationToken(rawToken)
    },
    select: {
      id: true,
      pendingSignupId: true,
      tokenHash: true,
      expiresAt: true,
      consumedAt: true,
      pendingSignup: {
        select: pendingSignupSelect
      }
    }
  });
}

async function markPendingSignupExpired(pendingSignupId: string) {
  await db.$transaction([
    db.pendingSignup.updateMany({
      where: {
        id: pendingSignupId,
        status: "PENDING"
      },
      data: {
        status: "EXPIRED"
      }
    }),
    db.emailVerificationToken.updateMany({
      where: {
        pendingSignupId,
        consumedAt: null
      },
      data: {
        consumedAt: new Date()
      }
    })
  ]);
}

async function resolveClaimableProfiles(pendingSignup: PendingSignup): Promise<CandidateResolution> {
  const normalizedEmail = pendingSignup.normalizedEmail;
  const placeholderEmail = getYogaLocalPlaceholderEmail(normalizedEmail);

  const [exactUser, placeholderUser, exactTeacher, placeholderTeacher] = await Promise.all([
    db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerifiedAt: true
      }
    }),
    placeholderEmail
      ? db.user.findUnique({
          where: { email: placeholderEmail },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            emailVerifiedAt: true
          }
        })
      : Promise.resolve(null),
    db.teacher.findUnique({
      where: { claimEmail: normalizedEmail },
      select: {
        id: true,
        fullName: true,
        claimEmail: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            emailVerifiedAt: true
          }
        }
      }
    }),
    placeholderEmail
      ? db.teacher.findUnique({
          where: { claimEmail: placeholderEmail },
          select: {
            id: true,
            fullName: true,
            claimEmail: true,
            userId: true,
            user: {
              select: {
                id: true,
                email: true,
                emailVerifiedAt: true
              }
            }
          }
        })
      : Promise.resolve(null)
  ]);

  const claimableTargets: CandidateResolution["claimableTargets"] = [];
  const blockedMessages: string[] = [];
  const seenTargets = new Set<string>();

  if (exactUser?.emailVerifiedAt) {
    return {
      claimableTargets: [],
      blockedMessage: "That email is already attached to a verified account. Please sign in instead."
    };
  }

  if (
    exactTeacher?.claimEmail &&
    (exactTeacher.userId || exactTeacher.user?.emailVerifiedAt) &&
    !isYogaLocalEmail(exactTeacher.claimEmail)
  ) {
    return {
      claimableTargets: [],
      blockedMessage: "That teacher profile has already been claimed by a verified account."
    };
  }

  const users = [exactUser, placeholderUser].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const teachers = [exactTeacher, placeholderTeacher].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  for (const user of users) {
    const targetKey = `user:${user.id}`;
    if (seenTargets.has(targetKey)) {
      continue;
    }
    seenTargets.add(targetKey);

    const appRole = mapRoleToApp(user.role);

    if (user.emailVerifiedAt) {
      blockedMessages.push("That email is already attached to a verified account. Please sign in instead.");
    } else if (!isYogaLocalEmail(user.email)) {
      blockedMessages.push("Only unverified @yoga.local profiles can be claimed during signup.");
    } else if (appRole !== pendingSignup.role) {
      blockedMessages.push(`That ${appRole} profile cannot be claimed from this ${pendingSignup.role} signup.`);
    } else {
      claimableTargets.push({
        kind: "user",
        id: user.id,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: appRole,
          emailVerifiedAt: user.emailVerifiedAt
        },
        option: {
          id: user.id,
          kind: "user",
          title: user.name,
          subtitle: `Existing ${appRole} account`,
          email: user.email,
          selectable: true
        }
      });
    }
  }

  for (const teacher of teachers) {
    if (!teacher.claimEmail) {
      continue;
    }

    const targetKey = `teacher:${teacher.id}`;
    if (seenTargets.has(targetKey)) {
      continue;
    }
    seenTargets.add(targetKey);

    if (teacher.userId || teacher.user?.emailVerifiedAt) {
      blockedMessages.push("That teacher profile has already been claimed by a verified account.");
    } else if (!isYogaLocalEmail(teacher.claimEmail)) {
      blockedMessages.push("Only unverified @yoga.local profiles can be claimed during signup.");
    } else if (pendingSignup.role !== "teacher") {
      blockedMessages.push("Teacher profiles can only be claimed from a teacher signup.");
    } else {
      claimableTargets.push({
        kind: "teacher",
        id: teacher.id,
        teacher: {
          id: teacher.id,
          fullName: teacher.fullName,
          claimEmail: teacher.claimEmail,
          userId: teacher.userId,
          user: teacher.user
        },
        option: {
          id: teacher.id,
          kind: "teacher",
          title: teacher.fullName,
          subtitle: "Existing teacher profile",
          email: teacher.claimEmail,
          selectable: true
        }
      });
    }
  }

  return {
    claimableTargets,
    blockedMessage: claimableTargets.length === 0 ? blockedMessages[0] : undefined
  };
}

async function finalizePendingSignup(
  tokenRecord: TokenRecord,
  pendingSignup: PendingSignup,
  chosenTarget:
    | CandidateResolution["claimableTargets"][number]
    | undefined
) {
  const now = new Date();
  const verifiedEmail = pendingSignup.normalizedEmail;
  let sessionUserId = "";
  let sessionRole: Role = pendingSignup.role;
  let teacherId: string | undefined;

  if (!chosenTarget) {
    const createdUser = await db.user.create({
      data: {
        id: `user-${Date.now()}-${randomBytes(4).toString("hex")}`,
        email: verifiedEmail,
        password: pendingSignup.passwordHash,
        role: mapRoleToDb(pendingSignup.role),
        name: pendingSignup.name,
        emailVerifiedAt: now
      },
      select: {
        id: true,
        role: true
      }
    });

    sessionUserId = createdUser.id;
    sessionRole = mapRoleToApp(createdUser.role);
  } else if (chosenTarget.kind === "user") {
    const updatedUser = await db.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: chosenTarget.user.id },
        data: {
          email: verifiedEmail,
          name: pendingSignup.name,
          password: pendingSignup.passwordHash,
          emailVerifiedAt: now
        },
        select: {
          id: true,
          role: true
        }
      });

      await tx.teacher.updateMany({
        where: {
          userId: chosenTarget.user.id,
          claimEmail: {
            endsWith: "@yoga.local"
          }
        },
        data: {
          claimEmail: verifiedEmail
        }
      });

      return user;
    });

    sessionUserId = updatedUser.id;
    sessionRole = mapRoleToApp(updatedUser.role);
  } else {
    const createdUser = await db.user.create({
      data: {
        id: `user-${Date.now()}-${randomBytes(4).toString("hex")}`,
        email: verifiedEmail,
        password: pendingSignup.passwordHash,
        role: DbRole.TEACHER,
        name: pendingSignup.name,
        emailVerifiedAt: now
      },
      select: {
        id: true
      }
    });

    await db.teacher.update({
      where: { id: chosenTarget.teacher.id },
      data: {
        userId: createdUser.id,
        claimEmail: verifiedEmail
      },
      select: {
        id: true
      }
    });

    sessionUserId = createdUser.id;
    sessionRole = "teacher";
    teacherId = chosenTarget.teacher.id;
  }

  if (sessionRole === "teacher" && !teacherId) {
    const teacher = await ensureTeacherProfile(sessionUserId, pendingSignup.name);
    teacherId = teacher.id;
  }

  await db.$transaction([
    db.pendingSignup.update({
      where: { id: pendingSignup.id },
      data: {
        status: "CONSUMED",
        verifiedAt: now,
        consumedAt: now,
        selectedProfileKind: chosenTarget?.kind ?? null,
        selectedProfileId: chosenTarget?.id ?? null
      }
    }),
    db.emailVerificationToken.updateMany({
      where: {
        pendingSignupId: tokenRecord.pendingSignupId,
        consumedAt: null
      },
      data: {
        consumedAt: now
      }
    })
  ]);

  if (teacherId && hasTeacherImportData(pendingSignup)) {
    await submitTeacherImportOnboarding(teacherId, buildTeacherImportInput(pendingSignup));
  }

  await createSession(sessionUserId, sessionRole);

  return buildPostVerificationRedirect(pendingSignup, sessionRole);
}

function getYogaLocalPlaceholderEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const localPart = normalizedEmail.split("@")[0]?.trim();

  if (!localPart) {
    return null;
  }

  const placeholderEmail = `${localPart}@yoga.local`;
  return placeholderEmail === normalizedEmail ? null : placeholderEmail;
}

function hasTeacherImportData(pendingSignup: PendingSignup) {
  return Boolean(
    pendingSignup.teacherWebsiteUrl ||
      pendingSignup.teacherLinkedinUrl ||
      pendingSignup.teacherInstagramUrl ||
      pendingSignup.teacherFacebookUrl ||
      pendingSignup.teacherResumeUrl
  );
}

function buildTeacherImportInput(pendingSignup: PendingSignup): TeacherImportSourceInput {
  return {
    websiteUrl: pendingSignup.teacherWebsiteUrl,
    linkedinUrl: pendingSignup.teacherLinkedinUrl,
    instagramUrl: pendingSignup.teacherInstagramUrl,
    facebookUrl: pendingSignup.teacherFacebookUrl,
    profileImportConsent: pendingSignup.teacherProfileImportConsent,
    resume: pendingSignup.teacherResumeUrl
      ? {
          url: pendingSignup.teacherResumeUrl,
          fileName: pendingSignup.teacherResumeFileName || "resume",
          mimeType: pendingSignup.teacherResumeMimeType || "application/octet-stream",
          text: pendingSignup.teacherResumeText
        }
      : undefined
  };
}

function buildPostVerificationRedirect(pendingSignup: PendingSignup, role: Role) {
  if (pendingSignup.nextPath) {
    return pendingSignup.nextPath;
  }

  if (role === "teacher") {
    return hasTeacherImportData(pendingSignup)
      ? "/dashboard/teacher/profile?import=complete"
      : "/dashboard/teacher/profile?verified=1";
  }

  return "/?verified=1";
}

export type ResendPendingSignupVerificationResult =
  | { ok: true; delivered: boolean; messageId?: string }
  | { ok: false; reason: "no_pending_signup" };

/**
 * Invalidate prior verification links for this pending signup and send a fresh verification email.
 * Intended for admin/support use when the original link expired or pointed at the wrong origin.
 */
export async function resendPendingSignupVerificationEmail(input: {
  email: string;
  cc?: string;
}): Promise<ResendPendingSignupVerificationResult> {
  const normalizedEmail = normalizeEmail(input.email);
  const cc = input.cc?.trim() || undefined;

  const pending = await db.pendingSignup.findFirst({
    where: { normalizedEmail, status: "PENDING" },
    orderBy: { createdAt: "desc" }
  });

  if (!pending) {
    return { ok: false, reason: "no_pending_signup" };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await db.$transaction(async (tx) => {
    await tx.emailVerificationToken.updateMany({
      where: { pendingSignupId: pending.id, consumedAt: null },
      data: { consumedAt: new Date() }
    });
    await tx.pendingSignup.update({
      where: { id: pending.id },
      data: { expiresAt }
    });
    await tx.emailVerificationToken.create({
      data: {
        id: `email-verification-token-${Date.now()}-${randomBytes(4).toString("hex")}`,
        pendingSignupId: pending.id,
        tokenHash,
        expiresAt
      }
    });
  });

  const verificationUrl = `${getAppBaseUrl()}/auth/verify-email/complete?token=${rawToken}`;
  const mailResult = await sendVerificationEmail({
    email: normalizedEmail,
    name: pending.name.trim(),
    verificationUrl,
    cc
  });

  return {
    ok: true,
    delivered: mailResult.delivered,
    messageId: mailResult.delivered ? mailResult.messageId : undefined
  };
}
