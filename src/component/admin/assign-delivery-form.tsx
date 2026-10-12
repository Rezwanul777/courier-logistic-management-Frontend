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

interface Props {
  shipmentId: number;
  couriers: AdminCourier[];
}

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

export function AssignDeliveryForm({
  shipmentId,
  couriers,
}: Props) {
  const router = useRouter();

  const [courierId, setCourierId] =
    useState("");

  const [pending, setPending] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const selectedCourier = couriers.find(
    (courier) =>
      courier.id === Number(courierId) &&
      courier.isActive,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      pending ||
      success ||
      !selectedCourier
    ) {
      return;
    }

    if (
      !window.confirm(
        `Assign delivery of shipment #${shipmentId} to ${selectedCourier.name || selectedCourier.email}?`,
      )
    ) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/backend/admin/shipments/${shipmentId}/assign-delivery`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            courierId: selectedCourier.id,
          }),
        },
      );

      const payload: unknown =
        await response.json();

      const parsed =
        responseSchema.safeParse(payload);

      if (!parsed.success) {
        throw new Error(
          "Unexpected delivery assignment response.",
        );
      }

      if (
        !response.ok ||
        !parsed.data.success
      ) {
        throw new Error(
          parsed.data.message ??
            "Unable to assign delivery courier.",
        );
      }

      setSuccess(true);
      setCourierId("");

      // Refresh shipment status, courier tasks,
      // and the shipment tracking timeline.
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to assign delivery courier.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center gap-2">
          <Truck
            aria-hidden="true"
            className="size-5 text-[#00877B]"
          />

          <h3 className="text-sm font-semibold text-[#102D46]">
            Assign delivery courier
          </h3>
        </div>

        <p className="mt-2 text-xs leading-6 text-slate-600">
          The shipment has arrived at its
          destination hub and is ready for
          delivery assignment.
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="delivery-courier"
          className="block text-sm font-semibold text-[#102D46]"
        >
          Select delivery courier
        </label>

        <select
          id="delivery-courier"
          name="courierId"
          required
          value={courierId}
          disabled={
            pending ||
            success ||
            couriers.length === 0
          }
          onChange={(event) => {
            setCourierId(event.target.value);
            setError(null);
          }}
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            Choose an active courier
          </option>

          {couriers.map((courier) => (
            <option
              key={courier.id}
              value={courier.id}
              disabled={!courier.isActive}
            >
              {courier.name || courier.email}
              {" — "}
              {courier.email}
            </option>
          ))}
        </select>

        <p className="text-xs text-slate-500">
          {couriers.length} active courier
          accounts available for selection.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {success && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          <CheckCircle2 className="size-4" />
          Delivery courier assigned successfully.
        </div>
      )}

      <button
        type="submit"
        disabled={
          pending ||
          success ||
          !selectedCourier
        }
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />
            Assigning courier...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="size-4" />
            Courier assigned
          </>
        ) : (
          <>
            <Truck className="size-4" />
            Assign delivery task
          </>
        )}
      </button>
    </form>
  );
}
