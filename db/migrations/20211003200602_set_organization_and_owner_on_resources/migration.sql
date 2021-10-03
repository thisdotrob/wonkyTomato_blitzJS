/*
  Warnings:

  - Added the required column `membershipId` to the `BreakTime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `BreakTime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipId` to the `Pomodoro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Pomodoro` table without a default value. This is not possible if the table is not empty.
  - Added the required column `membershipId` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BreakTime" ADD COLUMN     "membershipId" INTEGER NOT NULL,
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pomodoro" ADD COLUMN     "membershipId" INTEGER NOT NULL,
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "membershipId" INTEGER NOT NULL,
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Pomodoro" ADD CONSTRAINT "Pomodoro_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pomodoro" ADD CONSTRAINT "Pomodoro_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakTime" ADD CONSTRAINT "BreakTime_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BreakTime" ADD CONSTRAINT "BreakTime_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
