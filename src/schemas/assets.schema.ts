import z from "zod";
import { UuidSchema } from "./util.schema";

export const ProfilePictureSchema = z.object({
  id: UuidSchema,
  name: z.string(),
  url: z.url(),
});
export type ProfilePicture = z.infer<typeof ProfilePictureSchema>;
