
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { z } from "zod";

import {
  paginationMetaSchema,
} from "@/lib/api-schemas";

import {
  filterAuthCookies,
} from "@/lib/backend-policy";

import {
  getServerConfig,
} from "@/lib/env";

import type {
  AdminAuditFilters,
} from "@/lib/admin-audit-filters";

// ---------------------------------------------
// API response validation
// ---------------------------------------------

const actorSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().nullable(),
  email: z.string().min(1),
});

const auditEntrySchema = z.object({
  id: z.string().min(1),

  actorId: z.number().int().positive(),

  action: z.string().min(1),
  entityType: z.string().min(1),
  entityId: z.number().int(),

  reason: z.string().nullable(),
  requestId: z.string().min(1),

  createdAt: z.string(),

  actor: actorSchema,
});

const auditResponseSchema = z.object({
  success: z.literal(true),

  data: z.array(auditEntrySchema),

  meta: paginationMetaSchema,
});

export type AuditEntry = z.infer<
  typeof auditEntrySchema
>;

export interface AdminAuditLogList {
  items: AuditEntry[];

  pagination: z.infer<
    typeof paginationMetaSchema
  >;
}

// ---------------------------------------------
// Fetch records for authenticated Admin
// ---------------------------------------------

export async function getAdminAuditLogs(
  filters: AdminAuditFilters,
): Promise<AdminAuditLogList> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  const authCookie = filterAuthCookies(
    `accessToken=${token}`,
  );

  if (!authCookie) {
    redirect("/login");
  }

  const { backendApiUrl } =
    getServerConfig();

  const params = new URLSearchParams({
    page: String(filters.page),
    limit: "10",
  });

  if (filters.actorId !== null) {
    params.set(
      "actorId",
      String(filters.actorId),
    );
  }

  if (filters.entityId !== null) {
    params.set(
      "entityId",
      String(filters.entityId),
    );
  }

  if (filters.entityType) {
    params.set(
      "entityType",
      filters.entityType,
    );
  }

  if (filters.action) {
    params.set(
      "action",
      filters.action,
    );
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  const response = await fetch(
    `${backendApiUrl}/admin/audit-logs?${params.toString()}`,
    {
      method: "GET",

      headers: {
        Accept: "application/json",
        Cookie: authCookie,
      },

      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (response.status === 401) {
    redirect("/login");
  }

  if (response.status === 403) {
    redirect("/account");
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load Audit Logs (${response.status}).`,
    );
  }

  const payload: unknown =
    await response.json();

  const parsed =
    auditResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      "Invalid Admin audit-log API response.",
    );
  }

  return {
    items: parsed.data.data,
    pagination: parsed.data.meta,
  };
}
