CREATE TABLE IF NOT EXISTS "PendingUserEmailChange" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "previousEmail" TEXT NOT NULL,
  "nextEmail" TEXT NOT NULL,
  "normalizedNextEmail" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PendingUserEmailChange_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PendingUserEmailChange_tokenHash_key" ON "PendingUserEmailChange"("tokenHash");
CREATE INDEX IF NOT EXISTS "PendingUserEmailChange_userId_idx" ON "PendingUserEmailChange"("userId");
CREATE INDEX IF NOT EXISTS "PendingUserEmailChange_normalizedNextEmail_idx" ON "PendingUserEmailChange"("normalizedNextEmail");
CREATE INDEX IF NOT EXISTS "PendingUserEmailChange_expiresAt_idx" ON "PendingUserEmailChange"("expiresAt");

ALTER TABLE "PendingUserEmailChange"
DROP CONSTRAINT IF EXISTS "PendingUserEmailChange_userId_fkey";

ALTER TABLE "PendingUserEmailChange"
ADD CONSTRAINT "PendingUserEmailChange_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
