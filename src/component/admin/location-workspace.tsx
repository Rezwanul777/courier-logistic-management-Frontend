/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  type FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  MapPinned,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { z } from "zod";

import type {
  AdminHub,
  AdminZone,
  LocationPagination,
} from "@/lib/server/admin-location";

import {
  locationUrl,
  type LocationFilters,
} from "@/lib/location-url";

import type {
  LocationRow,
} from "@/lib/location-rows";


// ---------------------------------------------
// Shared types
// ---------------------------------------------

type Kind = "hubs" | "zones";



interface Props {
  kind: Kind;
  rows: LocationRow[];
  zones: AdminZone[];
  pagination: LocationPagination;
  filters: LocationFilters;
}

interface FormValues {
  code: string;
  name: string;
  address: string;
  zoneId: string;
}

const emptyForm: FormValues = {
  code: "",
  name: "",
  address: "",
  zoneId: "",
};

const mutationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

// ---------------------------------------------
// Normalize results for the shared table
// ---------------------------------------------

export function locationRows(
  items: AdminHub[] | AdminZone[],
): LocationRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    address: "address" in item ? item.address : null,
    zoneName: "zone" in item ? item.zone.name : null,
    zoneId: "zoneId" in item ? item.zoneId : null,
  }));
}

// ---------------------------------------------
// Component
// ---------------------------------------------

