import z from "zod";
import { InputJsonValueSchema, JsonValueSchema, UuidSchema } from "./util.schema";

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
  replies: z.array(z.unknown())
});

export type ChatMessagePureType = z.infer<typeof ChatMessageModelSchema>;

export const ChatMessageSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  senderId: UuidSchema.nullable(),
  content: z.string().nullable(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.date(),
  replyToId: UuidSchema.nullable(),
});

export type MessageType = z.infer<typeof ChatMessageSchema>;

export const MessageCreateSchema = z.object({
  chatId: UuidSchema,
  content: z.string().optional(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: InputJsonValueSchema.optional(),
  replyToId: UuidSchema.nullable().optional(),
});

export type MessageCreate = z.infer<typeof MessageCreateSchema>;

export const MessageEditSchema = z.object({
  id: UuidSchema,
  chatId: UuidSchema,
  content: z.string().optional(),
  type: z.enum(["TEXT", "IMAGE", "SYSTEM_EVENT"]),
  metadata: InputJsonValueSchema.optional(),
  replyToId: UuidSchema.nullable().optional(),
});

export type MessageEdit = z.infer<typeof MessageEditSchema>;
