
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";
import { ShipmentFilters } from "../shipment-filter";

const shipmentSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string(),
  status: z.string(),
  createdAt: z.string(),
  originHubId: z.number().int().positive(),
  destinationHubId: z.number().int().positive(),
});

const shipmentListSchema = z.object({
  items: z.array(shipmentSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),
});

const hubSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

export type CustomerShipment = z.infer<
  typeof shipmentSchema
>;


export async function getCustomerShipments(
  filters: ShipmentFilters,
) {
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
  });

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.dateRange !== "all") {
    params.set("dateRange", filters.dateRange);
  }

  const response = await fetch(
    `${backendApiUrl}/shipments/my?${params.toString()}`,
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

  if (!response.ok) {
    throw new Error(
      "Unable to load your shipments.",
    );
  }

  const result = apiResponseSchema(
    shipmentListSchema,
  ).safeParse(await response.json());

  if (!result.success) {
    throw new Error(
      "The shipment service returned unexpected data.",
    );
  }

  return result.data.data;
}


export async function getHubNames(): Promise<
  Map<number, string>
> {
  const { backendApiUrl } = getServerConfig();

  try {
    const response = await fetch(
      `${backendApiUrl}/hubs`,
      {
        next: { revalidate: 300 },
        redirect: "error",
        signal: AbortSignal.timeout(12_000),
      },
    );

    if (!response.ok) {
      return new Map();
    }

    const result = apiResponseSchema(
      z.array(hubSchema),
    ).safeParse(await response.json());

    if (!result.success) {
      return new Map();
    }

    return new Map(
      result.data.data.map((hub) => [
        hub.id,
        hub.name,
      ]),
    );
  } catch {
    // Hub names are supplementary display data.
    // Shipment records remain available.
    return new Map();
  }
}
