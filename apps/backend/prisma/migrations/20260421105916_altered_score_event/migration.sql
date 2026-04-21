/*
  Warnings:

  - A unique constraint covering the columns `[studentId,groupId,type,date]` on the table `ScoreEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `date` to the `ScoreEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ScoreEvent_groupId_idx";

-- DropIndex
DROP INDEX "ScoreEvent_studentId_idx";

-- DropIndex
DROP INDEX "ScoreEvent_studentId_type_groupId_idx";

-- AlterTable
ALTER TABLE "ScoreEvent" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "ScoreEvent_studentId_groupId_type_date_idx" ON "ScoreEvent"("studentId", "groupId", "type", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreEvent_studentId_groupId_type_date_key" ON "ScoreEvent"("studentId", "groupId", "type", "date");
