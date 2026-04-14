import * as z from 'zod';
import { ChatMessageTypeSchema } from '../../enums/ChatMessageType.schema';
// prettier-ignore
export const ChatMessageModelSchema = z.object({
    id: z.string(),
    chat: z.unknown(),
    chatId: z.string(),
    sender: z.unknown().nullable(),
    senderId: z.string().nullable(),
    content: z.string().nullable(),
    type: ChatMessageTypeSchema,
    metadata: z.unknown().nullable(),
    createdAt: z.date(),
    replyTo: z.unknown().nullable(),
    replyToId: z.string().nullable(),
    replies: z.array(z.unknown())
}).strict();

export type ChatMessagePureType = z.infer<typeof ChatMessageModelSchema>;
