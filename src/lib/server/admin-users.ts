
import "server-only";

import { cookies } from "next/headers";
import {
  notFound,
  redirect,
} from "next/navigation";

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
  AdminUserFilters,
} from "@/lib/admin-user-filters";

// ---------------------------------------------
// User response schema
// ---------------------------------------------

const adminUserSchema = z.object({
  id: z.number().int().positive(),

  name: z.string().nullable(),
  email: z.string().min(1),
  phone: z.string().nullable(),

  role: z.enum([
    "CUSTOMER",
    "COURIER",
    "ADMIN",
  ]),

  emailVerified: z.boolean(),
  isActive: z.boolean(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

const userListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(adminUserSchema),
  meta: paginationMetaSchema,
});

const singleUserResponseSchema = z.object({
  success: z.literal(true),
  data: adminUserSchema,
});

export type AdminUser = z.infer<
  typeof adminUserSchema
>;

export type AdminUserList = {
  items: AdminUser[];
  pagination: z.infer<
    typeof paginationMetaSchema
  >;
};

// ---------------------------------------------
// Private Admin GET transport
// ---------------------------------------------

async function fetchAdminUserData(
  path: string,
): Promise<unknown> {
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

  const response = await fetch(
    `${backendApiUrl}${path}`,
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

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      "Unable to load Admin user records.",
    );
  }

  return response.json();
}

// ---------------------------------------------
// Paginated users
// ---------------------------------------------

export async function getAdminUsers(
  filters: AdminUserFilters,
): Promise<AdminUserList> {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: "10",

    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.role !== "ALL") {
    params.set("role", filters.role);
  }

  if (filters.status !== "ALL") {
    params.set(
      "isActive",
      filters.status === "ACTIVE"
        ? "true"
        : "false",
    );
  }

  const payload = await fetchAdminUserData(
    `/admin/users?${params.toString()}`,
  );

  const parsed =
    userListResponseSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      "Invalid Admin users list response.",
    );
  }

  return {
    items: parsed.data.data,
    pagination: parsed.data.meta,
  };
}

// ---------------------------------------------
// Individual user details
// ---------------------------------------------

export async function getAdminUserById(
  rawId: string,
): Promise<AdminUser> {
  if (!/^[1-9]\d*$/.test(rawId)) {
    notFound();
  }

  const id = Number(rawId);

  if (
    !Number.isSafeInteger(id) ||
    id > 2147483647
  ) {
    notFound();
  }

  const payload = await fetchAdminUserData(
    `/admin/users/${id}`,
  );

  const parsed =
    singleUserResponseSchema.safeParse(
      payload,
    );

  if (!parsed.success) {
    throw new Error(
      "Invalid Admin user details response.",
    );
  }

  return parsed.data.data;
}
