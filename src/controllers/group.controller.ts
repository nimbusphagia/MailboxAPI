import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ValidationError } from "../errors";
import { GroupChatInputSchema } from "../schemas/chat.schema";
import {
  createGroupChatServ,
  createMember,
  deleteGroupMember,
  editGroupInfoServ,
  editGroupMemberRole,
  getGroupChatById,
  getGroupChatsById,
} from "../services/group.service";
import { UuidSchema } from "../schemas/util.schema";
import {
  ChatMemberDeleteSchema,
  ChatMemberEditSchema,
  ChatMemberInputSchema,
} from "../schemas/member.schema";
import { uploadImage } from "../utils/uploadImage";

export async function createGroupChat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = GroupChatInputSchema.parse(req.body);
    if (req.file) {
      const result: any = await uploadImage(req.file.buffer, "msg");
      data.imgUrl = result.secure_url;
    }
    const groupChat = await createGroupChatServ(data, currentUserId);
    res.status(201).json(groupChat);
  } catch (err) {
    next(err);
  }
}

export async function editGroupInfo(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = GroupChatInputSchema.parse({ id: req.params.id, ...req.body });
    const contact = await editGroupInfoServ(data, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}

export async function getGroups(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const groups = await getGroupChatsById(currentUserId);
    res.status(200).json(groups);
  } catch (err) {
    next(err);
  }
}

export async function getGroup(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const chatId = UuidSchema.parse(req.params.id);
    const chat = await getGroupChatById(chatId, currentUserId);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
}

export async function createGroupMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = ChatMemberInputSchema.parse(req.body);
    const member = await createMember(data, currentUserId);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

export async function editMemberRole(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = ChatMemberEditSchema.parse({
      id: req.params.memberId,
      ...req.body,
    });
    const member = await editGroupMemberRole(data, currentUserId);
    res.status(200).json(member);
  } catch (err) {
    next(err);
  }
}
export async function deleteMember(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = ChatMemberDeleteSchema.parse({
      id: req.params.memberId,
      ...req.body,
    });
    await deleteGroupMember(data, currentUserId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
