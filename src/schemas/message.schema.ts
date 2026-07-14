import z from "zod";
import {
  InputJsonValueSchema,
  JsonValueSchema,
  UuidSchema,
} from "./util.schema";
import { ChatMemberSchema } from "./user.schema";

export const ChatMessageModelSchema = z.object({
  id: z.string(),
  chat: z.unknown(),
  chatId: z.string(),
  sender: z.unknown().nullable(),
  senderId: z.string().nullable(),
  content: z.string().nullable(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: z.unknown().nullable(),
  createdAt: z.date(),
  replyTo: z.unknown().nullable(),
  replyToId: z.string().nullable(),
  replies: z.array(z.unknown()),
});

export type ChatMessagePureType = z.infer<typeof ChatMessageModelSchema>;

const TextMessageSchema = z.object({
  chatId: UuidSchema,
  type: z.literal("TEXT"),
  content: z.string().min(1),
  metadata: InputJsonValueSchema.optional(),
  replyToId: UuidSchema.nullable().optional(),
});

const ImageMessageSchema = z.object({
  chatId: UuidSchema,
  type: z.literal("IMAGE"),
  content: z.string().optional(),
  metadata: InputJsonValueSchema.optional(),
  replyToId: UuidSchema.nullable().optional(),
});

export const MessageCreateSchema = z.discriminatedUnion("type", [
  TextMessageSchema,
  ImageMessageSchema,
]);

export type MessageCreate = z.infer<typeof MessageCreateSchema>;

const TextInputSchema = z.object({
  chatId: UuidSchema,
  type: z.literal("TEXT"),
  content: z.string().min(1),
  replyToId: UuidSchema.nullable().optional(),
});

const ImageInputSchema = z.object({
  chatId: UuidSchema,
  type: z.literal("IMAGE"),
  content: z.string().optional(),
  metadata: InputJsonValueSchema.optional(),
  replyToId: UuidSchema.nullable().optional(),
});

export const MessageInputSchema = z.discriminatedUnion("type", [
  TextInputSchema,
  ImageInputSchema,
]);

export type MessageInput = z.infer<typeof MessageCreateSchema>;

export const MessageEditSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  content: z.string().optional(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: InputJsonValueSchema.optional(),
  replyToId: UuidSchema.nullable().optional(),
});

export type MessageEdit = z.infer<typeof MessageEditSchema>;

export const ReplySchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  senderId: UuidSchema.nullable(),
  sender: ChatMemberSchema.nullable(),
  content: z.string().nullable(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.date(),
});

export type Reply = z.infer<typeof ReplySchema>;

export const ChatMessageSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  senderId: UuidSchema.nullable(),
  content: z.string().nullable(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.date(),
  replyToId: UuidSchema.nullable(),
  replyTo: ReplySchema.nullable().optional(),
});

export type MessageType = z.infer<typeof ChatMessageSchema>;
