
import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

// ---------------------------------------------
// Customer schema
// ---------------------------------------------

const customerSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().nullable(),
  email: z.string(),
  phone: z.string().nullable(),
});

// ---------------------------------------------
// Hub schema
// ---------------------------------------------

const hubSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  code: z.string(),
  address: z.string(),
});

// ---------------------------------------------
// Payment schema
// ---------------------------------------------

const paymentSchema = z.object({
  status: z.string(),
  amountMinor: z.number().int().nonnegative(),
  currency: z.string(),
  provider: z.string(),
  paidAt: z.string().nullable(),
});

// ---------------------------------------------
// Tracking event schema
// ---------------------------------------------

const trackingEventSchema = z.object({
  id: z.number().int().positive(),
  previousStatus: z.string().nullable(),
  newStatus: z.string(),
  reason: z.string().nullable(),
  occurredAt: z.string(),
});

// ---------------------------------------------
// Courier task schema
// ---------------------------------------------

const courierTaskSchema = z.object({
  id: z.number().int().positive(),
  type: z.string(),
  status: z.string(),
  createdAt: z.string(),
  acceptedAt: z.string().nullable(),
  completedAt: z.string().nullable(),

  courier: z.object({
    id: z.number().int().positive(),
    name: z.string().nullable(),
    email: z.string(),
  }),
});

// ---------------------------------------------
// NEW: Hub transfer schema
// ---------------------------------------------

const hubTransferSchema = z.object({
  id: z.number().int().positive(),

  status: z.enum([
    "DISPATCHED",
    "RECEIVED",
  ]),

  createdAt: z.string(),
  receivedAt: z.string().nullable(),

  fromHub: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }),

  toHub: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }),
});

// ---------------------------------------------
// Complete Admin shipment detail schema
// ---------------------------------------------

const adminShipmentDetailSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string().min(1),
  status: z.string(),

  description: z.string().nullable(),
  weight: z.number().nonnegative(),

  pickupAddress: z.unknown(),
  recipient: z.unknown(),

  quotedAmountMinor: z.number().int().nonnegative(),
  currency: z.string(),

  createdAt: z.string(),

  customer: customerSchema,
  originHub: hubSchema,
  destinationHub: hubSchema,

  payment: paymentSchema.nullable(),

  trackingEvents: z.array(trackingEventSchema),
  courierTasks: z.array(courierTaskSchema),

  // Step 31H
  hubTransfers: z.array(hubTransferSchema),
});

export type AdminShipmentDetail = z.infer<
  typeof adminShipmentDetailSchema
>;

// ---------------------------------------------
// Fetch Admin shipment details
// ---------------------------------------------

export async function getAdminShipmentDetail(
  rawId: string,
): Promise<AdminShipmentDetail> {
  const shipmentId = Number(rawId);

  if (
    !/^[1-9]\d*$/.test(rawId) ||
    !Number.isSafeInteger(shipmentId)
  ) {
    notFound();
  }

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
    `${backendApiUrl}/admin/shipments/${shipmentId}`,
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
      "Unable to load Admin shipment details.",
    );
  }

  const payload: unknown = await response.json();

  const parsed = apiResponseSchema(
    adminShipmentDetailSchema,
  ).safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      "Invalid Admin shipment details response.",
    );
  }

  return parsed.data.data;
}
