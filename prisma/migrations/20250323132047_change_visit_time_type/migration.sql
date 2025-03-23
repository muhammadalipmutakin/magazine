/*
  Warnings:

  - The `visitTime` column on the `Visitor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Visitor" DROP COLUMN "visitTime",
ADD COLUMN     "visitTime" TIMESTAMP(3)[];
