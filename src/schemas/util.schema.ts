import z from "zod";
import { Prisma } from "../generated/prisma/client";

export const UuidSchema = z.uuidv7();
export type UuidType = z.infer<typeof UuidSchema>;

export const PasswordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(20, { message: "Password must be less than 20 characters" })
  .regex(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter",
  })
  .regex(/[a-z]/, {
    message: "Password must contain at least one lowercase letter",
  })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password must contain at least one special character",
  });

export const UsernameSchema = z
  .string()
  .min(3, { message: "Username must be at least 3 characters long" })
  .max(20, { message: "Username must be less than 20 characters" })
  .regex(/^[a-zA-Z0-9._]+$/, {
    message:
      "Username can only contain letters, numbers, dots, and underscores",
  })
  .regex(/^(?![._])/, {
    message: "Username cannot start with a dot or underscore",
  })
  .regex(/(?<![._])$/, {
    message: "Username cannot end with a dot or underscore",
  })
  .regex(/^(?!.*[._]{2})/, {
    message: "Username cannot contain consecutive dots or underscores",
  });

export type UsernameType = z.infer<typeof UsernameSchema>;

export const CurrentUserValidationSchema = z.object({
  id: UuidSchema,
  currentUserId: UuidSchema,
});
export type CurrentUserValidation = z.infer<typeof CurrentUserValidationSchema>;

export const JsonValueSchema: z.ZodType<Prisma.JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(JsonValueSchema),
    z.record(z.string(), JsonValueSchema),
  ]),
);

export const NullableJsonNullValueSchema = z.enum(["DbNull", "JsonNull"]);

export const InputJsonValueSchema: z.ZodType<Prisma.InputJsonValue> = z.lazy(
  () =>
    z.union([
      z.string(),
      z.number(),
      z.boolean(),
      z.array(InputJsonValueSchema),
      z.record(z.string(), InputJsonValueSchema),
    ]),
);
export const NullableInputJsonValueSchema = z
  .union([NullableJsonNullValueSchema, InputJsonValueSchema])
  .transform((v) => {
    if (v === "DbNull") return Prisma.DbNull;
    if (v === "JsonNull") return Prisma.JsonNull;
    return v;
  });

export const ImageMetadataSchema = z.object({
  url: z.url(),
  publicId: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
});
export type ImageMetadata = z.infer<typeof ImageMetadataSchema>;
