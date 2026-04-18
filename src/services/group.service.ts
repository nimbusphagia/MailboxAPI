import prisma from "../config/prisma";
import { GroupChatInput, GroupChatType } from "../schemas/chat.schema";
import { UuidType } from "../schemas/util.schema";
import { safeUserInclude } from "./utils";
import { NotFoundError, ConflictError, ForbiddenError } from "../errors";
import { ChatMemberDelete, ChatMemberInput, ChatMemberOutput, ChatMemberEdit } from "../schemas/member.schema";
import { ChatMember } from "../generated/prisma/client";

export async function getGroupChatById(id: UuidType, currentUserId: UuidType): Promise<GroupChatType> {
  const chat = await prisma.chat.findUnique({
    where: {
      id,
      isGroup: true,
      members: {
        some: {
          userId: currentUserId,
        }
      }
    },
    include: {
      members: {
        include: safeUserInclude
      },
      messages: true,
    }
  });
  if (!chat) throw new NotFoundError("Chat doesn't exist");
  return chat;
}

export async function createGroupChatServ({ name, imgUrl }: GroupChatInput, currentUserId: UuidType): Promise<GroupChatType> {
  const existingGroup = await prisma.chat.findFirst({
    where: {
      isGroup: true,
      createdById: currentUserId,
      name,
    },
  });
  if (existingGroup) throw new ConflictError("Chat already exists");
  return prisma.chat.create({
    data: {
      isGroup: true,
      createdById: currentUserId,
      name,
      imgUrl,
      members: {
        create: [
          { userId: currentUserId },
        ]
      }
    },
    include: {
      members: {
        include: safeUserInclude
      },
      messages: true,
    }
  });
}


export async function editGroupInfoServ({ name, imgUrl, id }: GroupChatInput, currentUserId: UuidType): Promise<GroupChatType> {
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
export async function createGroupMember({ chatId, userId }: ChatMemberInput, currentUserId: UuidType): Promise<ChatMemberOutput> {
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      isGroup: true,
      members: {
        some: {
          userId: currentUserId,
          role: { in: ["OWNER", "ADMIN"] }
        }
      }
    },
  });
  if (!groupChat) throw new NotFoundError("Invalid group id");

  const existingMember = await prisma.chatMember.findFirst({
    where: { chatId, userId }
  });
  if (existingMember) throw new ConflictError("Member already exists");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError("User not found");

  return prisma.chatMember.create({
    data: {
      chatId,
      userId
    },
    select: {
      userId: true,
      chatId: true,
      role: true
    }
  });
}
export async function deleteGroupMember({ id, chatId }: ChatMemberDelete, currentUserId: UuidType): Promise<void> {
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      AND: [
        {
          members: {
            some: {
              userId: currentUserId,
              role: { in: ["OWNER", "ADMIN"] }
            }
          }
        },
        {
          members: {
            some: { id }
          }
        }
      ]
    }
  });
  if (!groupChat) throw new NotFoundError("Invalid group or member");

  const memberToDelete = await prisma.chatMember.findUnique({ where: { id } });
  if (memberToDelete?.role === "OWNER") throw new ForbiddenError("Cannot remove the owner");

  await prisma.chatMember.delete({ where: { id } });
}

export async function editGroupMemberRole({ id, chatId, role }: ChatMemberEdit, currentUserId: UuidType): Promise<ChatMember> {
  const groupChat = await prisma.chat.findUnique({
    where: {
      id: chatId,
      AND: [
        {
          members: {
            some: {
              userId: currentUserId,
              role: "OWNER"
            }
          }
        },
        {
          members: {
            some: { id }
          }
        }
      ]
    }
  });
  if (!groupChat) throw new NotFoundError("Invalid group or member");

  const memberToEdit = await prisma.chatMember.findUnique({ where: { id } });
  if (memberToEdit?.userId === currentUserId) throw new ForbiddenError("Cannot change your own role");

  return prisma.chatMember.update({ where: { id }, data: { role } });
}
