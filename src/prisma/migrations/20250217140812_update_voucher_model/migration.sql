/*
  Warnings:

  - Added the required column `totalAmount` to the `Voucher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voucherAccId` to the `Voucher` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Voucher" ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "voucherAccId" TEXT NOT NULL;
