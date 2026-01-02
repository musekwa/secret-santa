-- DropIndex
DROP INDEX "Group_name_owner_id_idx";

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Group_name_owner_id_is_active_idx" ON "Group"("name", "owner_id", "is_active");
