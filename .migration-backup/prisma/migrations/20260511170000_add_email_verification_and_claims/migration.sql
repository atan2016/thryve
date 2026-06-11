DO $$
BEGIN
  CREATE TYPE "PendingSignupStatus" AS ENUM ('PENDING', 'VERIFIED', 'CONSUMED', 'EXPIRED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);

UPDATE "User"
SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", NOW())
WHERE "emailVerifiedAt" IS NULL;

ALTER TABLE "Teacher"
ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "Teacher"
ADD COLUMN IF NOT EXISTS "claimEmail" TEXT;

DROP INDEX IF EXISTS "Teacher_claimEmail_key";
CREATE UNIQUE INDEX "Teacher_claimEmail_key" ON "Teacher"("claimEmail");

ALTER TABLE "Teacher"
DROP CONSTRAINT IF EXISTS "Teacher_userId_fkey";

ALTER TABLE "Teacher"
ADD CONSTRAINT "Teacher_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "PendingSignup" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "normalizedEmail" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "nextPath" TEXT,
  "teacherWebsiteUrl" TEXT,
  "teacherLinkedinUrl" TEXT,
  "teacherInstagramUrl" TEXT,
  "teacherFacebookUrl" TEXT,
  "teacherProfileImportConsent" BOOLEAN NOT NULL DEFAULT false,
  "teacherResumeUrl" TEXT,
  "teacherResumeFileName" TEXT,
  "teacherResumeMimeType" TEXT,
  "teacherResumeText" TEXT,
  "selectedProfileKind" TEXT,
  "selectedProfileId" TEXT,
  "status" "PendingSignupStatus" NOT NULL DEFAULT 'PENDING',
  "verifiedAt" TIMESTAMP(3),
  "consumedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PendingSignup_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PendingSignup_normalizedEmail_idx" ON "PendingSignup"("normalizedEmail");
CREATE INDEX IF NOT EXISTS "PendingSignup_status_idx" ON "PendingSignup"("status");

CREATE TABLE IF NOT EXISTS "EmailVerificationToken" (
  "id" TEXT NOT NULL,
  "pendingSignupId" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_pendingSignupId_idx" ON "EmailVerificationToken"("pendingSignupId");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");

ALTER TABLE "EmailVerificationToken"
DROP CONSTRAINT IF EXISTS "EmailVerificationToken_pendingSignupId_fkey";

ALTER TABLE "EmailVerificationToken"
ADD CONSTRAINT "EmailVerificationToken_pendingSignupId_fkey"
FOREIGN KEY ("pendingSignupId") REFERENCES "PendingSignup"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
