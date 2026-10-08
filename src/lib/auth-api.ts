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
