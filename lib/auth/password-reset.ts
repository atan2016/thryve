import { randomBytes } from "crypto";

import { Role as DbRole } from "@prisma/client";

import { hashVerificationToken } from "@/lib/auth/verification-token";
import { assertNewPasswordDiffersFromCurrent, validateNewPassword } from "@/lib/auth/password-policy";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getAppBaseUrl } from "@/lib/app-base-url";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email/password-reset";
import { ensureTeacherProfile } from "@/lib/persistence";
import type { Role } from "@/lib/types";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60 * 24;
const TEMP_PASSWORD_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function mapRoleToDb(role: Role): DbRole {
  if (role === "teacher") return DbRole.TEACHER;
  if (role === "admin") return DbRole.ADMIN;
  return DbRole.CUSTOMER;
}

export function generateTemporaryPassword(length = 16) {
  const bytes = randomBytes(length);
  let value = "";

  for (let index = 0; index < length; index += 1) {
    value += TEMP_PASSWORD_ALPHABET[bytes[index]! % TEMP_PASSWORD_ALPHABET.length];
  }

  return value;
}

export type ConsumePasswordResetResult =
  | { status: "invalid"; message: string }
  | { status: "expired"; message: string }
  | { status: "consumed"; message: string }
  | { status: "success" };

export async function requestPasswordReset(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      emailVerifiedAt: true
    }
  });

  if (!user?.emailVerifiedAt) {
    return { sent: false as const };
  }

  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashVerificationToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  const tokenId = `password-reset-${Date.now()}-${randomBytes(4).toString("hex")}`;

  await db.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        consumedAt: null
      },
      data: {
        consumedAt: new Date()
      }
    });

    await tx.passwordResetToken.create({
      data: {
        id: tokenId,
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });
  });

  const resetUrl = `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(rawToken)}`;

  const mailResult = await sendPasswordResetEmail({
    email: user.email,
    name: user.name,
    resetUrl
  });

  if (mailResult.delivered && mailResult.messageId) {
    console.info("[password-reset-email]", { messageId: mailResult.messageId, to: user.email });
  } else if (process.env.NODE_ENV !== "production") {
    console.info("[requestPasswordReset] Password reset link (SMTP not delivered):", resetUrl);
  } else {
    throw new Error("SMTP is not configured or the reset email could not be sent.");
  }

  return {
    sent: true as const,
    devResetUrl: process.env.NODE_ENV !== "production" && !mailResult.delivered ? resetUrl : undefined
  };
}

export async function consumePasswordReset(token: string, newPassword: string): Promise<ConsumePasswordResetResult> {
  const policyError = validateNewPassword(newPassword);
  if (policyError) {
    throw new Error(policyError);
  }

  const trimmedToken = token.trim();
  if (!trimmedToken) {
    return { status: "invalid", message: "This reset link is invalid." };
  }

  const tokenHash = hashVerificationToken(trimmedToken);
  const record = await db.passwordResetToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      consumedAt: true,
      user: {
        select: {
          id: true,
          password: true
        }
      }
    }
  });

  if (!record) {
    return { status: "invalid", message: "This reset link is invalid." };
  }

  if (record.consumedAt) {
    return { status: "consumed", message: "This reset link has already been used." };
  }

  if (record.expiresAt <= new Date()) {
    return { status: "expired", message: "This reset link has expired. Request a new one from the sign-in page." };
  }

  await assertNewPasswordDiffersFromCurrent(newPassword, (plain) => verifyPassword(plain, record.user.password));

  const passwordHash = await hashPassword(newPassword);

  await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: record.user.id },
      data: {
        password: passwordHash,
        mustChangePassword: false,
        passwordChangedAt: new Date()
      }
    });

    await tx.passwordResetToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() }
    });

    await tx.passwordResetToken.updateMany({
      where: {
        userId: record.user.id,
        consumedAt: null,
        NOT: { id: record.id }
      },
      data: { consumedAt: new Date() }
    });
  });

  return { status: "success" };
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const policyError = validateNewPassword(newPassword);
  if (policyError) {
    throw new Error(policyError);
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true }
  });

  if (!user) {
    throw new Error("You must be signed in to change your password.");
  }

  if (!(await verifyPassword(currentPassword, user.password))) {
    throw new Error("Current password is incorrect.");
  }

  await assertNewPasswordDiffersFromCurrent(newPassword, (plain) => verifyPassword(plain, user.password));

  const passwordHash = await hashPassword(newPassword);

  await db.user.update({
    where: { id: userId },
    data: {
      password: passwordHash,
      mustChangePassword: false,
      passwordChangedAt: new Date()
    }
  });
}

export async function createUserAsAdmin(input: {
  name: string;
  email: string;
  role: Role;
}) {
  const normalizedEmail = normalizeEmail(input.email);
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    throw new Error("Name is required.");
  }

  const duplicate = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true }
  });

  if (duplicate) {
    throw new Error("That email is already in use.");
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const userId = `user-${Date.now()}-${randomBytes(4).toString("hex")}`;

  const user = await db.user.create({
    data: {
      id: userId,
      email: normalizedEmail,
      name: trimmedName,
      role: mapRoleToDb(input.role),
      password: passwordHash,
      emailVerifiedAt: new Date(),
      mustChangePassword: true
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  });

  if (input.role === "teacher") {
    await ensureTeacherProfile(user.id, user.name);
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: input.role
    },
    temporaryPassword
  };
}

export async function setTemporaryPasswordAsAdmin(userId: string) {
  const existing = await db.user.findUnique({
    where: { id: userId },
    select: { id: true }
  });

  if (!existing) {
    throw new Error("User not found.");
  }

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await db.user.update({
    where: { id: userId },
    data: {
      password: passwordHash,
      mustChangePassword: true,
      emailVerifiedAt: new Date()
    }
  });

  return { temporaryPassword };
}
