import prisma from "../config/prisma";
import { NotFoundError } from "../errors";
import { ProfilePicture } from "../schemas/assets.schema";

export async function getAllProfilePictures() {
  return prisma.profilePicture.findMany();
}
export async function getProfilePicture(picture: ProfilePicture) {
  return prisma.profilePicture.findUnique({
    where: {
      ...picture,
    },
  });
}
export async function getRandomPicture(): Promise<ProfilePicture> {
  const pictures = await prisma.profilePicture.findMany();
  if (pictures.length === 0)
    throw new NotFoundError("No profile pictures found");
  const random = Math.floor(Math.random() * pictures.length);
  return pictures[random];
}
