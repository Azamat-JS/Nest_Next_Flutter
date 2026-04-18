/*
  Warnings:

  - The primary key for the `StudentScore` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "StudentScore_studentId_groupId_key";

-- AlterTable
ALTER TABLE "StudentScore" DROP CONSTRAINT "StudentScore_pkey",
ADD CONSTRAINT "StudentScore_pkey" PRIMARY KEY ("studentId", "groupId");

-- CreateIndex
CREATE INDEX "ScoreEvent_studentId_type_groupId_idx" ON "ScoreEvent"("studentId", "type", "groupId");
