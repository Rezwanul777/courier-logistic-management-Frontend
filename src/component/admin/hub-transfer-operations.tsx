/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";

import { z } from "zod";

import type {
  AdminShipmentDetail,
} from "@/lib/server/admin-shipment-detail";

type HubTransferShipment = Pick<
  AdminShipmentDetail,
  | "id"
  | "status"
  | "originHub"
  | "destinationHub"
  | "hubTransfers"
>;

type Operation =
  | "origin-receive"
  | "dispatch"
  | "destination-receive";

interface Props {
  shipment: HubTransferShipment;
}

const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

const operations: Record<
  Operation,
  {
    label: string;
    description: string;
    confirm: string;
  }
> = {
  "origin-receive": {
    label: "Receive at origin hub",
    description:
      "Confirm that the parcel arrived at the origin hub.",
    confirm:
      "Confirm receipt of the parcel at the origin hub?",
  },

  dispatch: {
    label: "Dispatch shipment",
    description:
      "Dispatch the parcel from the origin hub to its destination.",
    confirm:
      "Confirm dispatch of this shipment?",
  },

  "destination-receive": {
    label: "Receive at destination hub",
    description:
      "Confirm arrival and close the dispatched transfer.",
    confirm:
      "Confirm receipt at the destination hub?",
  },
};

function getOperation(
  status: string,
): Operation | null {
  switch (status) {
    case "PICKED_UP":
      return "origin-receive";

    case "AT_ORIGIN_HUB":
      return "dispatch";

    case "IN_TRANSIT":
      return "destination-receive";

    default:
      return null;
  }
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

export function HubTransferOperations({
  shipment,
}: Props) {
  const router = useRouter();

  const [pending, setPending] = useState(false);
  const [error, setError] =
    useState<string | null>(null);
  const [notice, setNotice] =
    useState<string | null>(null);
  const [submitted, setSubmitted] =
    useState(false);

  const operation = getOperation(shipment.status);

  const hasActiveTransfer =
    shipment.hubTransfers.some(
      (transfer) =>
        transfer.status === "DISPATCHED" &&
        transfer.fromHub.id ===
          shipment.originHub.id &&
        transfer.toHub.id ===
          shipment.destinationHub.id,
    );

  const sameHub =
    shipment.originHub.id ===
    shipment.destinationHub.id;

  const canSubmit =
    operation !== null &&
    !sameHub &&
    !pending &&
    !submitted &&
    (
      operation !== "destination-receive" ||
      hasActiveTransfer
    );

  async function handleOperation() {
    if (!operation || !canSubmit) {
      return;
    }

    const config = operations[operation];

    if (!window.confirm(config.confirm)) {
      return;
    }

    setPending(true);
    setError(null);
    setNotice(null);

    try {
      const body =
        operation === "dispatch"
          ? {
              fromHubId: shipment.originHub.id,
              toHubId: shipment.destinationHub.id,
            }
          : {};

      const response = await fetch(
        `/api/backend/admin/hub-transfers/${shipment.id}/${operation}`,
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify(body),
        },
      );

      const payload: unknown =
        await response.json();

      const parsed = apiResponseSchema.safeParse(
        payload,
      );

      if (!parsed.success) {
        throw new Error(
          "Unexpected response from the hub transfer API.",
        );
      }

      if (!response.ok || !parsed.data.success) {
        throw new Error(
          parsed.data.message ||
            "Unable to complete hub operation.",
        );
      }

      setSubmitted(true);

      setNotice(
        parsed.data.message ||
          "Hub operation completed successfully.",
      );

      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Something went wrong.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Shipment route */}
      <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
        <div className="flex items-center gap-2">
          <MapPin
            aria-hidden="true"
            className="size-5 text-[#00877B]"
          />

          <h3 className="text-sm font-semibold text-[#102D46]">
            Shipment hub route
          </h3>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-700">
          <span>{shipment.originHub.name}</span>
          <span className="text-slate-400">→</span>
          <span>{shipment.destinationHub.name}</span>
        </div>
      </div>

      {/* Current operation */}
      {operation && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-[#102D46]">
              Next operation
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {operations[operation].description}
            </p>
          </div>

          {sameHub && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Origin and destination are the same hub.
              This direct transfer workflow cannot
              dispatch between identical hubs.
            </p>
          )}

          {operation === "destination-receive" &&
            !hasActiveTransfer && (
              <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                No active transfer record was found.
                Destination receipt is unavailable.
              </p>
            )}

          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => void handleOperation()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Processing...
              </>
            ) : submitted ? (
              <>
                <CheckCircle2 className="size-4" />
                Operation recorded
              </>
            ) : (
              <>
                {operation === "dispatch" ? (
                  <Truck className="size-4" />
                ) : (
                  <PackageCheck className="size-4" />
                )}

                {operations[operation].label}
              </>
            )}
          </button>
        </div>
      )}

      {/* Completed transfer stage */}
      {!operation &&
        shipment.status ===
          "AT_DESTINATION_HUB" && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-700" />

              <p className="text-sm font-semibold text-emerald-800">
                Destination hub received
              </p>
            </div>

            <p className="mt-2 text-sm leading-6 text-emerald-700">
              This shipment completed the hub
              transfer workflow.
            </p>
          </div>
        )}

      {!operation &&
        shipment.status !==
          "AT_DESTINATION_HUB" && (
          <p className="text-sm text-slate-500">
            No hub transfer action is available
            for the current shipment status.
          </p>
        )}

      {/* Error */}
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Success */}
      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}

      {/* Transfer history */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 text-sm font-semibold text-[#102D46]">
          Hub transfer history
        </h3>

        {shipment.hubTransfers.length === 0 ? (
          <p className="text-sm text-slate-500">
            No transfers recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {shipment.hubTransfers.map(
              (transfer) => (
                <div
                  key={transfer.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-[#102D46]">
                      Transfer #{transfer.id}
                    </p>

                    <span
                      className={
                        transfer.status === "RECEIVED"
                          ? "rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                          : "rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      }
                    >
                      {transfer.status === "RECEIVED"
                        ? "Received"
                        : "Dispatched"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-slate-700">
                    {transfer.fromHub.name}
                    {" → "}
                    {transfer.toHub.name}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Dispatched:{" "}
                    {formatDate(transfer.createdAt)}
                  </p>

                  {transfer.receivedAt && (
                    <p className="mt-1 text-xs text-slate-500">
                      Received:{" "}
                      {formatDate(transfer.receivedAt)}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
