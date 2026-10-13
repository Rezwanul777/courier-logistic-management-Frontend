
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

import type {
  RateCardFilters,
} from "@/lib/rate-card-filters";

const zoneSchema = z.object({
  id: z.number().int().positive(),
  code: z.string(),
  name: z.string(),
});

const rateCardSchema = z.object({
  id: z.number().int().positive(),

  originZoneId: z.number().int().positive(),
  destinationZoneId: z.number().int().positive(),

  originZone: zoneSchema,
  destinationZone: zoneSchema,

  weightFrom: z.number().nonnegative(),
  weightTo: z.number().positive(),

  baseAmountMinor: z.number().int().positive(),
  currency: z.string(),

  isActive: z.boolean(),
  version: z.number().int().positive(),

  createdAt: z.string(),
  updatedAt: z.string(),
});

const rateListSchema = z.object({
  items: z.array(rateCardSchema),

  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type RateCard = z.infer<
  typeof rateCardSchema
>;

export type RateCardZone = z.infer<
  typeof zoneSchema
>;

export type RateCardList = z.infer<
  typeof rateListSchema
>;

// Authenticated, private, server-only request.
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
      `Unable to retrieve Admin rate data (${response.status}).`,
    );
  }

  const parsed = apiResponseSchema(
    schema,
  ).safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(
      "Unexpected rate-card API response structure.",
    );
  }

  return parsed.data.data;
}

// Paginated list with server-side filtering.
export async function getAdminRateCards(
  filters: RateCardFilters,
): Promise<RateCardList> {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: "10",
    status: filters.status,
  });

  if (filters.originZoneId !== null) {
    params.set(
      "originZoneId",
      String(filters.originZoneId),
    );
  }

  if (filters.destinationZoneId !== null) {
    params.set(
      "destinationZoneId",
      String(filters.destinationZoneId),
    );
  }

  return readAdminData(
    `/admin/rates?${params.toString()}`,
    rateListSchema,
  );
}

// All active zones for rate configuration.
export async function getRateCardZones(): Promise<
  RateCardZone[]
> {
  return readAdminData(
    "/zones",
    z.array(zoneSchema),
  );
}
