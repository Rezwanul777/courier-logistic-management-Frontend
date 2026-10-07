import { z } from "zod";

export type ApiErrorCode = "HTTP" | "NETWORK" | "INVALID_RESPONSE";

const backendErrorSchema = z.object({
  message: z.string().min(1).optional(),
  statusCode: z.number().int().min(400).max(599).optional(),
  errors: z
    .array(
      z.object({
        field: z.string().optional(),
        path: z.string().optional(),
        message: z.string(),
      }),
    )
    .optional(),
});

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors: Readonly<Record<string, string>>;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: ApiErrorCode;
      fieldErrors?: Record<string, string>;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status ?? 0;
    this.code = options.code ?? "HTTP";
    this.fieldErrors = options.fieldErrors ?? {};
  }
}

export function parseApiError(payload: unknown, httpStatus: number): ApiError {
  const result = backendErrorSchema.safeParse(payload);
  const status = httpStatus;
  const fallback =
    status === 401
      ? "Please sign in to continue."
      : status === 403
        ? "You do not have access to this action."
        : status === 429
          ? "Too many requests. Please try again shortly."
          : status >= 500
            ? "The courier service is temporarily unavailable."
            : "The request could not be completed.";
  const fieldErrors: Record<string, string> = {};
  if (result.success) {
    for (const issue of result.data.errors ?? []) {
      const field = issue.field ?? issue.path;
      if (field) fieldErrors[field] = issue.message;
    }
  }
  return new ApiError(
    status >= 500
      ? fallback
      : result.success
        ? (result.data.message ?? fallback)
        : fallback,
    { status, fieldErrors },
  );
}

export function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";
}

/** Only safe GET queries may call this. Mutations never retry automatically. */
export function shouldRetryQuery(failureCount: number, error: Error): boolean {
  if (failureCount >= 2) return false;
  if (!(error instanceof ApiError)) return false;
  if (error.code === "INVALID_RESPONSE") return false;
  return error.code === "NETWORK" || error.status >= 500;
}
