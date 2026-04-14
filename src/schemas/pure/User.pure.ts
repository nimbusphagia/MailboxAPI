import * as z from 'zod';
// prettier-ignore
export const UserModelSchema = z.object({
    id: z.string(),
    username: z.string(),
    passwordHash: z.string(),
    name: z.string(),
    imgUrl: z.string(),
    contacts: z.array(z.unknown()),
    contactOf: z.array(z.unknown()),
    chats: z.array(z.unknown()),
    chatMembers: z.array(z.unknown()),
    sentMessages: z.array(z.unknown())
}).strict();

export type UserPureType = z.infer<typeof UserModelSchema>;
