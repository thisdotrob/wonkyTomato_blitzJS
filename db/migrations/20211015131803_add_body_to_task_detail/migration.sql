/*
  Warnings:

  - Added the required column `body` to the `TaskDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskDetail" ADD COLUMN     "body" TEXT NOT NULL;
