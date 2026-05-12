-- AlterTable
ALTER TABLE "Teacher"
ADD COLUMN "websiteUrl" TEXT,
ADD COLUMN "linkedinUrl" TEXT,
ADD COLUMN "instagramUrl" TEXT,
ADD COLUMN "facebookUrl" TEXT,
ADD COLUMN "resumeUrl" TEXT,
ADD COLUMN "resumeFileName" TEXT,
ADD COLUMN "resumeMimeType" TEXT,
ADD COLUMN "profileImportConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "profileImportRequestedAt" TIMESTAMP(3),
ADD COLUMN "profileImportCompletedAt" TIMESTAMP(3),
ADD COLUMN "profileImportStatus" TEXT,
ADD COLUMN "profileImportNotes" TEXT;
