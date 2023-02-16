/*
  Warnings:

  - The `isPositive` column on the `CommentLike` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `isPositive` column on the `Like` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CommentLike" DROP COLUMN "isPositive",
ADD COLUMN     "isPositive" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Like" DROP COLUMN "isPositive",
ADD COLUMN     "isPositive" INTEGER NOT NULL DEFAULT 0;
