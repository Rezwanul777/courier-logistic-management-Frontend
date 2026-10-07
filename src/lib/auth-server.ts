import "server-only";

import { cookies } from "next/headers";
import { apiResponseSchema } from "@/lib/api-schemas";
import { sessionUserSchema } from "@/lib/auth-schema";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) return null;

  const cookie = filterAuthCookies(
    `accessToken=${accessToken}`,
  );

  if (!cookie) return null;

  const { backendApiUrl } = getServerConfig();

  const response = await fetch(`${backendApiUrl}/auth/me`, {
    headers: {
      Accept: "application/json",
      Cookie: cookie,
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(12_000),
  });

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error("Unable to verify your session.");
  }

  const result = apiResponseSchema(
    sessionUserSchema,
  ).safeParse(await response.json());

  if (!result.success) {
    throw new Error("Unexpected session response.");
  }

  return result.data.data;
}
