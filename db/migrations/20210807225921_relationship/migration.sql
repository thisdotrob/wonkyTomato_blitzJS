/*
  Warnings:

  - You are about to drop the column `pomodoroId` on the `Task` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_pomodoroId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "pomodoroId",
ALTER COLUMN "detail" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_PomodoroToTask" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PomodoroToTask_AB_unique" ON "_PomodoroToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_PomodoroToTask_B_index" ON "_PomodoroToTask"("B");

-- AddForeignKey
ALTER TABLE "_PomodoroToTask" ADD FOREIGN KEY ("A") REFERENCES "Pomodoro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PomodoroToTask" ADD FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
