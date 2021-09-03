-- CreateTable
CREATE TABLE "Config" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pomodoroLength" INTEGER NOT NULL,
    "breaks" INTEGER[],
    "pomodorosPerDay" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    PRIMARY KEY ("id")
);
