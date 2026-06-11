-- Event category chosen by the teacher when creating a listing (homepage chips use the same labels).
ALTER TABLE "TeacherUpcomingEvent" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'Workshop';
