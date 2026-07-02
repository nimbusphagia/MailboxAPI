/*
  Warnings:

  - You are about to drop the column `isArchived` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "isArchived";

-- AlterTable
ALTER TABLE "ChatMember" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "imgUrl" SET DEFAULT 'https://res.cloudinary.com/dlsa973vu/image/upload/v1783002813/iconos-10_scaswx.jpg';