export function LocationWorkspace({
  kind,
  rows,
  zones,
  pagination,
  filters,
}: Props) {
  const router = useRouter();

  const isHub = kind === "hubs";

  const base =
    isHub ? "/admin/hubs" : "/admin/hubs/zones";

  const resource = isHub ? "hubs" : "zones";

  const singular = isHub ? "hub" : "zone";

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<FormValues>(emptyForm);

  const [pending, setPending] = useState(false);

  const [archivingId, setArchivingId] =
    useState<number | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [notice, setNotice] =
    useState<string | null>(null);

  function setField(
    key: keyof FormValues,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError(null);
  }

  function startEdit(row: LocationRow) {
    setEditingId(row.id);
    setError(null);
    setNotice(null);

    setForm({
      code: row.code,
      name: row.name,
      address: row.address ?? "",
      zoneId: row.zoneId?.toString() ?? "",
    });
  }

  // -------------------------------------------
  // Shared mutation helper
  // -------------------------------------------

  async function request(
    method: "POST" | "PATCH" | "DELETE",
    path: string,
    body?: Record<string, string | number>,
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

    const payload: unknown =
      await response.json();

    const parsed =
      mutationResponseSchema.safeParse(payload);

    if (!parsed.success) {
      throw new Error(
        `Unexpected ${singular} API response.`,
      );
    }

    if (!response.ok || !parsed.data.success) {
      throw new Error(
        parsed.data.message ??
          `Unable to update ${singular}.`,
      );
    }

    return parsed.data.message ??
      `${singular} saved successfully.`;
  }

  // -------------------------------------------
  // Create or edit
  // -------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (pending || archivingId !== null) {
      return;
    }

    setError(null);
    setNotice(null);

    const code = form.code.trim().toUpperCase();
    const name = form.name.trim();
    const address = form.address.trim();
    const zoneId = Number(form.zoneId);

    if (name.length < 3 || name.length > 100) {
      setError("Name must contain 3–100 characters.");
      return;
    }

    if (editingId === null) {
      if (
        !/^[A-Z0-9-]{2,20}$/.test(code)
      ) {
        setError(
          "Code must contain 2–20 letters, numbers, or hyphens.",
        );
        return;
      }
    }

    if (isHub) {
      if (address.length < 5 || address.length > 255) {
        setError(
          "Address must contain 5–255 characters.",
        );
        return;
      }

      if (
        editingId === null &&
        !zones.some((zone) => zone.id === zoneId)
      ) {
        setError("Please select an active zone.");
        return;
      }
    }

    const body = editingId === null
      ? {
          code,
          name,
          ...(isHub ? { address, zoneId } : {}),
        }
      : {
          name,
          ...(isHub ? { address } : {}),
        };

    setPending(true);

    try {
      const message = await request(
        editingId === null ? "POST" : "PATCH",
        editingId === null
          ? resource
          : `${resource}/${editingId}`,
        body,
      );

      setNotice(message);
      setEditingId(null);
      setForm(emptyForm);

      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Unable to save ${singular}.`,
      );
    } finally {
      setPending(false);
    }
  }

  // -------------------------------------------
  // Archive unused record
  // -------------------------------------------

  async function archiveRow(row: LocationRow) {
    if (pending || archivingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      `Archive ${row.name} (${row.code})?\n\nThis will hide it from active lists. The server will reject archival if the record is referenced by other records.`,
    );

    if (!confirmed) {
      return;
    }

    setArchivingId(row.id);
    setError(null);
    setNotice(null);

    try {
      const message = await request(
        "DELETE",
        `${resource}/${row.id}`,
      );

      setNotice(message);

      if (editingId === row.id) {
        cancelEdit();
      }

      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Unable to archive ${singular}.`,
      );
    } finally {
      setArchivingId(null);
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-teal-100 disabled:opacity-60";

  const busy = pending || archivingId !== null;

  const start =
    rows.length > 0
      ? (pagination.page - 1) *
          pagination.limit + 1
      : 0;

  const end =
    rows.length > 0
      ? start + rows.length - 1
      : 0;

  return (
    <div className="space-y-6">
      {/* Search */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <form
          action={base}
          method="get"
          role="search"
          className="flex flex-wrap items-end gap-3"
        >
          <div className="min-w-0 flex-1 space-y-2">
            <label
              htmlFor={`search-${kind}`}
              className="block text-xs font-semibold text-slate-500"
            >
              Search {kind}
            </label>

            <input
              key={`${kind}-${filters.search}`}
              id={`search-${kind}`}
              type="search"
              name="search"
              maxLength={100}
              defaultValue={filters.search}
              placeholder="Search name or code..."
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66]"
          >
            <Search className="size-4" />
            Search
          </button>

          <Link
            href={base}
            className="inline-flex h-11 items-center px-3 text-sm font-medium text-slate-500 hover:underline"
          >
            Clear
          </Link>
        </form>
      </section>

      {/* Create / edit form */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <MapPinned className="size-5 text-[#00877B]" />
          <h2 className="text-lg font-bold text-[#102D46]">
            {editingId !== null
              ? `Edit ${singular}`
              : `Create ${singular}`}
          </h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-4 sm:grid-cols-2"
        >
          <div className="space-y-2">
            <label
              htmlFor="location-code"
              className="text-sm font-medium text-[#102D46]"
            >
              Code
            </label>

            <input
              id="location-code"
              required
              maxLength={20}
              value={form.code}
              onChange={(e) =>
                setField("code", e.target.value)
              }
              disabled={busy || editingId !== null}
              placeholder="Unique code"
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="location-name"
              className="text-sm font-medium text-[#102D46]"
            >
              Name
            </label>

            <input
              id="location-name"
              required
              minLength={3}
              maxLength={100}
              value={form.name}
              onChange={(e) =>
                setField("name", e.target.value)
              }
              disabled={busy}
              placeholder="Enter name"
              className={inputClass}
            />
          </div>

          {isHub && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="hub-zone"
                  className="text-sm font-medium text-[#102D46]"
                >
                  Zone
                </label>

                <select
                  id="hub-zone"
                  required
                  value={form.zoneId}
                  onChange={(e) =>
                    setField("zoneId", e.target.value)
                  }
                  disabled={busy || editingId !== null}
                  className={inputClass}
                >
                  <option value="">
                    Select zone
                  </option>

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
                  htmlFor="hub-address"
                  className="text-sm font-medium text-[#102D46]"
                >
                  Address
                </label>

                <input
                  id="hub-address"
                  required
                  minLength={5}
                  maxLength={255}
                  value={form.address}
                  onChange={(e) =>
                    setField("address", e.target.value)
                  }
                  disabled={busy}
                  placeholder="Hub address"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:col-span-2"
            >
              {error}
            </p>
          )}

          {notice && (
            <p
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:col-span-2"
            >
              {notice}
            </p>
          )}

          <div className="flex flex-wrap gap-3 sm:col-span-2">
            <button
              type="submit"
              disabled={
                busy ||
                (isHub &&
                  editingId === null &&
                  zones.length === 0)
              }
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : editingId !== null ? (
                <Pencil className="size-4" />
              ) : (
                <Plus className="size-4" />
              )}

              {pending
                ? "Saving..."
                : editingId !== null
                  ? `Save ${singular}`
                  : `Create ${singular}`}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={cancelEdit}
                disabled={busy}
                className="h-11 rounded-lg border border-slate-200 px-5 text-sm font-medium text-slate-700 disabled:opacity-50"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        {isHub && zones.length === 0 && (
          <p className="mt-3 text-sm text-amber-700">
            Create an active zone before creating a hub.
          </p>
        )}

        <p className="mt-4 text-xs text-slate-500">
          Codes are permanent identifiers.
          Editing can update names
          {isHub ? " and addresses" : ""}.
        </p>
      </section>

      {/* Real database directory */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-bold text-[#102D46]">
            {isHub ? "Hub directory" : "Zone directory"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} matching records
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="px-6 py-14 text-center text-sm text-slate-500">
            No matching {kind} found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-4">
                    Code
                  </th>
                  <th scope="col" className="px-5 py-4">
                    Name
                  </th>
                  {isHub && (
                    <>
                      <th scope="col" className="px-5 py-4">
                        Zone
                      </th>
                      <th scope="col" className="px-5 py-4">
                        Address
                      </th>
                    </>
                  )}
                  <th scope="col" className="px-5 py-4">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-5 py-4 font-semibold text-[#00877B]">
                      {row.code}
                    </td>

                    <td className="px-5 py-4 text-[#102D46]">
                      {row.name}
                    </td>

                    {isHub && (
                      <>
                        <td className="px-5 py-4 text-slate-600">
                          {row.zoneName ?? "—"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {row.address ?? "—"}
                        </td>
                      </>
                    )}

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => startEdit(row)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#00877B] hover:underline disabled:opacity-50"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>

                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void archiveRow(row)
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                        >
                          {archivingId === row.id ? (
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
            Showing {start}–{end} of {pagination.total}
          </p>

          <nav
            aria-label={`${kind} pagination`}
            className="flex items-center gap-2"
          >
            {pagination.page > 1 ? (
              <Link
                href={locationUrl(kind, {
                  ...filters,
                  page: pagination.page - 1,
                })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <ArrowLeft className="size-4" />
                Previous
              </Link>
            ) : (
              <span className="text-sm text-slate-400">
                Previous
              </span>
            )}

            {pagination.page < pagination.totalPages ? (
              <Link
                href={locationUrl(kind, {
                  ...filters,
                  page: pagination.page + 1,
                })}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
