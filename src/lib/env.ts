import { z } from "zod";

const serverConfigSchema = z
  .object({
    BACKEND_API_URL: z.url(),
    APP_URL: z.url(),
  })
  .superRefine((value, ctx) => {
    for (const [key, raw] of Object.entries(value)) {
      const url = new URL(raw);
      if (
        !["http:", "https:"].includes(url.protocol) ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      ) {
        ctx.addIssue({
          code: "custom",
          path: [key],
          message:
            "Use an HTTP(S) URL without credentials, query, or fragment.",
        });
      }
    }
    const backend = new URL(value.BACKEND_API_URL);
    if (backend.pathname.replace(/\/$/, "") !== "/api/v1") {
      ctx.addIssue({
        code: "custom",
        path: ["BACKEND_API_URL"],
        message: "Backend URL must end with /api/v1.",
      });
    }
    if (new URL(value.APP_URL).pathname !== "/") {
      ctx.addIssue({
        code: "custom",
        path: ["APP_URL"],
        message: "APP_URL must be the frontend origin.",
      });
    }
  });

export function parseServerConfig(input: unknown) {
  const result = serverConfigSchema.safeParse(input);
  if (!result.success) {
    // Do not include values in an error; configuration may contain sensitive URLs.
    const keys = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(
      `Invalid server configuration: ${keys.join(", ")}. Check .env.local.`,
    );
  }
  return {
    backendApiUrl: result.data.BACKEND_API_URL.replace(/\/$/, ""),
    appOrigin: new URL(result.data.APP_URL).origin,
    secureCookies: new URL(result.data.APP_URL).protocol === "https:",
  };
}

/** Call only from server files. Values are resolved at request time, not at import/build time. */
export function getServerConfig() {
  return parseServerConfig({
    BACKEND_API_URL:
      process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL,
    APP_URL:
      process.env.APP_URL ??
      (process.env.NODE_ENV !== "production"
        ? "http://localhost:3000"
        : undefined),
  });
}
