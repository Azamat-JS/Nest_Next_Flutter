-- DropForeignKey
ALTER TABLE "ScoreEvent" DROP CONSTRAINT "ScoreEvent_groupId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreEvent" DROP CONSTRAINT "ScoreEvent_studentId_fkey";

-- DropForeignKey
ALTER TABLE "StudentScore" DROP CONSTRAINT "StudentScore_groupId_fkey";

-- DropForeignKey
ALTER TABLE "StudentScore" DROP CONSTRAINT "StudentScore_studentId_fkey";

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
