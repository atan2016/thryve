-- CreateTable
CREATE TABLE "EventHost" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "websiteUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventHost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTeacherFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTeacherFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEventHostFollow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEventHostFollow_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "TeacherUpcomingEvent"
ADD COLUMN "hostId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "EventHost_name_key" ON "EventHost"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventHost_slug_key" ON "EventHost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "UserTeacherFollow_userId_teacherId_key" ON "UserTeacherFollow"("userId", "teacherId");

-- CreateIndex
CREATE INDEX "UserTeacherFollow_userId_idx" ON "UserTeacherFollow"("userId");

-- CreateIndex
CREATE INDEX "UserTeacherFollow_teacherId_idx" ON "UserTeacherFollow"("teacherId");

-- CreateIndex
CREATE UNIQUE INDEX "UserEventHostFollow_userId_hostId_key" ON "UserEventHostFollow"("userId", "hostId");

-- CreateIndex
CREATE INDEX "UserEventHostFollow_userId_idx" ON "UserEventHostFollow"("userId");

-- CreateIndex
CREATE INDEX "UserEventHostFollow_hostId_idx" ON "UserEventHostFollow"("hostId");

-- CreateIndex
CREATE INDEX "TeacherUpcomingEvent_hostId_idx" ON "TeacherUpcomingEvent"("hostId");

-- CreateIndex
CREATE INDEX "TeacherUpcomingEvent_teacherId_eventDate_idx" ON "TeacherUpcomingEvent"("teacherId", "eventDate");

-- AddForeignKey
ALTER TABLE "TeacherUpcomingEvent"
ADD CONSTRAINT "TeacherUpcomingEvent_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "EventHost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeacherFollow"
ADD CONSTRAINT "UserTeacherFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeacherFollow"
ADD CONSTRAINT "UserTeacherFollow_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventHostFollow"
ADD CONSTRAINT "UserEventHostFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEventHostFollow"
ADD CONSTRAINT "UserEventHostFollow_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "EventHost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
