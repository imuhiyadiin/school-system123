/*
  Warnings:

  - Added the required column `password` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'User';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "password" TEXT NOT NULL;
