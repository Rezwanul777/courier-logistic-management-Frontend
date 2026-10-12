
import "server-only";

import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";

import type {
  CourierHistoryFilters,
} from "@/lib/courier-history-filters";

import {
  fetchCourierData,
} from "@/lib/server/courier-tasks";

// ---------------------------------------------
// Validated response structure
// ---------------------------------------------

const historyItemSchema = z.object({
  id: z.number().int().positive(),

  type: z.enum([
    "PICKUP",
    "DELIVERY",
    "RETURN",
  ]),

  status: z.literal("COMPLETED"),

  createdAt: z.string(),
  completedAt: z.string().nullable(),

  shipment: z.object({
    trackingCode: z.string().min(1),
  }),
});

const historyResponseSchema = z.object({
  items: z.array(historyItemSchema),

  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),

  summary: z.object({
    completed: z.number().int().nonnegative(),
    pickup: z.number().int().nonnegative(),
    delivery: z.number().int().nonnegative(),
  }),
});

export type CourierHistoryItem = z.infer<
  typeof historyItemSchema
>;

export type CourierHistoryData = z.infer<
  typeof historyResponseSchema
>;

// ---------------------------------------------
// Fetch completed tasks belonging to courier
// ---------------------------------------------

export async function getCourierTaskHistory(
  filters: CourierHistoryFilters,
): Promise<CourierHistoryData> {
  const params = new URLSearchParams({
    page: String(filters.page),
    type: filters.type,
    search: filters.search,
    sort: filters.sort,
  });

  const payload = await fetchCourierData(
    `/tasks/me/history?${params.toString()}`,
  );

  const parsed = apiResponseSchema(
    historyResponseSchema,
  ).safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      "Invalid courier task history response.",
    );
  }

  return parsed.data.data;
}
