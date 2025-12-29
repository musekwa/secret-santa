/*
  Warnings:

  - A unique constraint covering the columns `[name,owner_id]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,group_id]` on the table `Participant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_owner_id_key" ON "Group"("name", "owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_code_key" ON "Participant"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Participant_user_id_group_id_key" ON "Participant"("user_id", "group_id");
