/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Search,
} from "lucide-react";

import {
  courierHistoryHref,
  parseCourierHistoryFilters,
  type CourierHistoryFilters,
  type CourierHistorySearchParams,
} from "@/lib/courier-history-filters";

import {
  getCourierTaskHistory,
  type CourierHistoryItem,
  type CourierHistoryData,
} from "@/lib/server/courier-task-history";

import {
  formatTaskDate,
  taskStatusLabel,
} from "@/lib/courier-task-format";

export const metadata: Metadata = {
  title: "Task History | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<CourierHistorySearchParams>;
}

// ---------------------------------------------
// Performance card
// ---------------------------------------------

function PerformanceCard({
  label,
  count,
  description,
}: {
  label: string;
  count: number;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#102D46]">
        {count}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

// ---------------------------------------------
// History search and filters
// ---------------------------------------------

function HistoryFilters({
  filters,
}: {
  filters: CourierHistoryFilters;
}) {
  return (
    <form
      key={`${filters.type}-${filters.search}-${filters.sort}`}
      action="/courier/history"
      method="get"
      role="search"
      className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-[minmax(0,1fr)_180px_180px]"
    >
      <div className="space-y-2">
        <label
          htmlFor="history-search"
          className="block text-xs font-semibold text-slate-500"
        >
          Search tracking code
        </label>

        <input
          id="history-search"
          name="search"
          type="search"
          maxLength={100}
          defaultValue={filters.search}
          placeholder="Enter tracking code..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B]"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="history-type"
          className="block text-xs font-semibold text-slate-500"
        >
          Task type
        </label>

        <select
          id="history-type"
          name="type"
          defaultValue={filters.type}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46]"
        >
          <option value="ALL">All tasks</option>
          <option value="PICKUP">Pickup</option>
          <option value="DELIVERY">Delivery</option>
          <option value="RETURN">Return</option>
        </select>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="history-sort"
          className="block text-xs font-semibold text-slate-500"
        >
          Sort order
        </label>

        <select
          id="history-sort"
          name="sort"
          defaultValue={filters.sort}
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:col-span-3">
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66]"
        >
          <Search
            aria-hidden="true"
            className="size-4"
          />
          Apply filters
        </button>

        <Link
          href="/courier/history"
          className="text-sm font-medium text-slate-500 hover:text-[#00877B] hover:underline"
        >
          Clear filters
        </Link>
      </div>
    </form>
  );
}

// ---------------------------------------------
// Completed task table
// ---------------------------------------------

function HistoryTable({
  items,
}: {
  items: CourierHistoryItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <ClipboardList
          aria-hidden="true"
          className="size-11 text-slate-400"
        />

        <h2 className="mt-4 text-lg font-semibold text-[#102D46]">
          No completed tasks found
        </h2>

        <p className="mt-2 text-sm leading-7 text-slate-500">
          Completed tasks matching your filters
          will appear here.
        </p>

        <Link
          href="/courier/history"
          className="mt-5 text-sm font-semibold text-[#00877B] hover:underline"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th scope="col" className="px-6 py-4">
              Shipment
            </th>

            <th scope="col" className="px-6 py-4">
              Task type
            </th>

            <th scope="col" className="px-6 py-4">
              Status
            </th>

            <th scope="col" className="px-6 py-4">
              Completed at
            </th>

            <th scope="col" className="px-6 py-4">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {items.map((task) => (
            <tr
              key={task.id}
              className="hover:bg-slate-50/70"
            >
              <td className="px-6 py-5">
                <p className="break-all font-semibold text-[#102D46]">
                  {task.shipment.trackingCode}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Task #{task.id}
                </p>
              </td>

              <td className="px-6 py-5 font-medium text-[#102D46]">
                {taskStatusLabel(task.type)}
              </td>

              <td className="px-6 py-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-3.5"
                  />
                  Completed
                </span>
              </td>

              <td className="whitespace-nowrap px-6 py-5 text-slate-600">
                {task.completedAt
                  ? formatTaskDate(task.completedAt)
                  : "Not recorded"}
              </td>

              <td className="px-6 py-5">
                <Link
                  href={`/courier/tasks/${task.id}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#00877B] hover:underline"
                >
                  View task
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

// ---------------------------------------------
// Server-side pagination
// ---------------------------------------------

function HistoryPagination({
  data,
  filters,
}: {
  data: CourierHistoryData;
  filters: CourierHistoryFilters;
}) {
  const { page, limit, total, totalPages } =
    data.pagination;

  const first =
    data.items.length > 0
      ? (page - 1) * limit + 1
      : 0;

  const last =
    data.items.length > 0
      ? first + data.items.length - 1
      : 0;

  const linkClass =
    "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-[#102D46] hover:bg-slate-50";

  const disabledClass =
    "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-100 px-4 text-sm text-slate-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav
        aria-label="Task history pagination"
        className="flex items-center gap-2"
      >
        {page > 1 ? (
          <Link
            href={courierHistoryHref({
              ...filters,
              page: page - 1,
            })}
            prefetch={false}
            className={linkClass}
          >
            <ArrowLeft className="size-4" />
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={disabledClass}
          >
            <ArrowLeft className="size-4" />
            Previous
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={courierHistoryHref({
              ...filters,
              page: page + 1,
            })}
            prefetch={false}
            className={linkClass}
          >
            Next
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className={disabledClass}
          >
            Next
            <ArrowRight className="size-4" />
          </span>
        )}
      </nav>
    </div>
  );
}

// ---------------------------------------------
// Main Courier History page
// ---------------------------------------------

export default async function CourierHistoryPage({
  searchParams,
}: PageProps) {
  const filters = parseCourierHistoryFilters(
    await searchParams,
  );

  const data = await getCourierTaskHistory(filters);

  const lastPage = Math.max(
    1,
    data.pagination.totalPages,
  );

  if (filters.page > lastPage) {
    redirect(
      courierHistoryHref({
        ...filters,
        page: lastPage,
      }),
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Courier workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Task history & performance
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Review your completed courier tasks
          and recorded pickup and delivery activity.
        </p>
      </header>

      <section
        aria-label="Courier task performance"
        className="grid gap-4 sm:grid-cols-3"
      >
        <PerformanceCard
          label="Completed tasks"
          count={data.summary.completed}
          description="All recorded completions"
        />

        <PerformanceCard
          label="Pickup tasks"
          count={data.summary.pickup}
          description="Completed parcel pickups"
        />

        <PerformanceCard
          label="Delivery tasks"
          count={data.summary.delivery}
          description="Completed parcel deliveries"
        />
      </section>

      <section
        aria-label="Completed task records"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <HistoryFilters filters={filters} />

        <HistoryTable items={data.items} />

        <HistoryPagination
          data={data}
          filters={filters}
        />
      </section>

      <p className="text-xs leading-6 text-slate-500">
        Only tasks assigned to your courier
        account and marked as completed appear
        here. Performance totals are all-time
        counts and do not change with table filters.
      </p>
    </div>
  );
}
