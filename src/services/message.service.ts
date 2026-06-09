import prisma from "../config/prisma";
import { NotFoundError } from "../errors";
import { ChatResponse, GroupResponse } from "../schemas/chat.schema";
import type { MessageCreate, MessageType } from "../schemas/message.schema";
import { UuidType } from "../schemas/util.schema";
import { getChatById } from "./chat.service";
import { getGroupChatById } from "./group.service";

export async function createMessage(
  data: MessageCreate,
  currentUserId: UuidType,
): Promise<ChatResponse | GroupResponse> {
  const existingChat = await prisma.chat.findUnique({
    where: {
      id: data.chatId,
      members: {
        some: { userId: currentUserId },
      },
    },
  });
  if (!existingChat) throw new NotFoundError("Chat not found");
  await prisma.chatMessage.create({
    data: { ...data, senderId: currentUserId },
  });
  return existingChat.isGroup
    ? getGroupChatById(data.chatId, currentUserId)
    : getChatById(data.chatId, currentUserId);
}

export async function editMessage(
  id: UuidType,
  data: MessageCreate,
  currentUserId: UuidType,
): Promise<MessageType> {
  const message = await prisma.chatMessage.findUnique({
    where: {
      id,
      chatId: data.chatId,
      senderId: currentUserId,
    },
  });
  if (!message) throw new NotFoundError("Message not found");
  return prisma.chatMessage.update({ where: { id }, data });
}

export async function deleteMessageServ(
  id: UuidType,
  currentUserId: UuidType,
): Promise<void> {
  const existingMessage = await prisma.chatMessage.findUnique({
    where: {
      id,
      senderId: currentUserId,
    },
  });
  if (!existingMessage) throw new NotFoundError("Message not found");

  await prisma.chatMessage.delete({ where: { id, senderId: currentUserId } });
}
export async function readMessage(
  id: UuidType,
  currentUserId: UuidType,
): Promise<void> {
  const existingMessage = await prisma.chatMessage.findUnique({
    where: {
      id,
      senderId: currentUserId,
    },
  });
  if (!existingMessage) throw new NotFoundError("Message not found");

  await prisma.chatMessage.update({
    where: { id, senderId: currentUserId },
    data: { isRead: true },
  });
}
