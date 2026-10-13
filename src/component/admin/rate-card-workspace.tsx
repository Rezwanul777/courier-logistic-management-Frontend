/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react";

import { z } from "zod";

import type {
  RateCard,
  RateCardList,
  RateCardZone,
} from "@/lib/server/admin-rate-cards";

import {
  rateCardHref,
  type RateCardFilters,
} from "@/lib/rate-card-filters";

interface Props {
  data: RateCardList;
  zones: RateCardZone[];
  filters: RateCardFilters;
}

interface NewRateForm {
  originZoneId: string;
  destinationZoneId: string;
  weightFrom: string;
  weightTo: string;
  amount: string;
  currency: string;
  isActive: boolean;
}

const initialForm: NewRateForm = {
  originZoneId: "",
  destinationZoneId: "",
  weightFrom: "0",
  weightTo: "",
  amount: "",
  currency: "BDT",
  isActive: true,
};

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ---------------------------------------------
// Currency helpers
// ---------------------------------------------

function minorDigits(currency: string): number {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

function formatMoney(
  amountMinor: number,
  currency: string,
): string {
  const divisor = 10 ** minorDigits(currency);

  try {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency,
    }).format(amountMinor / divisor);
  } catch {
    return `${currency} ${amountMinor}`;
  }
}

function moneyInput(
  minor: number,
  currency: string,
): string {
  const digits = minorDigits(currency);

  return (minor / 10 ** digits).toFixed(digits);
}

function toMinorUnits(
  value: string,
  currency: string,
): number | null {
  const digits = minorDigits(currency);

  const pattern =
    digits === 0
      ? /^\d+$/
      : new RegExp(`^\\d+(?:\\.\\d{1,${digits}})?$`);

  const normalized = value.trim();

  if (!pattern.test(normalized)) {
    return null;
  }

  const minor = Math.round(
    Number(normalized) * 10 ** digits,
  );

  return Number.isSafeInteger(minor) && minor > 0
    ? minor
    : null;
}

function getError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

// ---------------------------------------------
// Main component
// ---------------------------------------------

