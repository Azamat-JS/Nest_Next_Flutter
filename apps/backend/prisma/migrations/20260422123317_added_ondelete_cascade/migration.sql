-- DropForeignKey
ALTER TABLE "StudentGroup" DROP CONSTRAINT "StudentGroup_groupId_fkey";

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
