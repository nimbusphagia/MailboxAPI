import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import {
  SafeUser,
  UserDelete,
  UserEditInput,
  UserEditPassword,
  UserInput,
} from "../schemas/user.schema";
import type { UuidType } from "../schemas/util.schema";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors";
import { validateService } from "./utils";
import { ProfilePicture } from "../schemas/assets.schema";
import { catchall } from "zod/mini";

export async function getUsers(): Promise<SafeUser[]> {
  return prisma.user.findMany({
    omit: {
      passwordHash: true,
    },
  });
}
export async function getUserById(id: UuidType): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true },
  });
  if (!user) throw new NotFoundError("User not found");
  return user;
}
export async function createUser({
  username,
  password,
  name,
}: UserInput): Promise<SafeUser> {
  await validateUsername(username);
  const passwordHash = await bcrypt.hash(password, 12);
  const data: {
    username: string;
    passwordHash: string;
    name: string;
    imgUrl?: string;
  } = { username, passwordHash, name };
  try {
    const profilePicture: ProfilePicture = await prisma.$queryRaw`
  SELECT * FROM "ProfilePicture" 
  ORDER BY RANDOM() 
  LIMIT 1
`;
    data.imgUrl = profilePicture.url;
  } catch (err) {
    console.error(err);
  }

  return prisma.user.create({
    data,
    omit: { passwordHash: true },
  });
}
export async function editUser(
  { id, username, name, imgUrl }: UserEditInput,
  currentUserId: UuidType,
): Promise<SafeUser> {
  validateService({ id, currentUserId });
  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existingUser) throw new NotFoundError("User not found");

  if (username) await validateUsername(username);

  const data = {
    ...(username !== undefined && { username }),
    ...(name !== undefined && { name }),
    ...(imgUrl !== undefined && { imgUrl }),
  };

  if (Object.keys(data).length === 0) {
    throw new ValidationError("No fields to update");
  }

  return prisma.user.update({
    where: { id },
    data,
    omit: { passwordHash: true },
  });
}
export async function changePassword(
  { id, oldPassword, newPassword }: UserEditPassword,
  currentUserId: UuidType,
): Promise<SafeUser> {
  validateService({ id, currentUserId });
  await validateUserWithPassword(id, oldPassword);
  const newHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id },
    data: { passwordHash: newHash },
    omit: { passwordHash: true },
  });
}
export async function deleteUserServ(
  { id, password }: UserDelete,
  currentUserId: UuidType,
): Promise<void> {
  validateService({ id, currentUserId });
  await validateUserWithPassword(id, password);
  await prisma.user.delete({ where: { id } });
}
// UTILS
async function validateUsername(username: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existingUser) {
    throw new ConflictError("Username already taken");
  }
}
async function validateUserWithPassword(id: string, password: string) {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) throw new NotFoundError("User not found");
  const isPassword = await bcrypt.compare(password, existingUser.passwordHash);
  if (!isPassword) throw new UnauthorizedError("Incorrect Password");
}
