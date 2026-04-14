import * as z from 'zod';
// prettier-ignore
export const ChatModelSchema = z.object({
    id: z.string(),
    name: z.string().nullable(),
    imgUrl: z.string().nullable(),
    createdBy: z.unknown().nullable(),
    createdById: z.string().nullable(),
    createdAt: z.date(),
    isGroup: z.boolean(),
    members: z.array(z.unknown()),
    messages: z.array(z.unknown())
}).strict();

export type ChatPureType = z.infer<typeof ChatModelSchema>;
