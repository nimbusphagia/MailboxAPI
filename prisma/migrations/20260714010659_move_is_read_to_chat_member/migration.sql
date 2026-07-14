/*
  Warnings:

  - You are about to drop the column `isRead` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "isRead";
