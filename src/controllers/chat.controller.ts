import { NextFunction, Request, Response } from "express";
import { UuidSchema } from "../schemas/util.schema";
import { UnauthorizedError } from "../errors";
import {
  createChatServ,
  deleteChatServ,
  getChatById,
  getChatsById,
} from "../services/chat.service";

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const isArchived: boolean = !!req.query.archived;
    const chats = await getChatsById(currentUserId, isArchived);
    res.status(200).json(chats);
  } catch (err) {
    next(err);
  }
}
export async function getChat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const chatId = UuidSchema.parse(req.params.id);
    const chat = await getChatById(chatId, currentUserId);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
}

export async function createChat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contactId = UuidSchema.parse(req.body.contactId);
    const chat = await createChatServ(contactId, currentUserId);
    res.status(201).json(chat);
  } catch (err) {
    next(err);
  }
}
export async function deleteChat(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const chatId = UuidSchema.parse(req.params.id);
    await deleteChatServ(chatId, currentUserId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
