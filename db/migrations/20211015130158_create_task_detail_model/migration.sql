/*
  Warnings:

  - You are about to drop the column `detail` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "detail";

-- CreateTable
CREATE TABLE "TaskDetail" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "membershipId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL,

    CONSTRAINT "TaskDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskDetail" ADD CONSTRAINT "TaskDetail_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDetail" ADD CONSTRAINT "TaskDetail_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDetail" ADD CONSTRAINT "TaskDetail_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
