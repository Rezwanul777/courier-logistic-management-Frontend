/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Search,
  ScrollText,
} from "lucide-react";

import {
  adminAuditHref,
  parseAdminAuditFilters,
  type AdminAuditFilters,
  type AdminAuditSearchParams,
} from "@/lib/admin-audit-filters";

import {
  getAdminAuditLogs,
  type AuditEntry,
  type AdminAuditLogList,
} from "@/lib/server/admin-audit-logs";

export const metadata: Metadata = {
  title: "Audit Logs | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<AdminAuditSearchParams>;
}

// ---------------------------------------------
// Formatting
// ---------------------------------------------

function readable(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(date) + " UTC"
  );
}

// ---------------------------------------------
// Audit filters
// ---------------------------------------------

function AuditFilters({
  filters,
}: {
  filters: AdminAuditFilters;
}) {
  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B]";

  const labelClass =
    "block text-xs font-semibold text-slate-500";

  return (
    <form
      key={JSON.stringify(filters)}
      action="/admin/audit-logs"
      method="get"
      role="search"
      className="grid gap-4 border-b border-slate-100 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3"
    >
      <div className="space-y-2">
        <label
          htmlFor="audit-action"
          className={labelClass}
        >
          Action
        </label>

        <input
          id="audit-action"
          name="action"
          type="text"
          maxLength={80}
          defaultValue={filters.action}
          placeholder="e.g. USER_DEACTIVATED"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="audit-entity-type"
          className={labelClass}
        >
          Entity type
        </label>

        <input
          id="audit-entity-type"
          name="entityType"
          type="text"
          maxLength={60}
          defaultValue={filters.entityType}
          placeholder="e.g. User"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="audit-actor"
          className={labelClass}
        >
          Actor ID
        </label>

        <input
          id="audit-actor"
          name="actorId"
          type="number"
          min={1}
          max={2147483647}
          step={1}
          defaultValue={filters.actorId ?? ""}
          placeholder="All actors"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="audit-target"
          className={labelClass}
        >
          Target record ID
        </label>

        <input
          id="audit-target"
          name="entityId"
          type="number"
          min={1}
          max={2147483647}
          step={1}
          defaultValue={filters.entityId ?? ""}
          placeholder="All records"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="audit-from"
          className={labelClass}
        >
          From date (UTC)
        </label>

        <input
          id="audit-from"
          name="from"
          type="date"
          defaultValue={filters.from}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="audit-to"
          className={labelClass}
        >
          To date (UTC)
        </label>

        <input
          id="audit-to"
          name="to"
          type="date"
          defaultValue={filters.to}
          className={inputClass}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-3">
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66]"
        >
          <Search
            aria-hidden="true"
            className="size-4"
          />
          Apply filters
        </button>

        <Link
          href="/admin/audit-logs"
          className="inline-flex h-11 items-center px-3 text-sm font-medium text-slate-500 hover:text-[#00877B] hover:underline"
        >
          Clear filters
        </Link>
      </div>
    </form>
  );
}

// ---------------------------------------------
// Audit history table
// ---------------------------------------------

