/*
  Warnings:

  - You are about to drop the column `voucherAccId` on the `Voucher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Voucher" DROP CONSTRAINT "Voucher_voucherAccId_fkey";

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "voucherAccId";
