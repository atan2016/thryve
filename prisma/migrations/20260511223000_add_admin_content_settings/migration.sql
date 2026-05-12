CREATE TABLE IF NOT EXISTS "AdminContentSettings" (
  "id" TEXT NOT NULL,
  "hiddenEventKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "hiddenJobKeywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AdminContentSettings_pkey" PRIMARY KEY ("id")
);
