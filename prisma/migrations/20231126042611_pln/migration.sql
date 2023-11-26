-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_dailyRecaptId_fkey`;

-- AlterTable
ALTER TABLE `Report` MODIFY `dailyRecaptId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_dailyRecaptId_fkey` FOREIGN KEY (`dailyRecaptId`) REFERENCES `DailyRecapt`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
