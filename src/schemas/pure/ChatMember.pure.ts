import * as z from 'zod';
import { ChatMemberRoleSchema } from '../../enums/ChatMemberRole.schema';
// prettier-ignore
export const ChatMemberModelSchema = z.object({
    id: z.string(),
    chat: z.unknown(),
    chatId: z.string(),
    user: z.unknown().nullable(),
    userId: z.string().nullable(),
    role: ChatMemberRoleSchema
}).strict();

export type ChatMemberPureType = z.infer<typeof ChatMemberModelSchema>;
