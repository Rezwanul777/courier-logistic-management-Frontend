import { z } from "zod";
import { apiRequest } from "@/lib/apiClient";
import {
  type LoginInput,
  type RegisterInput,
  type VerifyEmailInput,
  loginResponseSchema,
  loginSchema,
  registrationPayload,
  verifyEmailSchema,
} from "@/lib/auth-schema";

export async function login(input: LoginInput) {
  const body = loginSchema.parse(input);

  const response = await apiRequest(
    "/auth/login",
    loginResponseSchema,
    {
      method: "POST",
      body,
    },
  );

  return response.data.user;
}

export async function logout() {
  await apiRequest("/auth/logout", z.null(), {
    method: "POST",
    body: {},
  });
}

export async function registerCustomer(input: RegisterInput) {
  const body = registrationPayload(input);

  await apiRequest("/auth/register", z.null(), {
    method: "POST",
    body,
  });

  return body.email;
}

export async function verifyEmail(input: VerifyEmailInput) {
  const body = verifyEmailSchema.parse(input);

  const response = await apiRequest(
    "/auth/verify-email",
    loginResponseSchema,
    {
      method: "POST",
      body,
    },
  );

  return response.data.user;
}


export const passwordResetRequestSchema = z.object({
  email: loginSchema.shape.email,
});

export const passwordResetSchema = z.object({
  email: loginSchema.shape.email,

  otp: z
    .string()
    .regex(
      /^\d{6}$/,
      "Enter the 6-digit reset code.",
    ),

  newPassword: z
    .string()
    .min(6, "Use at least 6 characters.")
    .max(72, "Password is too long.")
    .regex(/[a-z]/, "Include a lowercase letter.")
    .regex(/[A-Z]/, "Include an uppercase letter.")
    .regex(/[0-9]/, "Include a number.")
    .regex(
      /[^A-Za-z0-9]/,
      "Include a special character.",
    )
    .refine(
      (value) =>
        new TextEncoder().encode(value).length <= 72,
      "Password must not exceed 72 UTF-8 bytes.",
    ),
});

export type PasswordResetRequest = z.input<
  typeof passwordResetRequestSchema
>;

export type PasswordResetInput = z.input<
  typeof passwordResetSchema
>;

export async function requestPasswordReset(
  input: PasswordResetRequest,
) {
  const body = passwordResetRequestSchema.parse(input);

  await apiRequest("/auth/forgot-password", z.null(), {
    method: "POST",
    body,
  });
}

export async function resetPassword(
  input: PasswordResetInput,
) {
  const body = passwordResetSchema.parse(input);

  await apiRequest("/auth/reset-password", z.null(), {
    method: "POST",
    body,
  });
}

