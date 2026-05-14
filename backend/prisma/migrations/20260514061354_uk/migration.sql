/*
  Warnings:

  - You are about to drop the column `bookingTime` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `bookingEnd` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingStart` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `durationMinutes` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Booking_bookingDate_bookingTime_idx";

-- DropIndex
DROP INDEX "Booking_customerEmail_bookingDate_idx";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "bookingTime",
ADD COLUMN     "bookingEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "bookingStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "durationMinutes" INTEGER NOT NULL,
ADD COLUMN     "graceExpiresAt" TIMESTAMP(3),
ADD COLUMN     "releaseTime" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_bookingDate_idx" ON "Booking"("bookingDate");

-- CreateIndex
CREATE INDEX "Booking_bookingStart_idx" ON "Booking"("bookingStart");

-- CreateIndex
CREATE INDEX "Booking_releaseTime_idx" ON "Booking"("releaseTime");

-- CreateIndex
CREATE INDEX "Booking_tableId_bookingStart_idx" ON "Booking"("tableId", "bookingStart");
