-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');

-- DropIndex
DROP INDEX "Groups_name_key";

-- AlterTable
ALTER TABLE "Attachments" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "DeviceToken" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "MessageStatus" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ParentStudent" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "ScoreEvent" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "StudentGroup" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "StudentPayment" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "StudentScore" ADD COLUMN     "tenantId" TEXT;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tenantId" TEXT;

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
    "botToken" TEXT,
    "botUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformAdmin" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlatformAdmin_phone_key" ON "PlatformAdmin"("phone");

-- CreateIndex
CREATE INDEX "Attachments_tenantId_idx" ON "Attachments"("tenantId");

-- CreateIndex
CREATE INDEX "Chat_tenantId_idx" ON "Chat"("tenantId");

-- CreateIndex
CREATE INDEX "ChatMember_tenantId_idx" ON "ChatMember"("tenantId");

-- CreateIndex
CREATE INDEX "DeviceToken_tenantId_idx" ON "DeviceToken"("tenantId");

-- CreateIndex
CREATE INDEX "Groups_tenantId_idx" ON "Groups"("tenantId");

-- CreateIndex
CREATE INDEX "Message_tenantId_idx" ON "Message"("tenantId");

-- CreateIndex
CREATE INDEX "MessageStatus_tenantId_idx" ON "MessageStatus"("tenantId");

-- CreateIndex
CREATE INDEX "ParentStudent_tenantId_idx" ON "ParentStudent"("tenantId");

-- CreateIndex
CREATE INDEX "ScoreEvent_tenantId_idx" ON "ScoreEvent"("tenantId");

-- CreateIndex
CREATE INDEX "Session_tenantId_idx" ON "Session"("tenantId");

-- CreateIndex
CREATE INDEX "StudentGroup_tenantId_idx" ON "StudentGroup"("tenantId");

-- CreateIndex
CREATE INDEX "StudentPayment_tenantId_idx" ON "StudentPayment"("tenantId");

-- CreateIndex
CREATE INDEX "StudentScore_tenantId_idx" ON "StudentScore"("tenantId");

-- CreateIndex
CREATE INDEX "Users_tenantId_idx" ON "Users"("tenantId");

-- AddForeignKey
ALTER TABLE "Users" ADD CONSTRAINT "Users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceToken" ADD CONSTRAINT "DeviceToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParentStudent" ADD CONSTRAINT "ParentStudent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreEvent" ADD CONSTRAINT "ScoreEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentScore" ADD CONSTRAINT "StudentScore_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPayment" ADD CONSTRAINT "StudentPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMember" ADD CONSTRAINT "ChatMember_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachments" ADD CONSTRAINT "Attachments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
