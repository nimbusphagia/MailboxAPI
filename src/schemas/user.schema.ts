import z from "zod";
import { PasswordSchema, UuidSchema } from "./util.schema";

export const UserModelSchema = z.object({
  id: UuidSchema,
  username: z.string(),
  passwordHash: z.string(),
  name: z.string(),
  imgUrl: z.url().optional(),
  contacts: z.array(z.unknown()),
  contactOf: z.array(z.unknown()),
  chats: z.array(z.unknown()),
  chatMembers: z.array(z.unknown()),
  sentMessages: z.array(z.unknown())
});

export type UserPureType = z.infer<typeof UserModelSchema>;

export const UserSchema = z.object({
  id: UuidSchema,
  username: z.string(),
  passwordHash: z.string(),
  name: z.string(),
  imgUrl: z.url().optional(),
});

export type User = z.infer<typeof UserSchema>;


export const SafeUserSchema = UserSchema.omit({
  passwordHash: true,
});
export type SafeUser = z.infer<typeof SafeUserSchema>;

export const UserInputSchema = UserSchema
  .omit({
    id: true,
    passwordHash: true,
  })
  .extend({
    password: PasswordSchema,
  });
export type UserInput = z.infer<typeof UserInputSchema>;

export const UserEditInputSchema = UserSchema
  .omit({ passwordHash: true })
  .partial()
  .required({ id: true });
export type UserEditInput = z.infer<typeof UserEditInputSchema>

export const UserEditPasswordSchema = z.object({
  id: UuidSchema,
  oldPassword: PasswordSchema,
  newPassword: PasswordSchema,
}).refine(
  (data) => data.oldPassword !== data.newPassword,
  { message: "New password must be different from old password", path: ["newPassword"] }
);
export type UserEditPassword = z.infer<typeof UserEditPasswordSchema>;

export const UserDeleteSchema = z.object({
  id: UuidSchema,
  password: PasswordSchema,
});
export type UserDelete = z.infer<typeof UserDeleteSchema>;
