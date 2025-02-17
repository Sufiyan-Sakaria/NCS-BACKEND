/*
  Warnings:

  - You are about to drop the column `date` on the `Ledger` table. All the data in the column will be lost.
  - Changed the type of `transactionType` on the `Ledger` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Ledger" DROP COLUMN "date",
DROP COLUMN "transactionType",
ADD COLUMN     "transactionType" TEXT NOT NULL,
ALTER COLUMN "previousBalance" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_voucherAccId_fkey" FOREIGN KEY ("voucherAccId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
