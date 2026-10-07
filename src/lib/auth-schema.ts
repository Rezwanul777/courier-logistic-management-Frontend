import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.").max(254)),
  password: z.string().min(
    6,
    "Password must contain at least 6 characters.",
  ),
});

export const sessionUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(["ADMIN", "CUSTOMER", "COURIER"]),
});

export const loginResponseSchema = z.object({
  user: sessionUserSchema,
});

export type LoginInput = z.input<typeof loginSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
