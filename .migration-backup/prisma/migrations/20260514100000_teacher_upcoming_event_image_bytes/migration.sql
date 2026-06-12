-- Store optional event flyer bytes in the database (served via /api/teacher-upcoming-events/[id]/image).
ALTER TABLE "TeacherUpcomingEvent" ADD COLUMN "eventImage" BYTEA;
ALTER TABLE "TeacherUpcomingEvent" ADD COLUMN "eventImageMimeType" TEXT;
