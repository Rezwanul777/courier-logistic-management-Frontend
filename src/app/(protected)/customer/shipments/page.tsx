/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */


import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import {
  ArrowLeft,
  ArrowRight,
  PackageOpen,
  Plus,
} from "lucide-react";


import {
  parseShipmentFilters,
  shipmentListHref,
  type ShipmentFilters as ShipmentFilterValues,
} from "@/lib/shipment-filter";

import {
  getCustomerShipments,
  getHubNames,
  type CustomerShipment,
} from "@/lib/server/customer-shipments";
import { ShipmentFilters } from "@/component/dashboard/shipment-filter";

export const metadata: Metadata = {
  title: "My Shipments",
  description: "Manage and track your CourierFlow shipments.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    status?: string | string[];
    dateRange?: string | string[];
  }>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ---------------------------------------------
// Formatting utilities
// ---------------------------------------------

function formatStatus(status: string): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

function getStatusStyle(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "DELIVERY_FAILED":
    case "CANCELLED":
      return "bg-red-50 text-red-700";

    case "DRAFT":
      return "bg-slate-100 text-slate-600";

    case "IN_TRANSIT":
    case "OUT_FOR_DELIVERY":
    case "RETURN_IN_TRANSIT":
      return "bg-blue-50 text-blue-700";

    case "READY_FOR_PICKUP":
    case "PICKUP_ASSIGNED":
    case "PICKED_UP":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-teal-50 text-teal-700";
  }
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// ---------------------------------------------
// Shipment status
// ---------------------------------------------

function ShipmentStatus({
  status,
}: {
  status: string;
}) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ---------------------------------------------
// Filter loading skeleton
// ---------------------------------------------

function FiltersSkeleton() {
  return (
    <div aria-label="Loading shipment filters"
      className="grid gap-4 border-b border-slate-100 p-5 sm:p-6 lg:grid-cols-[1.5fr_1fr_1fr]">

      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />

          <div className="h-11 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------
// Empty state
// ---------------------------------------------

function EmptyShipments({
  hasFilters,
}: {
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
        <PackageOpen
          aria-hidden="true"
          className="size-7"
        />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[#102D46]">
        {hasFilters
          ? "No matching shipments"
          : "No shipments yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
        {hasFilters
          ? "No shipments match your current filters. Try a different tracking code, status, or date range."
          : "Your shipment records will appear here after you create your first booking."}
      </p>

      {hasFilters && (
        <Link
          href="/customer/shipments"
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-[#00877B] transition-colors hover:bg-[#E8F5F2]"
        >
          Clear all filters
        </Link>
      )}
    </div>
  );
}

// ---------------------------------------------
// Shipment table
// ---------------------------------------------

function ShipmentTable({
  shipments,
  hubNames,
  hasFilters,
}: {
  shipments: CustomerShipment[];
  hubNames: Map<number, string>;
  hasFilters: boolean;
}) {
  if (shipments.length === 0) {
    return <EmptyShipments hasFilters={hasFilters} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-[#F8FAFC]">
          <tr className="text-xs text-slate-500">
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
              Route
            </th>

            <th
              scope="col"
              className="px-6 py-4 font-semibold"
            >
              Created
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
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {shipments.map((shipment) => {
            const origin =
              hubNames.get(shipment.originHubId) ??
              `Hub #${shipment.originHubId}`;

            const destination =
              hubNames.get(shipment.destinationHubId) ??
              `Hub #${shipment.destinationHubId}`;

            return (
              <tr
                key={shipment.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="px-6 py-5 font-semibold text-[#00877B]">
                  {shipment.trackingCode}
                </td>

                <td className="px-6 py-5 text-[#102D46]">
                  {origin}
                  <span className="mx-2 text-slate-400">
                    →
                  </span>
                  {destination}
                </td>

                <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                  {formatDate(shipment.createdAt)}
                </td>

                <td className="px-6 py-5">
                  <ShipmentStatus
                    status={shipment.status}
                  />
                </td>

                <td className="px-6 py-5">
                  <span
                    aria-disabled="true"
                    title="Shipment details page coming in Step 24"
                    className="cursor-not-allowed whitespace-nowrap text-xs font-semibold text-slate-400"
                  >
                    {shipment.status === "DRAFT"
                      ? "Review & pay"
                      : "View details"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------
// Pagination
// ---------------------------------------------

function ShipmentPagination({
  pagination,
  count,
  filters,
}: {
  pagination: Pagination;
  count: number;
  filters: ShipmentFilterValues;
}) {
  const {
    page,
    limit,
    total,
    totalPages,
  } = pagination;

  const first =
    count === 0 ? 0 : (page - 1) * limit + 1;

  const last =
    count === 0 ? 0 : first + count - 1;

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const linkClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-[#102D46] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]";

  const disabledClass =
    "inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 px-3 text-sm text-slate-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav
        aria-label="Shipment pagination"
        className="flex items-center gap-2"
      >
        {canGoPrevious ? (
          <Link
            href={shipmentListHref(
              filters,
              page - 1,
            )}
            prefetch={false}
            className={linkClass}
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4"
            />
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={disabledClass}
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4"
            />
            Previous
          </span>
        )}

        {canGoNext ? (
          <Link
            href={shipmentListHref(
              filters,
              page + 1,
            )}
            prefetch={false}
            className={linkClass}
          >
            Next
            <ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={disabledClass}
          >
            Next
            <ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </span>
        )}
      </nav>
    </div>
  );
}

// ---------------------------------------------
// Customer My Shipments page
// ---------------------------------------------

export default async function MyShipmentsPage({
  searchParams,
}: PageProps) {
  const filters = parseShipmentFilters(
    await searchParams,
  );

  const [data, hubNames] = await Promise.all([
    getCustomerShipments(filters),
    getHubNames(),
  ]);

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    filters.dateRange !== "all";

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#102D46]">
          My shipments
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          A clear view of your shipments,
          from pickup to delivery.
        </p>
      </header>

      {/* Create shipment action */}
      <div>
        <button
          type="button"
          disabled
          title="Shipment creation is coming in a later step"
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white opacity-60"
        >
          <Plus
            aria-hidden="true"
            className="size-4"
          />

          Create shipment
        </button>
      </div>

      {/* Shipments and filters */}
      <section
        aria-label="My shipment records"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        {/* URL-synchronized filters */}
        <Suspense fallback={<FiltersSkeleton />}>
          <ShipmentFilters />
        </Suspense>

        {/* Real backend shipment records */}
        <ShipmentTable
          shipments={data.items}
          hubNames={hubNames}
          hasFilters={hasFilters}
        />

        {/* Preserve filters while changing pages */}
        <ShipmentPagination
          pagination={data.pagination}
          count={data.items.length}
          filters={filters}
        />
      </section>
    </div>
  );
}
