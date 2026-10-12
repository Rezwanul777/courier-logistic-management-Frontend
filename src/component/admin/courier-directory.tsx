/** biome-ignore-all lint/correctness/useExhaustiveDependencies: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Search,
  Truck,
} from "lucide-react";

import { z } from "zod";

import type {
  AdminCourier,
} from "@/lib/server/admin-courier";

// ---------------------------------------------
// Configuration
// ---------------------------------------------

const PAGE_SIZE = 8;

type StatusFilter = "all" | "active" | "inactive";

const mutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ---------------------------------------------
// Props
// ---------------------------------------------

interface Props {
  couriers: AdminCourier[];
}

// ---------------------------------------------
// Component
// ---------------------------------------------

export function CourierDirectory({
  couriers,
}: Props) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [status, setStatus] =
    useState<StatusFilter>("all");

  const [page, setPage] = useState(1);

  const [pendingCourierId, setPendingCourierId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  // -------------------------------------------
  // Filtering
  // -------------------------------------------

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return couriers.filter((courier) => {
      const matchesSearch =
        !query ||
        courier.name?.toLowerCase().includes(query) ||
        courier.email.toLowerCase().includes(query);

      const matchesStatus =
        status === "all" ||
        (status === "active" && courier.isActive) ||
        (status === "inactive" && !courier.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [couriers, search, status]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const totalPages = Math.ceil(
    filtered.length / PAGE_SIZE,
  );

  const currentPage = Math.min(
    page,
    Math.max(1, totalPages),
  );

  const start = (currentPage - 1) * PAGE_SIZE;

  const visibleCouriers = filtered.slice(
    start,
    start + PAGE_SIZE,
  );

  const first =
    filtered.length > 0 ? start + 1 : 0;

  const last =
    filtered.length > 0
      ? start + visibleCouriers.length
      : 0;

  // -------------------------------------------
  // Activate / deactivate
  // -------------------------------------------

  async function changeCourierStatus(
    courier: AdminCourier,
  ) {
    if (pendingCourierId !== null) {
      return;
    }

    const nextStatus = !courier.isActive;

    const action = nextStatus
      ? "activate"
      : "deactivate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${courier.name || courier.email}?`,
    );

    if (!confirmed) {
      return;
    }

    setError(null);
    setNotice(null);
    setPendingCourierId(courier.id);

    try {
      const response = await fetch(
        `/api/backend/admin/couriers/${courier.id}/status`,
        {
          method: "PATCH",
          credentials: "same-origin",
          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            isActive: nextStatus,
          }),
        },
      );

      const result =
        mutationResponseSchema.safeParse(
          await response.json(),
        );

      if (!result.success) {
        throw new Error(
          "Unexpected courier API response.",
        );
      }

      if (
        !response.ok ||
        !result.data.success
      ) {
        throw new Error(
          result.data.message ||
            "Unable to update courier account.",
        );
      }

      setNotice(
        nextStatus
          ? "Courier account activated successfully."
          : "Courier account deactivated successfully.",
      );

      // Refetch server data, including account status.
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to update courier.",
      );
    } finally {
      setPendingCourierId(null);
    }
  }

  // -------------------------------------------
  // Presentation
  // -------------------------------------------

  return (
    <section
      aria-labelledby="courier-directory-heading"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              id="courier-directory-heading"
              className="text-lg font-bold text-[#102D46]"
            >
              Courier directory
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Search and manage courier accounts.
            </p>
          </div>

          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {couriers.length} accounts
          </span>
        </div>

        {/* Filters */}
        <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="space-y-2">
            <label
              htmlFor="courier-search"
              className="block text-xs font-semibold text-slate-500"
            >
              Search
            </label>

            <div className="relative">
              <Search
                aria-hidden="true"
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              />

              <input
                id="courier-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search name or email..."
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-teal-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="courier-status-filter"
              className="block text-xs font-semibold text-slate-500"
            >
              Account status
            </label>

            <select
              id="courier-status-filter"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as StatusFilter,
                )
              }
              className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B]"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {notice}
          </p>
        )}
      </div>

      {/* Directory table */}
      {visibleCouriers.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <Truck
            aria-hidden="true"
            className="size-10 text-slate-400"
          />

          <h3 className="mt-4 text-base font-semibold text-[#102D46]">
            No couriers found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try another search or status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[670px] text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-4">
                  Courier
                </th>
                <th scope="col" className="px-6 py-4">
                  Email
                </th>
                <th scope="col" className="px-6 py-4">
                  Account status
                </th>
                <th scope="col" className="px-6 py-4">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {visibleCouriers.map((courier) => {
                const pending =
                  pendingCourierId === courier.id;

                return (
                  <tr
                    key={courier.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-5 font-semibold text-[#102D46]">
                      {courier.name ||
                        `Courier #${courier.id}`}
                    </td>

                    <td className="px-6 py-5 text-slate-600">
                      {courier.email}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={
                          courier.isActive
                            ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            : "inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {courier.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <button
                        type="button"
                        disabled={
                          pendingCourierId !== null
                        }
                        onClick={() =>
                          void changeCourierStatus(
                            courier,
                          )
                        }
                        className={
                          courier.isActive
                            ? "inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                            : "inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#00877B] hover:underline disabled:opacity-50"
                        }
                      >
                        {pending && (
                          <LoaderCircle
                            aria-hidden="true"
                            className="size-3.5 animate-spin"
                          />
                        )}

                        {pending
                          ? "Updating..."
                          : courier.isActive
                            ? "Deactivate"
                            : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
        <p className="text-sm text-slate-500">
          Showing {first}–{last} of {filtered.length}
        </p>

        <nav
          aria-label="Courier pagination"
          className="flex items-center gap-2"
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() =>
              setPage(currentPage - 1)
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-[#102D46] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ArrowLeft
              aria-hidden="true"
              className="size-4"
            />
            Previous
          </button>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() =>
              setPage(currentPage + 1)
            }
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm text-[#102D46] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </button>
        </nav>
      </div>
    </section>
  );
}
