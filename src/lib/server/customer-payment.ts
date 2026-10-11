

import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

import type {
  PaymentFilterValues,
} from "@/lib/payment-filters";

// ------------------------------------------
// Response validation
// ------------------------------------------

const paymentStatusSchema = z.enum([
  "AWAITING_PAYMENT",
  "CHECKOUT_PENDING",
  "PAID",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
]);

const paymentItemSchema = z.object({
  shipmentId: z.number().int().positive(),
  trackingCode: z.string().min(1),
  shipmentStatus: z.string().min(1),

  paymentStatus: paymentStatusSchema,

  currency: z.string().min(3),
  amountMinor: z.number().int().nonnegative(),

  paymentProvider: z.string(),

  paidAt: z.string().nullable(),
  createdAt: z.string(),

  canPay: z.boolean(),
});

const paymentListSchema = z.object({
  items: z.array(paymentItemSchema),

  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),

  summary: z.object({
    paidShipments: z.number().int().nonnegative(),
    pendingShipments: z.number().int().nonnegative(),
    paymentMethod: z.string(),
  }),
});

export type CustomerPayment = z.infer<
  typeof paymentItemSchema
>;

export type CustomerPaymentList = z.infer<
  typeof paymentListSchema
>;

// ------------------------------------------
// Authenticated payment history
// ------------------------------------------

export async function getCustomerPayments(
  filters: PaymentFilterValues,
): Promise<CustomerPaymentList> {
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

  const params = new URLSearchParams({
    page: String(filters.page),
    limit: "10",
    status: filters.status,
    sort: filters.sort,
  });

  if (filters.search) {
    params.set("search", filters.search);
  }

  const response = await fetch(
    `${backendApiUrl}/payments/my?${params.toString()}`,
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
      "Unable to load your payment history.",
    );
  }

  const parsed = apiResponseSchema(
    paymentListSchema,
  ).safeParse(await response.json());

  if (!parsed.success) {
    throw new Error(
      "The payment service returned unexpected data.",
    );
  }

  return parsed.data.data;
}
