-- CreateTable
CREATE TABLE "GroupLessonSchedule" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupLessonSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupLessonSchedule_groupId_idx" ON "GroupLessonSchedule"("groupId");

-- CreateIndex
CREATE INDEX "GroupLessonSchedule_tenantId_idx" ON "GroupLessonSchedule"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "GroupLessonSchedule_groupId_dayOfWeek_key" ON "GroupLessonSchedule"("groupId", "dayOfWeek");

-- AddForeignKey
ALTER TABLE "GroupLessonSchedule" ADD CONSTRAINT "GroupLessonSchedule_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupLessonSchedule" ADD CONSTRAINT "GroupLessonSchedule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
