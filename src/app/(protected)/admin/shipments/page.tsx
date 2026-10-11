
import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  PackageSearch,
} from "lucide-react";

import { AdminShipmentFiltersPanel } from
  "@/component/admin/admin-shipment-filters";

import {
  adminShipmentHref,
  parseAdminShipmentFilters,
  type AdminShipmentFilters,
  type AdminShipmentSearchParams,
  type AdminShipmentTab,
} from "@/lib/admin-shipment-filters";

import {
  getAdminShipments,
  type AdminShipment,
  type AdminShipmentList,
} from "@/lib/server/admin-shipments";

// --------------------------------------------------
// Page configuration
// --------------------------------------------------

export const metadata: Metadata = {
  title: "Shipment Management | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<AdminShipmentSearchParams>;
}

// --------------------------------------------------
// Shipment categories
// --------------------------------------------------

const tabs: {
  label: string;
  value: AdminShipmentTab;
}[] = [
  {
    label: "All shipments",
    value: "all",
  },
  {
    label: "Ready for pickup",
    value: "ready",
  },
  {
    label: "In transit",
    value: "transit",
  },
  {
    label: "Delivered",
    value: "delivered",
  },
  {
    label: "Exceptions",
    value: "exceptions",
  },
];

// --------------------------------------------------
// Formatting
// --------------------------------------------------

function readableStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function statusClass(status: string): string {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "IN_TRANSIT":
      return "bg-blue-50 text-blue-700";

    case "READY_FOR_PICKUP":
    case "PICKUP_ASSIGNED":
      return "bg-teal-50 text-teal-700";

    case "DRAFT":
      return "bg-amber-50 text-amber-700";

    case "DELIVERY_FAILED":
    case "CANCELLED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

// --------------------------------------------------
// Shipment tabs
// --------------------------------------------------

function ShipmentTabs({
  filters,
}: {
  filters: AdminShipmentFilters;
}) {
  return (
    <nav
      aria-label="Shipment categories"
      className="overflow-x-auto border-b border-slate-100 px-5"
    >
      <div className="flex min-w-max items-center gap-6">
        {tabs.map((tab) => {
          const active =
            filters.tab === tab.value;

          return (
            <Link
              key={tab.value}
              href={adminShipmentHref({
                ...filters,
                page: 1,
                status: "ALL",
                tab: tab.value,
              })}
              aria-current={
                active ? "page" : undefined
              }
              className={
                active
                  ? "border-b-2 border-[#00877B] py-4 text-sm font-semibold text-[#00877B]"
                  : "border-b-2 border-transparent py-4 text-sm font-medium text-slate-500 hover:text-[#102D46]"
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// --------------------------------------------------
// Shipment table
// --------------------------------------------------

function ShipmentTable({
  items,
}: {
  items: AdminShipment[];
}) {
  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <PackageSearch
          aria-hidden="true"
          className="size-12 text-[#00877B]"
        />

        <h2 className="mt-5 text-lg font-semibold text-[#102D46]">
          No matching shipments
        </h2>

        <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
          No shipment records match your current
          search, status, and date filters.
        </p>

        <Link
          href="/admin/shipments"
          className="mt-5 rounded-lg bg-[#00877B] px-5 py-3 text-sm font-semibold text-white hover:bg-[#006F66]"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-[#F8FAFC] text-xs text-slate-500">
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
              Customer
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
          {items.map((shipment) => (
            <tr
              key={shipment.id}
              className="hover:bg-slate-50/70"
            >
              {/* Tracking code */}
              <td className="px-6 py-5 font-semibold text-[#00877B]">
                {shipment.trackingCode}
              </td>

              {/* Customer */}
              <td className="px-6 py-5 text-[#102D46]">
                {shipment.customerName}
              </td>

              {/* Route */}
              <td className="px-6 py-5 text-[#102D46]">
                {shipment.originHub}

                <span className="px-2 text-slate-400">
                  →
                </span>

                {shipment.destinationHub}
              </td>

              {/* Shipment status */}
              <td className="px-6 py-5">
                <span
                  className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${statusClass(shipment.status)}`}
                >
                  {readableStatus(
                    shipment.status,
                  )}
                </span>
              </td>

              {/* Functional View details link */}
              <td className="px-6 py-5">
                <Link
                  href={`/admin/shipments/${shipment.id}`}
                  prefetch={false}
                  className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#00877B] transition-colors hover:text-[#006F66] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
                >
                  View details

                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                  />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------
// Pagination
// --------------------------------------------------

function ShipmentPagination({
  pagination,
  count,
  filters,
}: {
  pagination: AdminShipmentList["pagination"];
  count: number;
  filters: AdminShipmentFilters;
}) {
  const {
    page,
    limit,
    total,
    totalPages,
  } = pagination;

  const first =
    count > 0
      ? (page - 1) * limit + 1
      : 0;

  const last =
    count > 0
      ? first + count - 1
      : 0;

  const linkClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-[#102D46] hover:bg-slate-50";

  const disabledClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-100 px-4 text-sm text-slate-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      {/* Pagination summary */}
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav
        aria-label="Shipment pagination"
        className="flex items-center gap-2"
      >
        {/* Previous page */}
        {page > 1 ? (
          <Link
            href={adminShipmentHref({
              ...filters,
              page: page - 1,
            })}
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

        {/* Next page */}
        {page < totalPages ? (
          <Link
            href={adminShipmentHref({
              ...filters,
              page: page + 1,
            })}
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

// --------------------------------------------------
// Main Admin Shipments page
// --------------------------------------------------

export default async function AdminShipmentsPage({
  searchParams,
}: PageProps) {
  // Parse URL filters
  const filters = parseAdminShipmentFilters(
    await searchParams,
  );

  // Fetch real shipment records
  const data = await getAdminShipments(filters);

  // Normalize pagination
  const lastPage = Math.max(
    1,
    data.pagination.totalPages,
  );

  // Redirect when page is outside available range
  if (filters.page > lastPage) {
    redirect(
      adminShipmentHref({
        ...filters,
        page: lastPage,
      }),
    );
  }

  return (
    <div className="space-y-7">
      {/* Page header */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Shipment management
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Manage the movement, people, and details
          behind every delivery.
        </p>
      </header>

      {/* Shipment management panel */}
      <section
        aria-label="All customer shipments"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        {/* Search, status filter, date filter */}
        <AdminShipmentFiltersPanel
          filters={filters}
        />

        {/* Shipment category tabs */}
        <ShipmentTabs
          filters={filters}
        />

        {/* Real database shipment records */}
        <ShipmentTable
          items={data.items}
        />

        {/* Functional pagination */}
        <ShipmentPagination
          pagination={data.pagination}
          count={data.items.length}
          filters={filters}
        />
      </section>

      <p className="text-xs leading-6 text-slate-500">
        Shipment records are loaded from the
        backend. Select View details to review a
        shipment and its operational history.
      </p>
    </div>
  );
}
