import z from "zod";
import { SafeUserSchema } from "./user.schema";
import { UuidSchema } from "./util.schema";

export const ChatMemberModelSchema = z.object({
  id: z.string(),
  chat: z.unknown(),
  chatId: z.string(),
  user: z.unknown().nullable(),
  userId: z.string().nullable(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]),
});

export type ChatMemberPureType = z.infer<typeof ChatMemberModelSchema>;

export const ChatMemberSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  user: SafeUserSchema.nullable(),
  userId: UuidSchema.nullable(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]),
});

export type ChatMemberType = z.infer<typeof ChatMemberSchema>;

export const ChatMemberLazySchema = z.object({
  chatId: UuidSchema.optional(),
  user: SafeUserSchema.nullable(),
});

export type ChatMemberLazyType = z.infer<typeof ChatMemberLazySchema>;

export const ChatMemberInputSchema = z.object({
  chatId: UuidSchema,
  userId: UuidSchema,
});

export type ChatMemberInput = z.infer<typeof ChatMemberInputSchema>;

export const ChatMemberOutputSchema = z.object({
  chatId: UuidSchema,
  userId: UuidSchema.nullable(),
  role: z.enum(["MEMBER", "ADMIN", "OWNER"]),
});

export type ChatMemberOutput = z.infer<typeof ChatMemberOutputSchema>;

export const ChatMemberDeleteSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
});

export type ChatMemberDelete = z.infer<typeof ChatMemberDeleteSchema>;

export const ChatMemberEditSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  role: z.enum(["MEMBER", "ADMIN"]),
});

export type ChatMemberEdit = z.infer<typeof ChatMemberEditSchema>;


