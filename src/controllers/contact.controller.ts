import { NextFunction, Request, Response } from "express";
import { UuidSchema } from "../schemas/util.schema";
import { UnauthorizedError } from "../errors";
import {
  createContact,
  deleteContactServ,
  editNicknameServ,
  getBlockedContacts,
  getContactById,
  getContactsById,
  toggleBlock,
} from "../services/contact.service";
import { ContactNicknameInputSchema } from "../schemas/contact.schema";

export async function getAll(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contacts = await getContactsById(currentUserId);
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
}
export async function getBlocked(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contacts = await getBlockedContacts(currentUserId);
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
}
export async function getById(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contactId = UuidSchema.parse(req.params.contactId);
    const contact = await getContactById(contactId, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}
export async function create(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const userId = UuidSchema.parse(req.body.userId);
    const contact = await createContact(userId, currentUserId);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}
export async function editNickname(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const data = ContactNicknameInputSchema.parse({
      id: req.params.contactId,
      ...req.body,
    });
    const contact = await editNicknameServ(data, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}
export async function deleteContact(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contactId = UuidSchema.parse(req.params.contactId);
    await deleteContactServ(contactId, currentUserId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
export async function toggleIsBlocked(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.user) throw new UnauthorizedError("Not authenticated");
    const currentUserId = req.user.id;
    const contactId = UuidSchema.parse(req.params.contactId);
    const contact = await toggleBlock(contactId, currentUserId);
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}
