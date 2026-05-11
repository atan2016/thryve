CREATE TABLE "TeacherCalendarSession" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherCalendarSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TeacherCalendarSession_teacherId_startsAt_idx" ON "TeacherCalendarSession"("teacherId", "startsAt");
CREATE INDEX "TeacherCalendarSession_teacherId_isBooked_idx" ON "TeacherCalendarSession"("teacherId", "isBooked");

ALTER TABLE "TeacherCalendarSession"
ADD CONSTRAINT "TeacherCalendarSession_teacherId_fkey"
FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
