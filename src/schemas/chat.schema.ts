import z from "zod";
import { ChatMemberSchema } from "./member.schema";
import { ChatMessageSchema } from "./message.schema";
import { UuidSchema } from "./util.schema";
import { SafeUserSchema } from "./user.schema";

export const ChatSchema = z.object({
  id: UuidSchema,
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(ChatMemberSchema),
  messages: z.array(ChatMessageSchema),
});

export type ChatType = z.infer<typeof ChatSchema>;

export const ChatResponseSchema = z.object({
  id: UuidSchema,
  isGroup: z.boolean(),
  createdAt: z.date(),
  primaryMember: SafeUserSchema,
  secondaryMember: SafeUserSchema.extend({ nickname: z.string().nullable() }),
  messages: z.array(ChatMessageSchema),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;

export const ChatLazySchema = z.object({
  id: UuidSchema,
  createdAt: z.date(),
  isGroup: z.boolean(),
  otherMember: SafeUserSchema.extend({
    nickname: z.string().nullable(),
  }),
  lastMessage: ChatMessageSchema.optional(),
});
export type ChatLazy = z.infer<typeof ChatLazySchema>;

export const GroupChatSchema = z.object({
  id: UuidSchema,
  name: z.string().nullable(),
  imgUrl: z.url().nullable(),
  createdById: UuidSchema.nullable(),
  createdAt: z.date(),
  isGroup: z.boolean(),
  members: z.array(ChatMemberSchema),
  messages: z.array(ChatMessageSchema),
});

export type GroupChatType = z.infer<typeof GroupChatSchema>;

export const GroupChatInputSchema = z.object({
  id: UuidSchema.optional(),
  name: z.string().min(1),
  imgUrl: z.url().optional(),
  createdById: UuidSchema.optional(),
  members: z.array(UuidSchema),
});

export type GroupChatInput = z.infer<typeof GroupChatInputSchema>;

export const GroupLazySchema = z.object({
  id: UuidSchema,
  createdAt: z.date(),
  isGroup: z.boolean(),
  name: z.string().min(1),
  imgUrl: z.url().optional(),
  lastMessage: ChatMessageSchema.optional(),
});
export type GroupLazy = z.infer<typeof GroupLazySchema>;

export const GroupResponseSchema = z.object({
  id: UuidSchema,
  name: z.string().min(1),
  imgUrl: z.url().optional(),
  isGroup: z.boolean(),
  createdAt: z.date(),
  primaryMember: SafeUserSchema,
  secondaryMembers: z.array(SafeUserSchema.extend({ nickname: z.string().nullable() })),
  messages: z.array(ChatMessageSchema),
});

export type GroupResponse = z.infer<typeof GroupResponseSchema>;


