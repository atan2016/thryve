-- Optional link; venue and time for listings.
ALTER TABLE "TeacherUpcomingEvent" ADD COLUMN "address" TEXT;
ALTER TABLE "TeacherUpcomingEvent" ADD COLUMN "eventTime" TEXT;

ALTER TABLE "TeacherUpcomingEvent" ALTER COLUMN "eventUrl" DROP NOT NULL;
