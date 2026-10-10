/** biome-ignore-all lint/suspicious/noRedeclare: <explanation> */

"use client";

import {
  useCallback,
  useEffect,
  useState,
  useTransition,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  RotateCcw,
  Search,
} from "lucide-react";

import {
  parseShipmentFilters,
  shipmentListHref,
  shipmentStatuses,
  type DateRange,
  type ShipmentFilters,
  type ShipmentStatus,
} from "@/lib/shipment-filter";

export function ShipmentFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isPending, startTransition] =
    useTransition();

  const filters = parseShipmentFilters({
    page: searchParams.get("page") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    dateRange:
      searchParams.get("dateRange") ?? undefined,
  });

  const [search, setSearch] = useState(
    filters.search,
  );

  const {
    search: currentSearch,
    status: currentStatus,
    dateRange: currentDateRange,
  } = filters;

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const updateFilters = useCallback(
    (
      changes: Partial<
        Pick<
          ShipmentFilters,
          "search" | "status" | "dateRange"
        >
      >,
    ) => {
      const nextFilters: ShipmentFilters = {
        page: 1,
        search: currentSearch,
        status: currentStatus,
        dateRange: currentDateRange,
        ...changes,
      };

      startTransition(() => {
        router.replace(
          shipmentListHref(nextFilters),
          { scroll: false },
        );
      });
    },
    [
      router,
      currentSearch,
      currentStatus,
      currentDateRange,
    ],
  );

  // Debounce search requests.
  useEffect(() => {
    const trimmedSearch = search.trim();

    if (trimmedSearch === currentSearch) {
      return;
    }

    const timeout = window.setTimeout(() => {
      updateFilters({
        search: trimmedSearch,
      });
    }, 400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [search, currentSearch, updateFilters]);

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.status) ||
    filters.dateRange !== "all";

  function resetFilters() {
    setSearch("");

    startTransition(() => {
      router.replace(
        "/customer/shipments",
        { scroll: false },
      );
    });
  }

  return (
    <div
      aria-busy={isPending}
      className="border-b border-slate-100 p-5 sm:p-6"
    >
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr]">
        {/* Tracking-code search */}
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
              value={search}
              maxLength={80}
              autoComplete="off"
              placeholder="Search by tracking code..."
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#102D46] outline-none placeholder:text-slate-400 focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15"
            />
          </div>
        </div>

        {/* Shipment status */}
        <div>
          <label
            htmlFor="shipment-status-filter"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Filter by status
          </label>

          <select
            id="shipment-status-filter"
            value={filters.status}
            onChange={(event) => {
              updateFilters({
                search: search.trim(),
                status: event.target
                  .value as ShipmentStatus | "",
              });
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15"
          >
            <option value="">
              All statuses
            </option>

            {shipmentStatuses.map((status: ShipmentStatus) => (
              <option key={status} value={status}>
                {status
                  .replaceAll("_", " ")
                  .toLowerCase()
                  .replace(/^./, (char: string) =>
                    char.toUpperCase(),
                  )}
              </option>
            ))}
          </select>
        </div>

        {/* Creation date */}
        <div>
          <label
            htmlFor="shipment-date-filter"
            className="mb-2 block text-xs font-semibold text-slate-600"
          >
            Filter by date
          </label>

          <select
            id="shipment-date-filter"
            value={filters.dateRange}
            onChange={(event) => {
              updateFilters({
                search: search.trim(),
                dateRange: event.target
                  .value as DateRange,
              });
            }}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15"
          >
            <option value="all">
              All dates
            </option>

            <option value="7d">
              Last 7 days
            </option>

            <option value="30d">
              Last 30 days
            </option>

            <option value="90d">
              Last 90 days
            </option>
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#00877B] transition-colors hover:text-[#006F66] focus-visible:underline"
          >
            <RotateCcw
              aria-hidden="true"
              className="size-3.5"
            />

            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
