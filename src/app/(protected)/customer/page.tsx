
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  ClipboardList,
  Package,
  PackageOpen,
  Truck,
} from "lucide-react";

import { apiResponseSchema } from "@/lib/api-schemas";
import { filterAuthCookies } from "@/lib/backend-policy";
import { getServerConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: "Customer Overview",
  robots: {
    index: false,
    follow: false,
  },
};

const shipmentSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string(),
  status: z.string(),
  createdAt: z.string(),
});

const shipmentListSchema = z.object({
  items: z.array(shipmentSchema),
  pagination: z.object({
    total: z.number().int().nonnegative(),
  }),
});

type Shipment = z.infer<typeof shipmentSchema>;

async function getMyShipments() {
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
    `${backendApiUrl}/shipments/my?page=1&limit=5`,
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
      "Unexpected shipment response.",
    );
  }

  return result.data.data;
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(date);
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: typeof Package;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-4 break-words text-2xl font-bold tracking-tight text-[#102D46]">
            {value}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
          <Icon
            aria-hidden="true"
            className="size-5"
          />
        </div>
      </div>
    </article>
  );
}

function RecentShipments({
  shipments,
}: {
  shipments: Shipment[];
}) {
  return (
    <section
      aria-labelledby="recent-shipments-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-100 px-6 py-5">
        <h2
          id="recent-shipments-title"
          className="text-lg font-bold text-[#102D46]"
        >
          Recent shipments
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Your latest shipment records
        </p>
      </div>

      {shipments.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#E8F5F2] text-[#00877B]">
            <PackageOpen
              aria-hidden="true"
              className="size-7"
            />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-[#102D46]">
            No shipments yet
          </h3>

          <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
            Your shipments will appear here after
            you create your first booking.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Tracking code
                </th>

                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Created
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td className="px-6 py-4 font-semibold text-[#102D46]">
                    {shipment.trackingCode}
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {formatStatus(shipment.status)}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-500">
                    {formatDate(shipment.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function CustomerOverviewPage() {
  const data = await getMyShipments();

  const latest = data.items[0];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Overview
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Your shipments, activity, and delivery progress
          in one workspace.
        </p>
      </div>

      <section
        aria-label="Shipment summary"
        className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      >
        <StatCard
          title="Total shipments"
          value={data.pagination.total}
          icon={Package}
        />

        <StatCard
          title="Latest tracking code"
          value={
            latest?.trackingCode ?? "No shipments"
          }
          icon={ClipboardList}
        />

        <StatCard
          title="Latest shipment status"
          value={
            latest
              ? formatStatus(latest.status)
              : "—"
          }
          icon={Truck}
        />
      </section>

      <RecentShipments shipments={data.items} />
    </div>
  );
}
