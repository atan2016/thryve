-- Store profile photos in Postgres for serverless hosts (disk uploads are not persistent).
ALTER TABLE "Teacher" ADD COLUMN "avatarImage" BYTEA;
ALTER TABLE "Teacher" ADD COLUMN "avatarImageMimeType" TEXT;
