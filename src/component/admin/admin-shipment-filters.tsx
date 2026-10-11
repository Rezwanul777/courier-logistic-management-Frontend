/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  type FormEvent,
  useEffect,
  useState,
  useTransition,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { RefreshCcw, Search } from "lucide-react";

import {
  adminShipmentHref,
  adminShipmentStatuses,
  type AdminShipmentFilters,
  type AdminShipmentStatus,
  type AdminShipmentDateRange,
  type AdminShipmentSort,
} from "@/lib/admin-shipment-filters";

interface Props {
  filters: AdminShipmentFilters;
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15 disabled:opacity-60";

function statusLabel(value: string) {
  if (value === "ALL") {
    return "All statuses";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function AdminShipmentFiltersPanel({
  filters,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState(
    filters.search,
  );

  const [pending, startTransition] =
    useTransition();

  useEffect(() => {
    setSearch(filters.search);
  }, [filters.search]);

  function apply(
    updates: Partial<AdminShipmentFilters>,
  ) {
    const next: AdminShipmentFilters = {
      ...filters,
      search: search.trim().slice(0, 100),
      ...updates,
      page: 1,
    };

    startTransition(() => {
      router.push(
        adminShipmentHref(next),
        { scroll: false },
      );
    });
  }

  function searchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    apply({
      search: search.trim(),
    });
  }

  const hasFilters =
    Boolean(filters.search) ||
    filters.status !== "ALL" ||
    filters.tab !== "all" ||
    filters.dateRange !== "30d" ||
    filters.sort !== "newest";

  return (
    <form
      role="search"
      onSubmit={searchSubmit}
      className="border-b border-slate-100 p-5 sm:p-6"
    >
      <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
        <div className="space-y-2">
          <label
            htmlFor="admin-shipment-search"
            className="block text-xs font-semibold text-slate-500"
          >
            Search
          </label>

          <div className="flex gap-2">
            <input
              id="admin-shipment-search"
              type="search"
              placeholder="Search by tracking code..."
              autoComplete="off"
              maxLength={100}
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              className={inputClass}
            />

            <button
              type="submit"
              disabled={pending}
              aria-label="Search shipments"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#00877B] text-white hover:bg-[#006F66] disabled:opacity-60"
            >
              <Search
                aria-hidden="true"
                className="size-4"
              />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-shipment-status"
            className="block text-xs font-semibold text-slate-500"
          >
            Filter
          </label>

          <select
            id="admin-shipment-status"
            value={filters.status}
            disabled={pending}
            onChange={(event) => {
              apply({
                status:
                  event.target.value as AdminShipmentStatus,
                tab: "all",
              });
            }}
            className={inputClass}
          >
            {adminShipmentStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-shipment-range"
            className="block text-xs font-semibold text-slate-500"
          >
            Date range
          </label>

          <select
            id="admin-shipment-range"
            value={filters.dateRange}
            disabled={pending}
            onChange={(event) => {
              apply({
                dateRange:
                  event.target.value as AdminShipmentDateRange,
              });
            }}
            className={inputClass}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          Sort
          <select
            aria-label="Shipment sort order"
            value={filters.sort}
            disabled={pending}
            onChange={(event) => {
              apply({
                sort:
                  event.target.value as AdminShipmentSort,
              });
            }}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-[#102D46]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>

        {hasFilters && (
          <Link
            href="/admin/shipments"
            scroll={false}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#00877B] hover:underline"
          >
            <RefreshCcw
              aria-hidden="true"
              className="size-3.5"
            />
            Clear filters
          </Link>
        )}
      </div>

      {pending && (
        <p
          role="status"
          className="mt-3 text-xs text-[#00877B]"
        >
          Updating shipments...
        </p>
      )}
    </form>
  );
}
