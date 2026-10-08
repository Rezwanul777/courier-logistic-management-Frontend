import { type NextRequest, NextResponse } from "next/server";
import {
  filterAuthCookies,
  hasTrustedOrigin,
  isAllowedBackendRoute,
  rewriteAuthCookie,
  stripAuthTokens,
} from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

export const runtime = "nodejs";
const MAX_BODY_BYTES = 32 * 1024;

function failure(status: number, message: string) {
  return NextResponse.json(
    { success: false, statusCode: status, message },
    {
      status,
      headers: { "Cache-Control": "private, no-store" },
    },
  );
}

async function readBody(request: NextRequest): Promise<string | undefined> {
  if (request.method === "GET" || !request.body) return undefined;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      length += result.value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function forward(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const endpoint = path.join("/");
  if (!isAllowedBackendRoute(endpoint, request.method)) {
    return failure(404, "This API endpoint is not available.");
  }

  let config: ReturnType<typeof getServerConfig>;
  try {
    config = getServerConfig();
  } catch {
    return failure(503, "The frontend API connection is not configured.");
  }

  if (
    request.method !== "GET" &&
    !hasTrustedOrigin(request.headers.get("origin"), config.appOrigin)
  ) {
    return failure(
      403,
      "This request did not come from the configured frontend.",
    );
  }

  if (
    request.method !== "GET" &&
    request.body &&
    !request.headers.get("content-type")?.startsWith("application/json")
  ) {
    return failure(415, "Use application/json for this request.");
  }

  let body: string | undefined;
  try {
    body = await readBody(request);
    if (body) JSON.parse(body);
  } catch (error: unknown) {
  const cause =
    error instanceof Error &&
    error.cause instanceof Error
      ? error.cause
      : null;

  console.error("[CourierFlow API Proxy]", {
    method: request.method,
    endpoint,
    errorName:
      error instanceof Error
        ? error.name
        : "Unknown",
    errorMessage:
      error instanceof Error
        ? error.message
        : "Unknown error",
    cause: cause?.message,
  });

  return failure(
    502,
    "Unable to reach the courier backend. Please try again.",
  );
}

  try {
    const headers = new Headers({ Accept: "application/json" });
    const cookies = filterAuthCookies(request.headers.get("cookie") ?? "");
    if (cookies) headers.set("Cookie", cookies);
    if (body) headers.set("Content-Type", "application/json");
    const response = await fetch(
      `${config.backendApiUrl}/${endpoint}${request.nextUrl.search}`,
      {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.any([request.signal, AbortSignal.timeout(12_000)]),
      },
    );

    const payload: unknown = await response.json();
    const result = NextResponse.json(
      endpoint.startsWith("auth/") ? stripAuthTokens(payload) : payload,
      {
        status: response.status,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
    for (const cookie of response.headers.getSetCookie()) {
      const rewritten = rewriteAuthCookie(cookie, config.secureCookies);
      if (rewritten) result.headers.append("Set-Cookie", rewritten);
    }
    return result;
  } catch {
    return failure(
      502,
      "Unable to reach the courier backend. Please try again.",
    );
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
