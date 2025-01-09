/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `AccountGroup` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `AccountGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AccountGroup" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AccountGroup_code_key" ON "AccountGroup"("code");
