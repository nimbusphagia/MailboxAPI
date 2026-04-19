import { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../errors";
import { UuidSchema } from "../schemas/util.schema";
import { createMessage, deleteMessageServ, editMessage } from "../services/message.service";
import { MessageCreateSchema } from "../schemas/message.schema";

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const userId = MessageCreateSchema.parse(req.body);
    const message = await createMessage(userId, currentUserId);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}
export async function edit(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const messageId = UuidSchema.parse(req.params.messageId);
    const data = MessageCreateSchema.parse(req.body);
    const chat = await editMessage(messageId, data, currentUserId);
    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
}
export async function deleteMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id
    const messageId = UuidSchema.parse(req.params.messageId);
    await deleteMessageServ(messageId, currentUserId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

