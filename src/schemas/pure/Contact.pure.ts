import * as z from 'zod';
// prettier-ignore
export const ContactModelSchema = z.object({
    id: z.string(),
    owner: z.unknown(),
    ownerId: z.string(),
    user: z.unknown().nullable(),
    userId: z.string().nullable(),
    nickname: z.string().nullable(),
    isBlocked: z.boolean()
}).strict();

export type ContactPureType = z.infer<typeof ContactModelSchema>;
