/*
  Warnings:

  - You are about to drop the column `paidAt` on the `StudentPayment` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `StudentPayment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StudentPayment" DROP COLUMN "paidAt",
DROP COLUMN "status";

-- DropEnum
DROP TYPE "PaymentStatus";
