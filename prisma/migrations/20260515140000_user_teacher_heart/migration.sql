-- CreateTable
CREATE TABLE "UserTeacherHeart" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTeacherHeart_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTeacherHeart_userId_teacherId_key" ON "UserTeacherHeart"("userId", "teacherId");

-- CreateIndex
CREATE INDEX "UserTeacherHeart_userId_idx" ON "UserTeacherHeart"("userId");

-- CreateIndex
CREATE INDEX "UserTeacherHeart_teacherId_idx" ON "UserTeacherHeart"("teacherId");

-- AddForeignKey
ALTER TABLE "UserTeacherHeart" ADD CONSTRAINT "UserTeacherHeart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeacherHeart" ADD CONSTRAINT "UserTeacherHeart_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
