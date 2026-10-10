
import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

const hubSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});

const trackingEventSchema = z.object({
  id: z.number().int().positive(),
  newStatus: z.string(),
  previousStatus: z.string().nullable().optional(),
  reason: z.string().nullable().optional(),
  occurredAt: z.string(),
});

const shipmentDetailSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string(),
  status: z.string(),
  description: z.string().nullable(),
  weight: z.number().nonnegative(),
  currency: z.string(),
  quotedAmountMinor: z.number().int().nonnegative(),
  pickupAddress: z.unknown(),
  recipient: z.unknown(),
  createdAt: z.string(),
  originHub: hubSchema,
  destinationHub: hubSchema,
  trackingEvents: z.array(trackingEventSchema),
});

const paymentSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum([
    "UNPAID",
    "CHECKOUT_PENDING",
    "PAID",
    "REFUND_PENDING",
    "REFUNDED",
    "FAILED",
  ]),
  amountMinor: z.number().int().nonnegative(),
  currency: z.string(),
  paidAt: z.string().nullable().optional(),
});

export type ShipmentDetail = z.infer<
  typeof shipmentDetailSchema
>;

export type ShipmentPayment = z.infer<
  typeof paymentSchema
>;

export type TrackingEvent = z.infer<
  typeof trackingEventSchema
>;

async function getAuthCookie(): Promise<string> {
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

  return authCookie;
}

async function fetchPrivateData(
  path: string,
  authCookie: string,
): Promise<unknown> {
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

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      "Unable to retrieve shipment information.",
    );
  }

  return response.json() as Promise<unknown>;
}

export async function getCustomerShipmentDetail(
  id: string,
) {
  const shipmentId = Number(id);

  if (
    !Number.isSafeInteger(shipmentId) ||
    shipmentId <= 0
  ) {
    notFound();
  }

  const authCookie = await getAuthCookie();

  // Fetch independent shipment and payment records
  // concurrently to reduce server-rendering latency.
  const [shipmentPayload, paymentPayload] =
    await Promise.all([
      fetchPrivateData(
        `/shipments/${shipmentId}`,
        authCookie,
      ),
      fetchPrivateData(
        `/payments/shipment/${shipmentId}`,
        authCookie,
      ),
    ]);

  const shipmentResult = apiResponseSchema(
    shipmentDetailSchema,
  ).safeParse(shipmentPayload);

  const paymentResult = apiResponseSchema(
    paymentSchema.nullable(),
  ).safeParse(paymentPayload);

  if (!shipmentResult.success) {
    throw new Error(
      "Invalid shipment details response.",
    );
  }

  if (!paymentResult.success) {
    throw new Error(
      "Invalid shipment payment response.",
    );
  }

  return {
    shipment: shipmentResult.data.data,
    payment: paymentResult.data.data,
  };
}
