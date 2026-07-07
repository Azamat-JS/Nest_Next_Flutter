-- CreateTable
CREATE TABLE "WaitingList" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "WaitingList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaitingList_phone_idx" ON "WaitingList"("phone");

-- CreateIndex
CREATE INDEX "WaitingList_tenantId_idx" ON "WaitingList"("tenantId");

-- AddForeignKey
ALTER TABLE "WaitingList" ADD CONSTRAINT "WaitingList_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
