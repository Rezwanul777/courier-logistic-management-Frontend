
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

const countSchema = z.number().int().nonnegative();

const adminOverviewSchema = z.object({
  summary: z.object({
    allShipments: countSchema,
    readyForPickup: countSchema,
    inTransit: countSchema,
    delivered: countSchema,
  }),

  attention: z.object({
    unassignedPickups: countSchema,
    deliveryFailures: countSchema,
    paymentPending: countSchema,
  }),

  volume: z.array(
    z.object({
      date: z.string(),
      label: z.string(),
      count: countSchema,
    }),
  ).length(7),

  recentShipments: z.array(
    z.object({
      id: z.number().int().positive(),
      trackingCode: z.string(),
      status: z.string(),
      createdAt: z.string(),
      originHub: z.string(),
      destinationHub: z.string(),
      paymentStatus: z.string().nullable(),
    }),
  ),
});

export type AdminOverview = z.infer<
  typeof adminOverviewSchema
>;

export async function getAdminOverview(): Promise<AdminOverview> {
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

  const response = await fetch(
    `${backendApiUrl}/admin/overview`,
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
      "Unable to retrieve the Admin operations overview.",
    );
  }

  const parsed = apiResponseSchema(
    adminOverviewSchema,
  ).safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(
      "Invalid Admin overview response from the backend.",
    );
  }

  return parsed.data.data;
}
