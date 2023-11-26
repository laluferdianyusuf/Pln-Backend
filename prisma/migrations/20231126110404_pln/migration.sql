/*
  Warnings:

  - Made the column `dailyRecapId` on table `Report` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_dailyRecapId_fkey`;

-- AlterTable
ALTER TABLE `Report` MODIFY `dailyRecapId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_dailyRecapId_fkey` FOREIGN KEY (`dailyRecapId`) REFERENCES `DailyRecap`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
