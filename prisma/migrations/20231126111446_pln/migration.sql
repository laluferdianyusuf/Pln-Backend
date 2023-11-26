-- DropForeignKey
ALTER TABLE `Report` DROP FOREIGN KEY `Report_dailyRecapId_fkey`;

-- AlterTable
ALTER TABLE `Report` MODIFY `dailyRecapId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_dailyRecapId_fkey` FOREIGN KEY (`dailyRecapId`) REFERENCES `DailyRecap`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
