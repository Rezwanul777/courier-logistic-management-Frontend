
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

// ---------------------------------------------
// Shared courier schema
// ---------------------------------------------

const courierSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().nullable(),
  email: z.string().min(1),
  isActive: z.boolean(),
});

const courierListSchema = z.array(courierSchema);

export type AdminCourier = z.infer<
  typeof courierSchema
>;

// ---------------------------------------------
// All courier accounts
// ---------------------------------------------

export async function getAdminCouriers(): Promise<
  AdminCourier[]
> {
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

  const { backendApiUrl } = getServerConfig();

  const response = await fetch(
    `${backendApiUrl}/admin/couriers`,
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
      "Unable to load courier accounts.",
    );
  }

  const parsed = apiResponseSchema(
    courierListSchema,
  ).safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(
      "Invalid courier directory response.",
    );
  }

  return parsed.data.data.sort((a, b) => {
    const nameA = a.name || a.email;
    const nameB = b.name || b.email;

    return nameA.localeCompare(nameB);
  });
}

// ---------------------------------------------
// Active couriers for pickup assignment
// ---------------------------------------------

export async function getActiveCouriers(): Promise<
  AdminCourier[]
> {
  const couriers = await getAdminCouriers();

  return couriers.filter(
    (courier) => courier.isActive,
  );
}
