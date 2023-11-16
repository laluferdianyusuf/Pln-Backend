-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('HARIAN', 'MINGGUAN', 'BULANAN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'employee',
    "status" TEXT NOT NULL DEFAULT 'alpha',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "createdById" INTEGER NOT NULL,
    "createdAt" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "dailyRecaptId" INTEGER,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRecapt" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "DailyRecapt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRecapt_email_key" ON "DailyRecapt"("email");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_dailyRecaptId_fkey" FOREIGN KEY ("dailyRecaptId") REFERENCES "DailyRecapt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRecapt" ADD CONSTRAINT "DailyRecapt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
