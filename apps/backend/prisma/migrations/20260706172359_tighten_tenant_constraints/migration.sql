-- DropForeignKey
ALTER TABLE "Attachments" DROP CONSTRAINT "Attachments_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMember" DROP CONSTRAINT "ChatMember_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "DeviceToken" DROP CONSTRAINT "DeviceToken_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "MessageStatus" DROP CONSTRAINT "MessageStatus_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ParentStudent" DROP CONSTRAINT "ParentStudent_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ScoreEvent" DROP CONSTRAINT "ScoreEvent_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StudentGroup" DROP CONSTRAINT "StudentGroup_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StudentPayment" DROP CONSTRAINT "StudentPayment_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "StudentScore" DROP CONSTRAINT "StudentScore_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Users" DROP CONSTRAINT "Users_tenantId_fkey";

-- DropIndex
DROP INDEX "ScoreEvent_studentId_groupId_type_date_idx";

-- DropIndex
DROP INDEX "ScoreEvent_tenantId_idx";

-- AlterTable
ALTER TABLE "Attachments" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ChatMember" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "DeviceToken" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Groups" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "MessageStatus" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ParentStudent" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ScoreEvent" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Session" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentGroup" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentPayment" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StudentScore" ALTER COLUMN "tenantId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "tenantId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Groups_tenantId_name_key" ON "Groups"("tenantId", "name");

-- CreateIndex
CREATE INDEX "ScoreEvent_tenantId_studentId_groupId_type_date_idx" ON "ScoreEvent"("tenantId", "studentId", "groupId", "type", "date");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPayment" ADD CONSTRAINT "StudentPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

