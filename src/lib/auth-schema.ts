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

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter at least 2 characters.")
      .max(100),
    email: loginSchema.shape.email,
    password: loginSchema.shape.password.max(128),
    confirmPassword: z.string().min(
      1,
      "Confirm your password.",
    ),
  })
  .refine(
    (value) => value.password === value.confirmPassword,
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    },
  );

export const verifyEmailSchema = z.object({
  email: loginSchema.shape.email,
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit verification code."),
});

export type LoginInput = z.input<typeof loginSchema>;
export type SessionUser = z.infer<typeof sessionUserSchema>;
export type RegisterInput = z.input<typeof registerSchema>;
export type VerifyEmailInput = z.input<typeof verifyEmailSchema>;

export function registrationPayload(input: RegisterInput) {
  const { name, email, password } = registerSchema.parse(input);

  return { name, email, password };
}
