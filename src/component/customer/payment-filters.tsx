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

import {
  RefreshCcw,
  Search,
} from "lucide-react";

import {
  paymentListHref,
  type PaymentFilterValues,
  type PaymentSort,
  type PaymentStatusFilter,
} from "@/lib/payment-filters";

interface PaymentFiltersProps {
  filters: PaymentFilterValues;
}

const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none transition-colors focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15 disabled:opacity-60";

export function PaymentFilters({
  filters,
}: PaymentFiltersProps) {
  const router = useRouter();

  const [search, setSearch] = useState(
    filters.search,
  );

  const [isPending, startTransition] =
    useTransition();

  // Keep the search field synchronized when
  // navigating with Back/Forward.
  useEffect(() => {
    setSearch(filters.search);
  }, [filters.search]);

  function applyFilters(
    next: Partial<PaymentFilterValues>,
  ) {
    const updated: PaymentFilterValues = {
      ...filters,
      search: search.trim().slice(0, 100),
      ...next,
      page: 1,
    };

    startTransition(() => {
      router.push(
        paymentListHref(updated, 1),
        { scroll: false },
      );
    });
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    applyFilters({
      search: search.trim(),
    });
  }

  const hasFilters =
    Boolean(filters.search) ||
    filters.status !== "ALL" ||
    filters.sort !== "newest";

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="border-b border-slate-100 p-5 sm:p-6"
    >
      <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(180px,1fr)_minmax(180px,1fr)]">
        {/* Search by tracking code */}
        <div className="space-y-2">
          <label
            htmlFor="payment-search"
            className="block text-xs font-semibold text-slate-500"
          >
            Search
          </label>

          <div className="flex gap-2">
            <input
              id="payment-search"
              name="search"
              type="search"
              value={search}
              maxLength={100}
              placeholder="Search by tracking code..."
              autoComplete="off"
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              className={inputClass}
            />

            <button
              type="submit"
              disabled={isPending}
              aria-label="Search payments"
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#00877B] text-white hover:bg-[#006F66] disabled:opacity-60"
            >
              <Search
                aria-hidden="true"
                className="size-4"
              />
            </button>
          </div>
        </div>

        {/* Payment status */}
        <div className="space-y-2">
          <label
            htmlFor="payment-status"
            className="block text-xs font-semibold text-slate-500"
          >
            Filter
          </label>

          <select
            id="payment-status"
            name="status"
            value={filters.status}
            disabled={isPending}
            onChange={(event) => {
              applyFilters({
                status: event.target
                  .value as PaymentStatusFilter,
              });
            }}
            className={inputClass}
          >
            <option value="ALL">
              All payment statuses
            </option>

            <option value="PAID">
              Paid
            </option>

            <option value="AWAITING_PAYMENT">
              Awaiting payment
            </option>

            <option value="CHECKOUT_PENDING">
              Checkout pending
            </option>

            <option value="FAILED">
              Failed
            </option>

            <option value="REFUND_PENDING">
              Refund pending
            </option>

            <option value="REFUNDED">
              Refunded
            </option>
          </select>
        </div>

        {/* Sorting */}
        <div className="space-y-2">
          <label
            htmlFor="payment-sort"
            className="block text-xs font-semibold text-slate-500"
          >
            Sort
          </label>

          <select
            id="payment-sort"
            name="sort"
            value={filters.sort}
            disabled={isPending}
            onChange={(event) => {
              applyFilters({
                sort: event.target.value as PaymentSort,
              });
            }}
            className={inputClass}
          >
            <option value="newest">
              Newest first
            </option>

            <option value="oldest">
              Oldest first
            </option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex min-h-6 flex-wrap items-center justify-between gap-3">
        {isPending ? (
          <p
            role="status"
            className="text-xs text-[#00877B]"
          >
            Updating payment records...
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Search and filter your payment history.
          </p>
        )}

        {hasFilters && (
          <Link
            href="/customer/payments"
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
    </form>
  );
}
