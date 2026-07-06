-- DropIndex (username is no longer unique now that it becomes firstName)
DROP INDEX "Users_username_key";

-- RenameColumn
ALTER TABLE "Users" RENAME COLUMN "username" TO "firstName";

-- AddColumn
ALTER TABLE "Users" ADD COLUMN "lastName" TEXT;

-- RenameColumn
ALTER TABLE "Users" RENAME COLUMN "email" TO "phone";

-- RenameIndex (keep phone unique + indexed, matching prior email constraints)
ALTER INDEX "Users_email_key" RENAME TO "Users_phone_key";
ALTER INDEX "Users_email_idx" RENAME TO "Users_phone_idx";
