import z from "zod"

export const UuidSchema = z.uuidv7();
export type UuidType = z.infer<typeof UuidSchema>;

export const PasswordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .max(20, { message: "Password must be less than 20 characters" })
  .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  .regex(/[0-9]/, { message: "Password must contain at least one number" })
  .regex(/[^a-zA-Z0-9]/, { message: "Password must contain at least one special character" });