function AuditTable({
  entries,
}: {
  entries: AuditEntry[];
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <ScrollText
          aria-hidden="true"
          className="size-11 text-slate-400"
        />

        <h2 className="mt-4 text-lg font-semibold text-[#102D46]">
          No audit events found
        </h2>

        <p className="mt-2 max-w-md text-sm leading-7 text-slate-500">
          No recorded events match the selected
          filters. Try another date range or
          clear the filters.
        </p>

        <Link
          href="/admin/audit-logs"
          className="mt-5 text-sm font-semibold text-[#00877B] hover:underline"
        >
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] text-left text-sm">
        <thead className="bg-slate-50 text-xs text-slate-500">
          <tr>
            <th scope="col" className="px-5 py-4">
              Event
            </th>

            <th scope="col" className="px-5 py-4">
              Performed by
            </th>

            <th scope="col" className="px-5 py-4">
              Target
            </th>

            <th scope="col" className="px-5 py-4">
              Reason
            </th>

            <th scope="col" className="px-5 py-4">
              Timestamp
            </th>

            <th scope="col" className="px-5 py-4">
              Trace
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="align-top hover:bg-slate-50/70"
            >
              {/* Recorded action */}
              <td className="px-5 py-5">
                <span className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-[#00877B]">
                  {readable(entry.action)}
                </span>

                <p className="mt-2 break-all text-xs text-slate-500">
                  {entry.action}
                </p>
              </td>

              {/* Actor information */}
              <td className="px-5 py-5">
                <p className="font-semibold text-[#102D46]">
                  {entry.actor.name ||
                    entry.actor.email}
                </p>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {entry.actor.email}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Actor #{entry.actorId}
                </p>
              </td>

              {/* Affected record */}
              <td className="px-5 py-5">
                <p className="font-medium text-[#102D46]">
                  {entry.entityType}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Record #{entry.entityId}
                </p>
              </td>

              {/* Administrative reason */}
              <td className="max-w-[250px] px-5 py-5">
                <p className="break-words text-sm leading-6 text-slate-600">
                  {entry.reason?.trim() ||
                    "No reason recorded"}
                </p>
              </td>

              {/* UTC timestamp */}
              <td className="whitespace-nowrap px-5 py-5 text-slate-600">
                <time dateTime={entry.createdAt}>
                  {formatDate(entry.createdAt)}
                </time>
              </td>

              {/* Request trace */}
              <td className="px-5 py-5">
                <details className="max-w-[220px]">
                  <summary className="cursor-pointer text-xs font-semibold text-[#00877B]">
                    Request ID
                  </summary>

                  <code className="mt-2 block break-all text-xs text-slate-600">
                    {entry.requestId}
                  </code>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------
// Pagination
// ---------------------------------------------

function AuditPagination({
  data,
  filters,
}: {
  data: AdminAuditLogList;
  filters: AdminAuditFilters;
}) {
  const {
    page,
    limit,
    total,
    totalPages,
  } = data.pagination;

  const first =
    data.items.length > 0
      ? (page - 1) * limit + 1
      : 0;

  const last =
    data.items.length > 0
      ? first + data.items.length - 1
      : 0;

  const linkClass =
    "inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-[#102D46] hover:bg-slate-50";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav
        aria-label="Audit pagination"
        className="flex items-center gap-3"
      >
        {page > 1 ? (
          <Link
            href={adminAuditHref({
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
            className="text-sm text-slate-400"
          >
            Previous
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={adminAuditHref({
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
            className="text-sm text-slate-400"
          >
            Next
          </span>
        )}
      </nav>
    </div>
  );
}

// ---------------------------------------------
// Main Server Component
// ---------------------------------------------

export default async function AdminAuditLogsPage({
  searchParams,
}: PageProps) {
  const filters = parseAdminAuditFilters(
    await searchParams,
  );

  const data = await getAdminAuditLogs(filters);

  const lastPage = Math.max(
    1,
    data.pagination.totalPages,
  );

  if (filters.page > lastPage) {
    redirect(
      adminAuditHref({
        ...filters,
        page: lastPage,
      }),
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Audit logs
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Review recorded account and system
          activity, including actors, affected
          records, timestamps, and reasons.
        </p>
      </header>

      <section
        aria-label="Audit log directory"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-[#102D46]">
              Activity history
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Events recorded in PostgreSQL
            </p>
          </div>

          <span className="rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-[#00877B]">
            {data.pagination.total} matching events
          </span>
        </div>

        <AuditFilters filters={filters} />

        <AuditTable entries={data.items} />

        <AuditPagination
          data={data}
          filters={filters}
        />
      </section>

      <p className="text-xs leading-6 text-slate-500">
        This workspace displays existing audit
        records only. It does not create events
        or modify saved history. Dates use UTC,
        and individual request IDs are available
        for tracing recorded operations.
      </p>
    </div>
  );
}
