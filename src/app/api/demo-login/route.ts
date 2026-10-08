
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  apiResponseSchema,
} from "@/lib/api-schemas";

import {
  loginResponseSchema,
} from "@/lib/auth-schema";

import {
  getServerConfig,
} from "@/lib/env";

import {
  hasTrustedOrigin,
  rewriteAuthCookie,
} from "@/lib/backend-policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const demoRequestSchema = z.strictObject({
  role: z.enum(["CUSTOMER", "COURIER", "ADMIN"]),
});

const responseSchema =
  apiResponseSchema(loginResponseSchema);

function failure(status: number, message: string) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store",
      },
    },
  );
}

export async function POST(request: NextRequest) {
  if (process.env.DEMO_LOGIN_ENABLED !== "true") {
    return failure(404, "Demo login is unavailable.");
  }

  let config: ReturnType<typeof getServerConfig>;

  try {
    config = getServerConfig();
  } catch {
    return failure(503, "Server configuration is unavailable.");
  }

  if (
    !hasTrustedOrigin(
      request.headers.get("origin"),
      config.appOrigin,
    )
  ) {
    return failure(403, "Request origin is not allowed.");
  }

  if (
    !request.headers
      .get("content-type")
      ?.startsWith("application/json")
  ) {
    return failure(415, "JSON request required.");
  }

  let body: unknown;

  try {
    const raw = await request.text();

    if (Buffer.byteLength(raw, "utf8") > 256) {
      return failure(413, "Request is too large.");
    }

    body = JSON.parse(raw);
  } catch {
    return failure(400, "Invalid JSON request.");
  }

  const parsed = demoRequestSchema.safeParse(body);

  if (!parsed.success) {
    return failure(400, "Invalid demo role.");
  }

  const role = parsed.data.role;

  const accounts = {
    CUSTOMER: {
      email: process.env.DEMO_CUSTOMER_EMAIL,
      password: process.env.DEMO_CUSTOMER_PASSWORD,
    },
    COURIER: {
      email: process.env.DEMO_COURIER_EMAIL,
      password: process.env.DEMO_COURIER_PASSWORD,
    },
    ADMIN: {
      email: process.env.DEMO_ADMIN_EMAIL,
      password: process.env.DEMO_ADMIN_PASSWORD,
    },
  };

  const credentials = accounts[role];

  if (!credentials.email || !credentials.password) {
    return failure(503, "Demo account is not configured.");
  }

  try {
    const upstream = await fetch(
      `${config.backendApiUrl}/auth/login`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(12_000),
      },
    );

    if (upstream.status === 429) {
      return failure(
        429,
        "Too many login attempts. Try again later.",
      );
    }

    if (!upstream.ok) {
      return failure(
        502,
        "The demo account could not sign in.",
      );
    }

    const result = responseSchema.safeParse(
      await upstream.json(),
    );

    if (!result.success) {
      return failure(
        502,
        "Unexpected authentication response.",
      );
    }

    const user = result.data.data.user;

    // Never authenticate a different role.
    if (user.role !== role) {
      return failure(
        502,
        "Demo account role does not match.",
      );
    }

    const authCookies: string[] = [];

    for (const cookie of upstream.headers.getSetCookie()) {
      const rewritten = rewriteAuthCookie(
        cookie,
        config.secureCookies,
      );

      if (rewritten) {
        authCookies.push(rewritten);
      }
    }

    const hasAccessToken = authCookies.some((cookie) =>
      cookie.startsWith("accessToken="),
    );

    const hasRefreshToken = authCookies.some((cookie) =>
      cookie.startsWith("refreshToken="),
    );

    if (!hasAccessToken || !hasRefreshToken) {
      return failure(
        502,
        "Authentication cookies are missing.",
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        data: { user },
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      },
    );

    for (const cookie of authCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    return response;
  } catch {
    return failure(
      502,
      "Unable to reach the authentication server.",
    );
  }
}
