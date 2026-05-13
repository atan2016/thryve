-- Remove all teachers marked not certified and their linked TEACHER user accounts.
-- Child rows (stories, sessions, follows, etc.) cascade from Teacher.

BEGIN;

CREATE TEMP TABLE "_not_cert_teacher_ids" AS
SELECT "id"
FROM "Teacher"
WHERE "certificationStatus" = 'not_certified';

CREATE TEMP TABLE "_not_cert_teacher_user_ids" AS
SELECT DISTINCT "userId" AS "id"
FROM "Teacher"
WHERE "certificationStatus" = 'not_certified'
  AND "userId" IS NOT NULL;

-- Pending email verifications that pointed at a teacher row we are deleting
DELETE FROM "PendingSignup" ps
USING "_not_cert_teacher_ids" t
WHERE ps."selectedProfileKind" = 'teacher'
  AND ps."selectedProfileId" = t."id";

DELETE FROM "Teacher"
WHERE "id" IN (SELECT "id" FROM "_not_cert_teacher_ids");

DELETE FROM "User" u
WHERE u."id" IN (SELECT "id" FROM "_not_cert_teacher_user_ids")
  AND u."role" = 'TEACHER'::"Role";

COMMIT;
