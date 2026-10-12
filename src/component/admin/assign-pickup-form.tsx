/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  LoaderCircle,
  Truck,
} from "lucide-react";

import { z } from "zod";

import type {
  AdminCourier,
} from "@/lib/server/admin-courier";

// ---------------------------------------------
// API response validation
// ---------------------------------------------

const assignPickupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
});

// ---------------------------------------------
// Props
// ---------------------------------------------

interface AssignPickupFormProps {
  shipmentId: number;
  couriers: AdminCourier[];
}

// ---------------------------------------------
// Component
// ---------------------------------------------

export function AssignPickupForm({
  shipmentId,
  couriers,
}: AssignPickupFormProps) {
  const router = useRouter();

  const [courierId, setCourierId] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState<
    string | null
  >(null);

  const [success, setSuccess] = useState<
    string | null
  >(null);

  const hasCouriers = couriers.length > 0;

  const validCourierId =
    Number.isSafeInteger(Number(courierId)) &&
    Number(courierId) > 0 &&
    couriers.some(
      (courier) =>
        courier.id === Number(courierId),
    );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (submitting || success) {
      return;
    }

    setError(null);

    if (!validCourierId) {
      setError(
        "Please select an active courier.",
      );

      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        "/api/backend/admin/tasks/assign-pickup",
        {
          method: "POST",

          credentials: "same-origin",
          cache: "no-store",

          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },

          body: JSON.stringify({
            shipmentId,
            courierId: Number(courierId),
          }),
        },
      );

      const payload: unknown =
        await response.json();

      const result =
        assignPickupResponseSchema.safeParse(
          payload,
        );

      if (!result.success) {
        throw new Error(
          "The server returned an unexpected response.",
        );
      }

      if (
        !response.ok ||
        !result.data.success
      ) {
        throw new Error(
          result.data.message ??
            "Unable to assign the pickup courier.",
        );
      }

      setSuccess(
        "Pickup courier assigned successfully.",
      );

      // Refresh the Server Component so that
      // shipment status, tracking timeline,
      // and courier tasks show current data.
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="rounded-lg border border-teal-100 bg-[#F0FAF7] p-4">
        <div className="flex items-center gap-2">
          <Truck
            aria-hidden="true"
            className="size-5 text-[#00877B]"
          />

          <p className="text-sm font-semibold text-[#102D46]">
            Assign pickup courier
          </p>
        </div>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          This shipment has verified payment
          and is ready for collection.
          Select an active courier to create
          a pickup task.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="pickup-courier"
          className="block text-sm font-semibold text-[#102D46]"
        >
          Select courier
        </label>

        <select
          id="pickup-courier"
          name="courierId"
          required
          value={courierId}
          disabled={
            submitting ||
            !hasCouriers ||
            Boolean(success)
          }
          onChange={(event) => {
            setCourierId(event.target.value);
            setError(null);
          }}
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            Choose an active courier
          </option>

          {couriers.map((courier) => (
            <option
              key={courier.id}
              value={courier.id}
            >
              {courier.name || courier.email}
              {" — "}
              {courier.email}
            </option>
          ))}
        </select>

        <p className="text-xs text-slate-500">
          {hasCouriers
            ? `${couriers.length} active courier account${couriers.length === 1 ? "" : "s"} available for selection.`
            : "No active courier accounts found. An administrator must create or activate a courier first."}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0"
          />

          <span>{success}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={
          !validCourierId ||
          submitting ||
          Boolean(success)
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />
            Assigning courier...
          </>
        ) : success ? (
          <>
            <CheckCircle2
              aria-hidden="true"
              className="size-4"
            />
            Courier assigned
          </>
        ) : (
          <>
            <Truck
              aria-hidden="true"
              className="size-4"
            />
            Assign pickup task
          </>
        )}
      </button>
    </form>
  );
}
