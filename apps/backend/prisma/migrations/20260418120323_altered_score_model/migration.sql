/*
  Warnings:

  - A unique constraint covering the columns `[studentId,groupId]` on the table `StudentScore` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupId` to the `StudentScore` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentScore" ADD COLUMN     "groupId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "StudentScore_groupId_idx" ON "StudentScore"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentScore_studentId_groupId_key" ON "StudentScore"("studentId", "groupId");

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
