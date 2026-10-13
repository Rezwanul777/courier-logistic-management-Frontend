
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";


const zoneSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
});

const hubSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
  address: z.string(),
  zoneId: z.number().int().positive(),
  zone: zoneSchema,
});

const paginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

const listSchema = <T extends z.ZodType>(
  itemSchema: T,
) =>
  z.object({
    items: z.array(itemSchema),
    pagination: paginationSchema,
  });

export type AdminZone = z.infer<typeof zoneSchema>;
export type AdminHub = z.infer<typeof hubSchema>;
export type LocationPagination = z.infer<
  typeof paginationSchema
>;

export interface LocationFilters {
  page: number;
  search: string;
}

export type LocationSearchParams = Record<
  string,
  string | string[] | undefined
>;

export function parseLocationFilters(
  params: LocationSearchParams,
): LocationFilters {
  const rawPage =
    typeof params.page === "string"
      ? params.page
      : "1";

  const number = Number(rawPage);

  const page =
    /^[1-9]\d*$/.test(rawPage) &&
    Number.isSafeInteger(number) &&
    number <= 10000
      ? number
      : 1;

  return {
    page,
    search:
      typeof params.search === "string"
        ? params.search.trim().slice(0, 100)
        : "",
  };
}

export function locationUrl(
  kind: "hubs" | "zones",
  filters: LocationFilters,
): string {
  const base =
    kind === "hubs"
      ? "/admin/hubs"
      : "/admin/hubs/zones";

  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();

  return query ? `${base}?${query}` : base;
}

// One shared authenticated server transport.
async function readAdminData<T>(
  path: string,
  schema: z.ZodType<T>,
): Promise<T> {
  const cookieStore = await cookies();

  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/login");
  }

  const authCookie = filterAuthCookies(
    `accessToken=${token}`,
  );

  if (!authCookie) {
    redirect("/login");
  }

  const { backendApiUrl } = getServerConfig();

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

  if (!response.ok) {
    throw new Error(
      `Unable to load Admin location data (${response.status}).`,
    );
  }

  const parsed = apiResponseSchema(schema).safeParse(
    await response.json(),
  );

  if (!parsed.success) {
    throw new Error(
      "Invalid Admin locations API response.",
    );
  }

  return parsed.data.data;
}

function queryString(filters: LocationFilters) {
  return new URLSearchParams({
    page: String(filters.page),
    limit: "10",
    search: filters.search,
  }).toString();
}

export function getAdminHubs(
  filters: LocationFilters,
) {
  return readAdminData(
    `/admin/hubs?${queryString(filters)}`,
    listSchema(hubSchema),
  );
}

export function getAdminZones(
  filters: LocationFilters,
) {
  return readAdminData(
    `/admin/zones?${queryString(filters)}`,
    listSchema(zoneSchema),
  );
}

// Used for the Create Hub zone dropdown.
// Returns all active zones, not merely page 1.
export function getAllActiveZones(): Promise<
  AdminZone[]
> {
  return readAdminData(
    "/zones",
    z.array(zoneSchema),
  );
}
