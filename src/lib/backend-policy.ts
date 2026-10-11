const allowedRoutes: ReadonlyArray<readonly [RegExp, readonly string[]]> = [
  [
    /^auth\/(register|verify-email|login|google-login|refresh-token|logout|forgot-password|reset-password)$/,
    ["POST"],
  ],
  [/^auth\/me$/, ["GET"]],
  [/^users\/me$/, ["GET", "PATCH"]],
  [/^shipments$/, ["POST"]],
  [/^shipments\/quote$/, ["POST"]],
  [/^shipments\/my$/, ["GET"]],
  [/^shipments\/[1-9]\d*$/, ["GET", "PATCH", "DELETE"]],
  [/^shipments\/[1-9]\d*\/tracking$/, ["GET"]],
  [/^(zones|hubs)$/, ["GET"]],
  [/^admin\/(users|couriers|zones|hubs|rates|audit-logs|shipments)$/, ["GET"]],
  [/^admin\/(couriers|zones|hubs|rates)$/, ["POST"]],
  [/^admin\/users\/[1-9]\d*$/, ["GET", "DELETE"]],
  [/^admin\/(users|couriers)\/[1-9]\d*\/status$/, ["PATCH"]],
  [/^admin\/(zones|hubs|rates)\/[1-9]\d*$/, ["PATCH", "DELETE"]],
  [/^admin\/tasks\/assign-pickup$/, ["POST"]],
  [/^admin\/shipments\/[1-9]\d*\/assign-delivery$/, ["POST"]],
  [
    /^admin\/hub-transfers\/[1-9]\d*\/(origin-receive|dispatch|destination-receive)$/,
    ["POST"],
  ],
  [/^tasks\/me\/tasks$/, ["GET"]],
  [/^tasks\/[1-9]\d*\/(accept|pickup|start-delivery|deliver)$/, ["POST"]],

  [/^payments\/my$/, ["GET"]],

  [/^payments\/checkout$/, ["POST"]],
  [/^payments\/shipment\/[1-9]\d*$/, ["GET"]],
];

export function isAllowedBackendRoute(path: string, method: string): boolean {
  return allowedRoutes.some(
    ([pattern, methods]) => pattern.test(path) && methods.includes(method),
  );
}

export function hasTrustedOrigin(
  origin: string | null,
  expectedOrigin: string,
): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(expectedOrigin).origin;
  } catch {
    return false;
  }
}

/** Only backend auth cookies are accepted. Unrelated frontend cookies stay private. */
export function filterAuthCookies(cookieHeader: string): string {
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .filter((part) =>
      /^(accessToken|refreshToken)=[A-Za-z0-9._~-]*$/.test(part),
    )
    .join("; ");
}

/**
 * Express scopes cookies to /api/v1 and /api/v1/auth, which do not exist here.
 * Re-scope both to / so later server layouts can read them.
 */
export function rewriteAuthCookie(
  cookie: string,
  secure: boolean,
): string | null {
  if (!/^(accessToken|refreshToken)=/.test(cookie)) return null;
  const parts = cookie.split(";").map((part) => part.trim());
  const value = parts.shift();
  const kept = parts.filter(
    (part) => !/^(domain|path|secure|samesite|httponly)(=|$)/i.test(part),
  );
  return [
    value,
    ...kept,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

export function stripAuthTokens(payload: unknown): unknown {
  if (!payload || typeof payload !== "object" || !("data" in payload))
    return payload;
  const data = payload.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) return payload;
  const safeData = Object.fromEntries(
    Object.entries(data).filter(
      ([key]) => key !== "accessToken" && key !== "refreshToken",
    ),
  );
  return { ...payload, data: safeData };
}
