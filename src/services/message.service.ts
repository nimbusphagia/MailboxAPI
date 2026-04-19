import prisma from "../config/prisma";
import { NotFoundError } from "../errors";
import type { MessageCreate, MessageType } from "../schemas/message.schema";
import { UuidType } from "../schemas/util.schema";

export async function createMessage(data: MessageCreate, currentUserId: UuidType): Promise<MessageType> {
  const existingChat = await prisma.chat.findUnique({
    where: {
      id: data.chatId,
      members: {
        some: { id: currentUserId },
      }
    }
  });
  if (!existingChat) throw new NotFoundError("Chat not found");
  return prisma.chatMessage.create({ data });
}

export async function editMessage(id: UuidType, data: MessageCreate, currentUserId: UuidType): Promise<MessageType> {
  const message = prisma.chatMessage.findUnique({
    where: {
      id,
      chatId: data.chatId,
      senderId: currentUserId
    }
  });
  if (!message) throw new NotFoundError("Message not found");
  return prisma.chatMessage.update({ where: { id }, data });
}

export async function deleteMessageServ(id: UuidType, currentUserId: UuidType): Promise<void> {
  const existingMessage = await prisma.chatMessage.findUnique({
    where: {
      id,
      senderId: currentUserId,
    }
  });
  if (!existingMessage) throw new NotFoundError("Message not found");

  await prisma.chatMessage.delete({ where: { id, senderId: currentUserId } });
}

