
import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

// ---------------------------------------------
// Response schemas
// ---------------------------------------------

const hubSchema = z.object({
  name: z.string(),
});

const shipmentSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string().min(1),
  status: z.string(),
  description: z.string().nullable(),
  weight: z.number().nonnegative(),
  pickupAddress: z.unknown(),
  recipient: z.unknown(),
  originHub: hubSchema,
  destinationHub: hubSchema,
});

const taskSchema = z.object({
  id: z.number().int().positive(),

  type: z.enum([
    "PICKUP",
    "DELIVERY",
    "RETURN",
  ]),

  status: z.enum([
    "ASSIGNED",
    "ACCEPTED",
    "COMPLETED",
    "FAILED",
  ]),

  createdAt: z.string(),
  acceptedAt: z.string().nullable(),
  completedAt: z.string().nullable(),

  shipment: shipmentSchema,
});

const taskListSchema = z.object({
  items: z.array(taskSchema),

  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  }),

  summary: z.object({
    assigned: z.number().int().nonnegative(),
    accepted: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
  }),
});

// ---------------------------------------------
// Types
// ---------------------------------------------

export type CourierTask = z.infer<
  typeof taskSchema
>;

export type CourierTaskList = z.infer<
  typeof taskListSchema
>;

export type CourierTaskTypeFilter =
  "ALL" | "PICKUP" | "DELIVERY";

// ---------------------------------------------
// Private authenticated fetch
// ---------------------------------------------

async function fetchCourierData(
  path: string,
): Promise<unknown> {
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

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(
      "Unable to load courier task information.",
    );
  }

  return response.json();
}

// ---------------------------------------------
// Get assigned and accepted tasks
// ---------------------------------------------

export async function getCourierTasks(
  page = 1,
  type: CourierTaskTypeFilter = "ALL",
): Promise<CourierTaskList> {
  const params = new URLSearchParams({
    page: String(page),
    type,
  });

  const payload = await fetchCourierData(
    `/tasks/me/tasks?${params.toString()}`,
  );

  const parsed = apiResponseSchema(
    taskListSchema,
  ).safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      "Invalid courier task list response.",
    );
  }

  return parsed.data.data;
}

// ---------------------------------------------
// Get a task belonging to the logged-in courier
// ---------------------------------------------

export async function getCourierTask(
  rawId: string,
): Promise<CourierTask> {
  const id = Number(rawId);

  if (
    !/^[1-9]\d*$/.test(rawId) ||
    !Number.isSafeInteger(id)
  ) {
    notFound();
  }

  const payload = await fetchCourierData(
    `/tasks/${id}`,
  );

  const parsed = apiResponseSchema(
    taskSchema,
  ).safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      "Invalid courier task details response.",
    );
  }

  return parsed.data.data;
}
