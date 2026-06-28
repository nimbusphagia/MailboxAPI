import prisma from "../config/prisma";
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