export function RateCardWorkspace({
  data,
  zones,
  filters,
}: Props) {
  const router = useRouter();

  const [form, setForm] =
    useState<NewRateForm>(initialForm);

  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [editAmount, setEditAmount] = useState("");

  const [pendingId, setPendingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  const busy = creating || pendingId !== null;

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-teal-100 disabled:opacity-50";

  function changeForm(
    field: keyof NewRateForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError(null);
  }

  // -------------------------------------------
  // Authenticated browser mutation
  // -------------------------------------------

  async function mutate(
    method: "POST" | "PATCH" | "DELETE",
    path: string,
    body?: Record<string, string | number | boolean>,
  ) {
    const response = await fetch(
      `/api/backend/admin/${path}`,
      {
        method,
        credentials: "same-origin",
        cache: "no-store",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },

        ...(body
          ? { body: JSON.stringify(body) }
          : {}),
      },
    );

    const payload: unknown = await response.json();

    const parsed = responseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error(
        "Unexpected response from the Rate Card API.",
      );
    }

    if (!response.ok || !parsed.data.success) {
      throw new Error(
        parsed.data.message ??
          "Rate card operation failed.",
      );
    }

    return parsed.data.message ??
      "Rate card updated successfully.";
  }

  // -------------------------------------------
  // Create rate
  // -------------------------------------------

  async function createRate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (busy) {
      return;
    }

    setError(null);
    setNotice(null);

    const originZoneId = Number(form.originZoneId);
    const destinationZoneId =
      Number(form.destinationZoneId);

    const weightFrom = Number(form.weightFrom);
    const weightTo = Number(form.weightTo);

    const amountMinor = toMinorUnits(
      form.amount,
      form.currency,
    );

    if (
      !zones.some((z) => z.id === originZoneId) ||
      !zones.some((z) => z.id === destinationZoneId)
    ) {
      setError("Please select valid origin and destination zones.");
      return;
    }

    if (
      !form.weightFrom.trim() ||
      !form.weightTo.trim() ||
      !Number.isFinite(weightFrom) ||
      !Number.isFinite(weightTo) ||
      weightFrom < 0 ||
      weightTo <= weightFrom
    ) {
      setError("Enter a valid, increasing weight range.");
      return;
    }

    if (amountMinor === null) {
      setError("Enter a valid positive shipping charge.");
      return;
    }

    setCreating(true);

    try {
      const message = await mutate(
        "POST",
        "rates",
        {
          originZoneId,
          destinationZoneId,
          weightFrom,
          weightTo,
          baseAmountMinor: amountMinor,
          currency: form.currency,
          isActive: form.isActive,
        },
      );

      setNotice(message);
      setForm(initialForm);
      router.refresh();
    } catch (cause: unknown) {
      setError(getError(cause));
    } finally {
      setCreating(false);
    }
  }

  // -------------------------------------------
  // Edit price
  // -------------------------------------------

  function beginEdit(rate: RateCard) {
    setEditingId(rate.id);
    setEditAmount(
      moneyInput(rate.baseAmountMinor, rate.currency),
    );

    setError(null);
    setNotice(null);
  }

  async function savePrice(rate: RateCard) {
    if (busy) {
      return;
    }

    const minor = toMinorUnits(
      editAmount,
      rate.currency,
    );

    if (minor === null) {
      setError("Enter a valid positive shipping charge.");
      return;
    }

    setPendingId(rate.id);
    setError(null);
    setNotice(null);

    try {
      const message = await mutate(
        "PATCH",
        `rates/${rate.id}`,
        {
          baseAmountMinor: minor,
        },
      );

      setNotice(message);
      setEditingId(null);
      router.refresh();
    } catch (cause: unknown) {
      setError(getError(cause));
    } finally {
      setPendingId(null);
    }
  }

  // -------------------------------------------
  // Activate / deactivate
  // -------------------------------------------

  async function changeStatus(rate: RateCard) {
    if (busy) {
      return;
    }

    const nextStatus = !rate.isActive;

    if (
      !window.confirm(
        `${nextStatus ? "Activate" : "Deactivate"} rate card #${rate.id}? This changes availability for new shipment quotes.`,
      )
    ) {
      return;
    }

    setPendingId(rate.id);
    setError(null);
    setNotice(null);

    try {
      const message = await mutate(
        "PATCH",
        `rates/${rate.id}`,
        { isActive: nextStatus },
      );

      setNotice(message);
      router.refresh();
    } catch (cause: unknown) {
      setError(getError(cause));
    } finally {
      setPendingId(null);
    }
  }

  // -------------------------------------------
  // Archive
  // -------------------------------------------

  async function archiveRate(rate: RateCard) {
    if (busy) {
      return;
    }

    if (
      !window.confirm(
        `Archive rate card #${rate.id}? It will no longer be available for new shipment quotes. This does not change previously booked shipment charges.`,
      )
    ) {
      return;
    }

    setPendingId(rate.id);
    setError(null);
    setNotice(null);

    try {
      const message = await mutate(
        "DELETE",
        `rates/${rate.id}`,
      );

      setNotice(message);
      router.refresh();
    } catch (cause: unknown) {
      setError(getError(cause));
    } finally {
      setPendingId(null);
    }
  }

  const { pagination } = data;

  const first =
    data.items.length > 0
      ? (pagination.page - 1) * pagination.limit + 1
      : 0;

  const last =
    data.items.length > 0
      ? first + data.items.length - 1
      : 0;

  return (
    <div className="space-y-6">
      {/* Create form */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <Plus
            aria-hidden="true"
            className="size-5 text-[#00877B]"
          />

          <h2 className="text-lg font-bold text-[#102D46]">
            Create rate card
          </h2>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Configure pricing for an origin zone,
          destination zone, and weight range.
        </p>

        <form
          onSubmit={createRate}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="space-y-2">
            <label
              htmlFor="rate-origin"
              className="text-sm font-semibold text-[#102D46]"
            >
              Origin zone
            </label>

            <select
              id="rate-origin"
              required
              value={form.originZoneId}
              disabled={busy}
              onChange={(event) =>
                changeForm(
                  "originZoneId",
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="">Select origin zone</option>
              {zones.map((zone) => (
                <option
                  key={zone.id}
                  value={zone.id}
                >
                  {zone.name} ({zone.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="rate-destination"
              className="text-sm font-semibold text-[#102D46]"
            >
              Destination zone
            </label>

            <select
              id="rate-destination"
              required
              value={form.destinationZoneId}
              disabled={busy}
              onChange={(event) =>
                changeForm(
                  "destinationZoneId",
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="">Select destination zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} ({zone.code})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="rate-currency"
              className="text-sm font-semibold text-[#102D46]"
            >
              Currency
            </label>

            <select
              id="rate-currency"
              value={form.currency}
              disabled={busy}
              onChange={(event) =>
                changeForm(
                  "currency",
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="BDT">BDT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="rate-weight-from"
              className="text-sm font-semibold text-[#102D46]"
            >
              Minimum weight (kg)
            </label>

            <input
              id="rate-weight-from"
              type="number"
              min={0}
              step="any"
              required
              value={form.weightFrom}
              disabled={busy}
              onChange={(event) =>
                changeForm(
                  "weightFrom",
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="rate-weight-to"
              className="text-sm font-semibold text-[#102D46]"
            >
              Maximum weight (kg)
            </label>

            <input
              id="rate-weight-to"
              type="number"
              min={0}
              step="any"
              required
              value={form.weightTo}
              disabled={busy}
              onChange={(event) =>
                changeForm(
                  "weightTo",
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="rate-price"
              className="text-sm font-semibold text-[#102D46]"
            >
              Shipping charge ({form.currency})
            </label>

            <input
              id="rate-price"
              type="text"
              inputMode="decimal"
              required
              value={form.amount}
              disabled={busy}
              onChange={(event) =>
                changeForm("amount", event.target.value)
              }
              placeholder="150.00"
              className={inputClass}
            />
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-medium text-[#102D46] sm:col-span-2 lg:col-span-3">
            <input
              type="checkbox"
              checked={form.isActive}
              disabled={busy}
              onChange={(event) =>
                changeForm(
                  "isActive",
                  event.target.checked,
                )
              }
              className="size-4 accent-[#00877B]"
            />
            Activate for new shipment quotes
          </label>

          <div className="sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={busy || zones.length === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white hover:bg-[#006F66] disabled:opacity-50"
            >
              {creating ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              {creating
                ? "Creating rate..."
                : "Create rate card"}
            </button>
          </div>
        </form>

        {zones.length === 0 && (
          <p className="mt-4 text-sm text-amber-700">
            Create a zone in Hubs & zones before
            configuring a rate card.
          </p>
        )}
      </section>

      {/* Directory */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-2">
            <Wallet
              aria-hidden="true"
              className="size-5 text-[#00877B]"
            />
            <h2 className="text-lg font-bold text-[#102D46]">
              Rate card directory
            </h2>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Search, update and manage existing
            rate configurations.
          </p>

          {/* Server-side filters */}
          <form
            action="/admin/rates"
            method="get"
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            <select
              name="originZoneId"
              aria-label="Filter origin zone"
              defaultValue={filters.originZoneId ?? ""}
              className={inputClass}
            >
              <option value="">All origin zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <select
              name="destinationZoneId"
              aria-label="Filter destination zone"
              defaultValue={filters.destinationZoneId ?? ""}
              className={inputClass}
            >
              <option value="">All destination zones</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name}
                </option>
              ))}
            </select>

            <select
              name="status"
              aria-label="Filter rate status"
              defaultValue={filters.status}
              className={inputClass}
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-4 text-sm font-semibold text-white hover:bg-[#006F66]"
            >
              <Search className="size-4" />
              Apply filters
            </button>

            <div className="sm:col-span-2 lg:col-span-4">
              <Link
                href="/admin/rates"
                className="text-sm font-medium text-slate-500 hover:underline"
              >
                Clear filters
              </Link>
            </div>
          </form>

          {error && (
            <p
              role="alert"
              className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
            >
              {notice}
            </p>
          )}
        </div>

        {data.items.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-slate-500">
              No rate cards match these filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-4">
                    Route
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Weight
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Charge
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Version
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {data.items.map((rate) => (
                  <tr key={rate.id} className="align-top">
                    <td className="px-5 py-5">
                      <p className="font-semibold text-[#102D46]">
                        {rate.originZone.name}
                      </p>
                      <p className="my-1 text-xs text-slate-400">
                        to
                      </p>
                      <p className="font-semibold text-[#102D46]">
                        {rate.destinationZone.name}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Rate #{rate.id}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-5 text-slate-600">
                      {rate.weightFrom}–{rate.weightTo} kg
                    </td>

                    <td className="px-5 py-5">
                      {editingId === rate.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            inputMode="decimal"
                            aria-label={`Edit price of rate ${rate.id}`}
                            value={editAmount}
                            disabled={busy}
                            onChange={(event) =>
                              setEditAmount(
                                event.target.value,
                              )
                            }
                            className="h-10 w-32 rounded-lg border border-slate-200 px-3 text-sm"
                          />

                          <div className="flex gap-3">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                void savePrice(rate)
                              }
                              className="text-xs font-semibold text-[#00877B] disabled:opacity-50"
                            >
                              Save
                            </button>

                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                setEditingId(null)
                              }
                              className="text-xs text-slate-500 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="font-semibold text-[#102D46]">
                          {formatMoney(
                            rate.baseAmountMinor,
                            rate.currency,
                          )}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-5 text-slate-600">
                      v{rate.version}
                    </td>

                    <td className="px-5 py-5">
                      <span
                        className={
                          rate.isActive
                            ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                            : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                        }
                      >
                        {rate.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-5">
                      <div className="flex flex-col items-start gap-3">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => beginEdit(rate)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00877B] disabled:opacity-50"
                        >
                          <Pencil className="size-3.5" />
                          Edit charge
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void changeStatus(rate)
                          }
                          className="text-xs font-semibold text-[#102D46] disabled:opacity-50"
                        >
                          {rate.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void archiveRate(rate)
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 disabled:opacity-50"
                        >
                          {pendingId === rate.id ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 p-5">
          <p className="text-sm text-slate-500">
            Showing {first}–{last} of{" "}
            {pagination.total}
          </p>

          <nav
            aria-label="Rate card pagination"
            className="flex items-center gap-3"
          >
            {pagination.page > 1 ? (
              <Link
                href={rateCardHref({
                  ...filters,
                  page: pagination.page - 1,
                })}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#102D46]"
              >
                <ArrowLeft className="size-4" />
                Previous
              </Link>
            ) : (
              <span className="text-sm text-slate-400">
                Previous
              </span>
            )}

            {pagination.page <
            pagination.totalPages ? (
              <Link
                href={rateCardHref({
                  ...filters,
                  page: pagination.page + 1,
                })}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#102D46]"
              >
                Next
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className="text-sm text-slate-400">
                Next
              </span>
            )}
          </nav>
        </div>
      </section>
    </div>
  );
}
