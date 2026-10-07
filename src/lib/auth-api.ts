import { z } from "zod";
import { apiRequest } from "@/lib/apiClient";
import {
  type LoginInput,
  loginResponseSchema,
  loginSchema,
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
