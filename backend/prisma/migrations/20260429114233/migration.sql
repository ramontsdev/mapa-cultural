/*
  Warnings:

  - You are about to drop the column `priceInfo` on the `event_occurrence` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "event_occurrence" DROP COLUMN "priceInfo",
ADD COLUMN     "priceinfo" TEXT;
