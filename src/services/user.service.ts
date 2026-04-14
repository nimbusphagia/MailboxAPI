import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { SafeUser, UserDelete, UserEditInput, UserEditPassword, UserInput } from "../schemas/user.schema";
import type { UuidType } from "../schemas/util.schema";
import { ConflictError, NotFoundError, UnauthorizedError } from "../errors";



export async function getUsers(): Promise<SafeUser[]> {
  return prisma.user.findMany({
    omit: {
      passwordHash: true,
    }
  });
}
export async function getUserById(id: UuidType): Promise<SafeUser | null> {
  return prisma.user.findUnique({
    where: { id },
    omit: { passwordHash: true }
  });
}
export async function createUser({ username, password, name }: UserInput): Promise<SafeUser> {
  await validateUsername(username);
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: { username, passwordHash, name },
    omit: { passwordHash: true }
  })
}
export async function editUser({ id, username, name, imgUrl }: UserEditInput): Promise<SafeUser> {
  const existingUser = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!existingUser) throw new NotFoundError("User not found");
  if (username) await validateUsername(username);
  const data = {
    ...(username && { username }),
    ...(name && { name }),
    ...(imgUrl && { imgUrl }),
  }
  return prisma.user.update({
    where: { id },
    data,
    omit: { passwordHash: true }
  })
};
export async function changePassword({ id, oldPassword, newPassword }: UserEditPassword): Promise<SafeUser> {
  await validateUserWithPassword(id, oldPassword);
  const newHash = await bcrypt.hash(newPassword, 12);
  return prisma.user.update({
    where: { id },
    data: { passwordHash: newHash },
    omit: { passwordHash: true }
  })
}
export async function deleteUser({ id, password }: UserDelete): Promise<SafeUser> {
  await validateUserWithPassword(id, password);
  return prisma.user.delete({ where: { id }, omit: { passwordHash: true } });
}
// UTILS 
async function validateUsername(username: string): Promise<void> {
  const existingUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true }
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

