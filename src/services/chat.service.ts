import prisma from "../config/prisma";
import type { UuidType } from "../schemas/util.schema";
import { ConflictError, NotFoundError } from "../errors";
import { ChatLazy, ChatLazySchema, ChatResponse } from "../schemas/chat.schema";
import { safeUserInclude } from "./utils";
import { Prisma } from "../generated/prisma/client";

export async function getChatsById(
  currentUserId: UuidType,
  isArchived?: boolean,
): Promise<ChatLazy[]> {
  const raw = await prisma.chat.findMany({
    where: {
      isGroup: false,
      members: {
        some: {
          userId: currentUserId,
          isArchived: isArchived ?? false,
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
                select: { nickname: true, isBlocked: true },
                take: 1,
              },
              contacts: {
                where: { userId: currentUserId },
                select: { isBlocked: true },
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
    const isBlocked = Boolean(
      member.user?.contactOf[0]?.isBlocked ||
      member.user?.contacts[0]?.isBlocked,
    );

    return ChatLazySchema.parse({
      ...chat,
      isArchived: isArchived ?? false,
      isBlocked,
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
    include: {
      members: { select: memberSelect },
      messages: chatMessagesInclude,
    },
    omit: { name: true, imgUrl: true },
  });
  if (!raw) throw new NotFoundError("Chat doesn't exist");
  return buildChatResponse(raw, currentUserId);
}

export async function createChatServ(
  contactId: UuidType,
  currentUserId: UuidType,
): Promise<ChatResponse> {
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

  const raw = await prisma.chat.create({
    data: {
      isGroup: false,
      createdById: currentUserId,
      members: {
        create: [{ userId: currentUserId }, { userId: contactId }],
      },
    },
    include: {
      members: { select: memberSelect },
      messages: chatMessagesInclude,
    },
    omit: { name: true, imgUrl: true },
  });

  return buildChatResponse(raw, currentUserId);
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
export async function toggleArchived(
  chatId: UuidType,
  currentUserId: UuidType,
): Promise<void> {
  const chatMember = await prisma.chatMember.findFirst({
    where: {
      chatId,
      userId: currentUserId,
    },
    select: {
      id: true,
      isArchived: true,
    },
  });
  if (!chatMember) throw new NotFoundError("Chat member not found");
  await prisma.chatMember.update({
    where: { id: chatMember.id },
    data: { isArchived: !chatMember.isArchived },
  });
}

/* Helper functions*/
type ChatWithRelations = Prisma.ChatGetPayload<{
  include: {
    members: { select: typeof memberSelect };
    messages: {
      include: {
        replyTo: { include: { sender: { omit: { passwordHash: true } } } };
      };
    };
  };
  omit: { name: true; imgUrl: true };
}>;

const memberSelect = { ...safeUserInclude, isArchived: true };

const chatMessagesInclude = {
  include: {
    replyTo: {
      include: {
        sender: { omit: { passwordHash: true } as const },
      },
    },
  },
};

async function buildChatResponse(
  raw: ChatWithRelations,
  currentUserId: UuidType,
): Promise<ChatResponse> {
  const { id: chatId, isGroup, createdAt, members, messages } = raw;

  const primaryRaw = members.find((m) => m.user!.id === currentUserId);
  const secondaryRaw = members.find((m) => m.user!.id !== currentUserId);
  if (!primaryRaw?.user || !secondaryRaw?.user)
    throw new NotFoundError("Chat members not found");

  const contactPair = await prisma.contact.findMany({
    where: {
      OR: [
        { ownerId: currentUserId, userId: secondaryRaw.user.id },
        { ownerId: secondaryRaw.user.id, userId: currentUserId },
      ],
    },
  });

  const secondaryContact = contactPair.find((c) => c.ownerId === currentUserId);
  const isBlocked = contactPair.some((c) => c.isBlocked);

  const replyToSenderIds = [
    ...new Set(
      messages
        .map((m) => m.replyTo?.senderId)
        .filter((sid): sid is string => !!sid),
    ),
  ];

  const replyToContacts = replyToSenderIds.length
    ? await prisma.contact.findMany({
        where: { ownerId: currentUserId, userId: { in: replyToSenderIds } },
      })
    : [];

  const replyToContactMap = new Map(
    replyToContacts.map((c) => [c.userId, c.nickname]),
  );

  const messagesWithReply = messages.map((message) => {
    if (!message.replyTo) return { ...message, replyTo: undefined };
    const { sender, ...replyToRest } = message.replyTo;
    const replyToNickname = sender
      ? (replyToContactMap.get(sender.id) ?? null)
      : null;
    return {
      ...message,
      replyTo: {
        ...replyToRest,
        sender: sender ? { ...sender, nickname: replyToNickname } : null,
      },
    };
  });

  return {
    id: chatId,
    isGroup,
    isArchived: primaryRaw.isArchived,
    isBlocked,
    createdAt,
    primaryMember: primaryRaw.user,
    secondaryMember: {
      ...secondaryRaw.user,
      nickname: secondaryContact ? secondaryContact.nickname : null,
    },
    messages: messagesWithReply,
  };
}
