import prisma from "../config/prisma";
import {
  GroupChatInput,
  GroupChatType,
  GroupLazy,
  GroupLazySchema,
  GroupResponse,
} from "../schemas/chat.schema";
import { UuidType } from "../schemas/util.schema";
import { safeUserInclude } from "./utils";
import { NotFoundError, ConflictError, ForbiddenError } from "../errors";
import {
  ChatMemberDelete,
  ChatMemberInput,
  ChatMemberOutput,
  ChatMemberEdit,
} from "../schemas/member.schema";
import { ChatMember } from "../generated/prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export async function getGroupChatsById(
  currentUserId: UuidType,
  isArchived?: boolean,
): Promise<GroupLazy[]> {
  const raw = await prisma.chat.findMany({
    where: {
      isGroup: true,
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
      name: true,
      imgUrl: true,
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  const mapped = raw.map((chat) =>
    GroupLazySchema.parse({
      ...chat,
      isArchived: isArchived ?? false,
      lastMessage: chat.messages[0] ?? undefined,
    }),
  );

  return mapped.sort((a, b) => {
    const aDate = a.lastMessage?.createdAt ?? a.createdAt;
    const bDate = b.lastMessage?.createdAt ?? b.createdAt;
    return bDate.getTime() - aDate.getTime();
  });
}

export async function getGroupChatById(
  id: UuidType,
  currentUserId: UuidType,
): Promise<GroupResponse> {
  const chat = await prisma.chat.findUnique({
    where: {
      id,
      isGroup: true,
      members: { some: { userId: currentUserId } },
    },
    include: {
      members: { include: { user: { omit: { passwordHash: true } } } },
      messages: {
        include: {
          replyTo: {
            include: {
              sender: { omit: { passwordHash: true } },
            },
          },
        },
      },
      createdBy: { omit: { passwordHash: true } },
    },
  });

  if (!chat) throw new NotFoundError("Chat doesn't exist");

  const primaryRaw = chat.members.find((m) => m.user!.id === currentUserId);
  if (!primaryRaw) throw new NotFoundError("Chat member not found");

  const primaryMember = { ...primaryRaw.user!, role: primaryRaw.role };
  const secondaryMembers = chat.members
    .filter((m) => m.user!.id !== currentUserId)
    .map((m) => ({ ...m.user!, role: m.role }));

  const contacts = await prisma.contact.findMany({
    where: {
      ownerId: currentUserId,
      userId: { in: secondaryMembers.map((m) => m.id) },
    },
  });
  const contactMap = new Map(contacts.map((c) => [c.userId, c.nickname]));

  const memberIds = new Set(
    chat.members.map((m) => m.user?.id).filter(Boolean),
  );
  const extraSenderIds = [
    ...new Set(
      chat.messages
        .map((m) => m.replyTo?.senderId)
        .filter((sid): sid is string => !!sid && !memberIds.has(sid)),
    ),
  ];

  if (extraSenderIds.length > 0) {
    const extraContacts = await prisma.contact.findMany({
      where: {
        ownerId: currentUserId,
        userId: { in: extraSenderIds },
      },
    });
    for (const c of extraContacts) {
      contactMap.set(c.userId, c.nickname);
    }
  }

  const messagesWithReply = chat.messages.map((message) => {
    if (!message.replyTo) return { ...message, replyTo: undefined };

    const { sender, ...replyToRest } = message.replyTo;
    const replyToNickname = sender ? (contactMap.get(sender.id) ?? null) : null;

    return {
      ...message,
      replyTo: {
        ...replyToRest,
        sender: sender ? { ...sender, nickname: replyToNickname } : null,
      },
    };
  });

  return {
    id: chat.id,
    isGroup: chat.isGroup,
    name: chat.name!,
    imgUrl: chat.imgUrl!,
    createdAt: chat.createdAt,
    createdBy: chat.createdBy,
    primaryMember,
    secondaryMembers: secondaryMembers.map((m) => ({
      ...m,
      nickname: contactMap.get(m.id) ?? null,
    })),
    messages: messagesWithReply,
  };
}

export async function createGroupChatServ(
  { name, imgUrl, members }: GroupChatInput,
  currentUserId: UuidType,
): Promise<GroupChatType> {
  const existingGroup = await prisma.chat.findFirst({
    where: {
      isGroup: true,
      createdById: currentUserId,
      name,
    },
  });
  if (existingGroup) throw new ConflictError("Chat already exists");
  try {
    return prisma.chat.create({
      data: {
        isGroup: true,
        createdById: currentUserId,
        name,
        imgUrl:
          imgUrl ??
          "https://res.cloudinary.com/dlsa973vu/image/upload/v1780933463/chiikawa-and-hachiwares-friendship-is-so-sweet-v0-ke02d73xppre1_cgd6q9.jpg",
        members: {
          create: [
            { userId: currentUserId, role: "OWNER" },
            ...members.map((userId) => ({ userId })),
          ],
        },
      },
      include: {
        members: {
          include: safeUserInclude,
        },
        messages: true,
      },
    });
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2003") {
      throw new NotFoundError(`One or more users not found`);
    }
    throw e;
  }
}

export async function editGroupInfoServ(
  { name, imgUrl, id }: GroupChatInput,
  currentUserId: UuidType,
): Promise<GroupChatType> {
  const chat = await prisma.chat.findUnique({
    where: {
      id,
      isGroup: true,
      createdById: currentUserId,
    },
  });

  if (!chat) throw new NotFoundError("Group chat not found");

  return prisma.chat.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(imgUrl && { imgUrl }),
    },
    include: {
      members: {
        include: safeUserInclude,
      },
      messages: true,
    },
  });
}
export async function createMember(
  { chatId, userId }: ChatMemberInput,
  currentUserId: UuidType,
): Promise<ChatMemberOutput> {
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      isGroup: true,
      members: {
        some: {
          userId: currentUserId,
          role: { in: ["OWNER", "ADMIN"] },
        },
      },
    },
  });
  if (!groupChat) throw new NotFoundError("Invalid group id");

  const existingMember = await prisma.chatMember.findFirst({
    where: { chatId, userId },
  });
  if (existingMember) throw new ConflictError("Member already exists");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  return prisma.chatMember.create({
    data: {
      chatId,
      userId,
    },
    select: {
      id: true,
      userId: true,
      chatId: true,
      role: true,
    },
  });
}
export async function deleteGroupMember(
  { id, chatId }: ChatMemberDelete,
  currentUserId: UuidType,
): Promise<void> {
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      AND: [
        {
          members: {
            some: {
              userId: currentUserId,
              role: { in: ["OWNER", "ADMIN"] },
            },
          },
        },
        {
          members: {
            some: { id },
          },
        },
      ],
    },
  });
  if (!groupChat) throw new NotFoundError("Invalid group or member");

  const memberToDelete = await prisma.chatMember.findUnique({ where: { id } });
  if (memberToDelete?.role === "OWNER")
    throw new ForbiddenError("Cannot remove the owner");

  await prisma.chatMember.delete({ where: { id } });
}

export async function editGroupMemberRole(
  { id, chatId, role }: ChatMemberEdit,
  currentUserId: UuidType,
): Promise<ChatMember> {
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      AND: [
        {
          members: {
            some: {
              userId: currentUserId,
              role: "OWNER",
            },
          },
        },
        {
          members: {
            some: { id },
          },
        },
      ],
    },
  });
  if (!groupChat) throw new NotFoundError("Invalid group or member");

  const memberToEdit = await prisma.chatMember.findUnique({ where: { id } });
  if (memberToEdit?.userId === currentUserId)
    throw new ForbiddenError("Cannot change your own role");

  return prisma.chatMember.update({ where: { id }, data: { role } });
}
