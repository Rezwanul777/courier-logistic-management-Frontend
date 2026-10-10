
import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  PackageOpen,
  Plus,
  Search,
} from "lucide-react";

import {
  getCustomerShipments,
  getHubNames,
  type CustomerShipment,
} from "@/lib/server/customer-shipments";

export const metadata: Metadata = {
  title: "My Shipments",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{
    page?: string | string[];
  }>;
}

function getPageNumber(
  value: string | string[] | undefined,
): number {
  if (typeof value !== "string") {
    return 1;
  }

  const page = Number(value);

  return Number.isSafeInteger(page) &&
    page >= 1 &&
    page <= 10000
    ? page
    : 1;
}

function getStatusStyle(status: string): string {
  if (status === "DELIVERED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status.includes("FAILED")) {
    return "bg-red-50 text-red-700";
  }

  if (status === "DRAFT") {
    return "bg-slate-100 text-slate-600";
  }

  if (status === "IN_TRANSIT") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

function ShipmentStatus({
  status,
}: {
  status: string;
}) {
  const label = status
    .replaceAll("_", " ")
    .toLowerCase();

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(status)}`}
    >
      {label}
    </span>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);

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

function ShipmentFilters() {
  return (
    <div className="grid gap-4 border-b border-slate-100 p-5 sm:p-6 lg:grid-cols-[1.5fr_1fr_1fr]">
      <div>
        <label
          htmlFor="shipment-search"
          className="mb-2 block text-xs font-semibold text-slate-600"
        >
          Search
        </label>

        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          />

          <input
            id="shipment-search"
            type="search"
            disabled
            placeholder="Search by tracking code..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="shipment-status-filter"
          className="mb-2 block text-xs font-semibold text-slate-600"
        >
          Status
        </label>

        <select
          id="shipment-status-filter"
          disabled
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 disabled:cursor-not-allowed"
        >
          <option>All statuses</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="shipment-date-filter"
          className="mb-2 block text-xs font-semibold text-slate-600"
        >
          Date
        </label>

        <select
          id="shipment-date-filter"
          disabled
          className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600 disabled:cursor-not-allowed"
        >
          <option>All dates</option>
        </select>
      </div>

      <p className="text-xs text-slate-500 lg:col-span-3">
        Search and filtering will be enabled when
        backend filtering is implemented.
      </p>
    </div>
  );
}

function ShipmentTable({
  shipments,
  hubNames,
}: {
  shipments: CustomerShipment[];
  hubNames: Map<number, string>;
}) {
  if (shipments.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
          <PackageOpen
            aria-hidden="true"
            className="size-7"
          />
        </div>

        <h2 className="mt-5 text-lg font-semibold text-[#102D46]">
          No shipments found
        </h2>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-7 text-slate-500">
          Your shipment records will appear here
          after you create a booking.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-[#F8FAFC]">
          <tr className="text-xs text-slate-500">
            <th scope="col" className="px-6 py-4 font-semibold">
              Tracking code
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Route
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Created
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-4 font-semibold">
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
                  {origin} → {destination}
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
                    title="Shipment details page coming next"
                    className="whitespace-nowrap text-xs font-medium text-slate-400"
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

function ShipmentPagination({
  page,
  total,
  totalPages,
  count,
}: {
  page: number;
  total: number;
  totalPages: number;
  count: number;
}) {
  const first =
    count === 0 ? 0 : (page - 1) * 10 + 1;

  const last =
    count === 0 ? 0 : first + count - 1;

  const previousEnabled = page > 1;
  const nextEnabled = page < totalPages;

  const linkClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-[#102D46] hover:bg-slate-50";

  const disabledClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-100 px-3 text-sm text-slate-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav
        aria-label="Shipment pagination"
        className="flex items-center gap-2"
      >
        {previousEnabled ? (
          <Link
            href={`?page=${page - 1}`}
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
            Previous
          </span>
        )}

        {nextEnabled ? (
          <Link
            href={`?page=${page + 1}`}
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
          </span>
        )}
      </nav>
    </div>
  );
}

export default async function MyShipmentsPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const page = getPageNumber(params.page);

  const [data, hubNames] = await Promise.all([
    getCustomerShipments(page),
    getHubNames(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-[#102D46]">
          My shipments
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          A clear view of your shipments,
          from pickup to delivery.
        </p>
      </div>

      <div>
        <button
          type="button"
          disabled
          title="Shipment creation will be available in a later step"
          className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white opacity-60"
        >
          <Plus
            aria-hidden="true"
            className="size-4"
          />
          Create shipment
        </button>
      </div>

      <section
        aria-label="My shipment records"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <ShipmentFilters />

        <ShipmentTable
          shipments={data.items}
          hubNames={hubNames}
        />

        <ShipmentPagination
          page={data.pagination.page}
          total={data.pagination.total}
          totalPages={data.pagination.totalPages}
          count={data.items.length}
        />
      </section>
    </div>
  );
}
