import prisma from "../config/prisma";
import type { UuidType } from "../schemas/util.schema";
import { ConflictError, NotFoundError } from "../errors";
import {
  ChatLazy,
  ChatLazySchema,
  ChatResponse,
  ChatType,
} from "../schemas/chat.schema";
import { safeUserInclude } from "./utils";

export async function getChatsById(
  currentUserId: UuidType,
): Promise<ChatLazy[]> {
  const raw = await prisma.chat.findMany({
    where: {
      isGroup: false,
      members: {
        some: {
          userId: currentUserId,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      isGroup: true,
      members: {
        where: {
          userId: {
            not: currentUserId,
          },
        },
        select: {
          user: {
            include: {
              contactOf: {
                where: { ownerId: currentUserId },
                select: { nickname: true },
                take: 1,
              },
            },
            omit: { passwordHash: true },
          },
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const mapped = raw.map((chat) => {
    const member = chat.members[0];
    const nickname = member.user?.contactOf[0]?.nickname ?? null;

    return ChatLazySchema.parse({
      ...chat,
      otherMember: { ...member.user, nickname },
      lastMessage: chat.messages[0] ?? undefined,
    });
  });
  return mapped.sort((a, b) => {
    const aDate = a.lastMessage?.createdAt ?? a.createdAt;
    const bDate = b.lastMessage?.createdAt ?? b.createdAt;
    return bDate.getTime() - aDate.getTime();
  });
}
export async function getChatById(
  id: UuidType,
  currentUserId: UuidType,
): Promise<ChatResponse> {
  const raw = await prisma.chat.findUnique({
    where: { id, isGroup: false, members: { some: { userId: currentUserId } } },
    include: { members: { select: safeUserInclude }, messages: true },
    omit: { name: true, imgUrl: true },
  });

  if (!raw) throw new NotFoundError("Chat doesn't exist");

  const { id: chatId, isGroup, createdAt, members, messages } = raw;

  const primaryRaw = members.find((m) => m.user!.id === currentUserId)?.user;
  const secondaryRaw = members.find((m) => m.user!.id !== currentUserId)?.user;

  if (!primaryRaw || !secondaryRaw)
    throw new NotFoundError("Chat members not found");

  const secondaryContact = await prisma.contact.findUnique({
    where: {
      ownerId_userId: { ownerId: currentUserId, userId: secondaryRaw.id },
    },
  });
  return {
    id: chatId,
    isGroup,
    createdAt,
    primaryMember: primaryRaw,
    secondaryMember: {
      ...secondaryRaw,
      nickname: secondaryContact ? secondaryContact.nickname : null,
    },
    messages,
  };
}

export async function createChatServ(
  contactId: UuidType,
  currentUserId: UuidType,
): Promise<ChatType> {
  const existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      AND: [
        { members: { some: { userId: currentUserId } } },
        { members: { some: { userId: contactId } } },
      ],
    },
  });
  if (existingChat) throw new ConflictError("Chat already exists");
  return prisma.chat.create({
    data: {
      isGroup: false,
      createdById: currentUserId,
      members: {
        create: [{ userId: currentUserId }, { userId: contactId }],
      },
    },
    include: {
      members: {
        include: safeUserInclude,
      },
      messages: true,
    },
    omit: {
      name: true,
      imgUrl: true,
    },
  });
}
export async function deleteChatServ(
  id: UuidType,
  currentUserId: UuidType,
): Promise<void> {
  const existingChat = await prisma.chat.findUnique({
    where: {
      id,
      createdById: currentUserId,
    },
  });
  if (!existingChat) throw new NotFoundError("Chat not found");

  await prisma.chat.delete({ where: { id } });
}
