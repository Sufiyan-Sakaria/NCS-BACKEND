/*
  Warnings:

  - Added the required column `previousBalance` to the `Ledger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ledger" ADD COLUMN     "previousBalance" DOUBLE PRECISION NOT NULL;
