
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

import type {
  AdminShipmentFilters,
} from "@/lib/admin-shipment-filters";

const adminShipmentSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string().min(1),
  status: z.string().min(1),
  createdAt: z.string(),
  customerName: z.string(),
  originHub: z.string(),
  destinationHub: z.string(),
  paymentStatus: z.string().nullable(),
});

const adminShipmentListSchema = z.object({
  items: z.array(adminShipmentSchema),

  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

export type AdminShipment =
  z.infer<typeof adminShipmentSchema>;

export type AdminShipmentList =
  z.infer<typeof adminShipmentListSchema>;

export async function getAdminShipments(
  filters: AdminShipmentFilters,
): Promise<AdminShipmentList> {
  const cookieStore = await cookies();

  const accessToken =
    cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const authCookie = filterAuthCookies(
    `accessToken=${accessToken}`,
  );

  if (!authCookie) {
    redirect("/login");
  }

  const { backendApiUrl } = getServerConfig();

  const params = new URLSearchParams({
    page: String(filters.page),
    limit: "10",
    search: filters.search,
    status: filters.status,
    tab: filters.tab,
    dateRange: filters.dateRange,
    sort: filters.sort,
  });

  const response = await fetch(
    `${backendApiUrl}/admin/shipments?${params.toString()}`,
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
      "Unable to load Admin shipments.",
    );
  }

  const parsed = apiResponseSchema(
    adminShipmentListSchema,
  ).safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(
      "The shipment API returned unexpected data.",
    );
  }

  return parsed.data.data;
}
