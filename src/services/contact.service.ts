import prisma from "../config/prisma";
import type { UuidType } from "../schemas/util.schema";
import { ConflictError, NotFoundError, ValidationError } from "../errors";
import {
  ContactNicknameInput,
  ContactOutput,
  ContactType,
} from "../schemas/contact.schema";
import { safeUserInclude } from "./utils";

export async function getContactsById(
  currentUserId: UuidType,
): Promise<ContactType[]> {
  return prisma.contact.findMany({
    where: { ownerId: currentUserId, isBlocked: false },
    include: safeUserInclude,
  });
}
export async function getBlockedContacts(
  currentUserId: UuidType,
): Promise<ContactType[]> {
  return prisma.contact.findMany({
    where: { ownerId: currentUserId, isBlocked: true },
    include: safeUserInclude,
  });
}
export async function getContactById(
  contactId: UuidType,
  currentUserId: UuidType,
): Promise<ContactType> {
  const contact = await prisma.contact.findUnique({
    where: { ownerId_userId: { ownerId: currentUserId, userId: contactId } },
    include: safeUserInclude,
  });
  if (!contact) throw new NotFoundError("Contact not found");
  return contact;
}
export async function createContact(
  userId: UuidType,
  currentUserId: UuidType,
): Promise<ContactType> {
  if (userId === currentUserId)
    throw new ValidationError("Cannot add yourself");
  const existingContact = await prisma.contact.findUnique({
    where: {
      ownerId_userId: { ownerId: currentUserId, userId },
    },
  });
  if (existingContact) throw new ConflictError("Contact already exists");
  return prisma.contact.create({
    data: { ownerId: currentUserId, userId },
    include: safeUserInclude,
  });
}
export async function editNicknameServ(
  { id, nickname }: ContactNicknameInput,
  currentUserId: UuidType,
): Promise<ContactType> {
  const existingContact = await prisma.contact.findUnique({
    where: { id, ownerId: currentUserId },
  });
  if (!existingContact) throw new NotFoundError("Contact not found");

  return prisma.contact.update({
    where: { id },
    data: { nickname },
    include: safeUserInclude,
  });
}

export async function deleteContactServ(
  id: UuidType,
  currentUserId: UuidType,
): Promise<void> {
  const existingContact = await prisma.contact.findUnique({
    where: { id, ownerId: currentUserId },
  });
  if (!existingContact) throw new NotFoundError("Contact not found");

  await prisma.contact.delete({ where: { id } });
}
export async function toggleBlock(
  id: UuidType,
  currentUserId: UuidType,
): Promise<ContactOutput> {
  const existingContact = await prisma.contact.findUnique({
    where: { id, ownerId: currentUserId },
  });
  if (!existingContact) throw new NotFoundError("Contact not found");

  return prisma.contact.update({
    where: { id },
    data: { isBlocked: !existingContact.isBlocked },
  });
}
