import { ofetch } from "ofetch";
import type { z } from "zod";
import { ApiError, parseApiError } from "@/lib/api-errors";
import { type ApiResponse, apiResponseSchema } from "@/lib/api-schemas";

/**
 * Browser transport only. The same-origin gateway owns upstream URLs and cookies.
 * No localStorage tokens, no duplicated transport-level retries.
 */
const apiClient = ofetch.create({
  baseURL: "/api/backend",
  credentials: "same-origin",
  cache: "no-store",
  retry: 0,
  timeout: 15_000,
  ignoreResponseError: true,
});

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: Record<string, unknown>;
  signal?: AbortSignal;
}

export async function apiRequest<T>(
  path: string,
  dataSchema: z.ZodType<T>,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  if (!/^\/[a-z0-9/-]+$/i.test(path) || path.includes("..")) {
    throw new ApiError("Invalid API path.", { code: "INVALID_RESPONSE" });
  }

  try {
    const response = await apiClient.raw<unknown>(path, options);
    if (!response.ok) throw parseApiError(response._data, response.status);
    const result = apiResponseSchema(dataSchema).safeParse(response._data);
    if (!result.success) {
      throw new ApiError(
        "The courier service returned an unexpected response.",
        {
          code: "INVALID_RESPONSE",
          status: response.status,
        },
      );
    }
    return result.data;
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw options.signal.reason ?? error;
    throw new ApiError(
      "Unable to reach the courier service. Please try again.",
      {
        code: "NETWORK",
        cause: error,
      },
    );
  }
}

export default apiClient;

