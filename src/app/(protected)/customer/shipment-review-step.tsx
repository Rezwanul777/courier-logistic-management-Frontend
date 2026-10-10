/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import { useQuery } from "@tanstack/react-query";

import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  RefreshCcw,
} from "lucide-react";

import {
  requestShipmentQuote,
  type ShippingQuote,
} from "@/lib/shipment-quote";

import { getErrorMessage } from "@/lib/api-errors";

import type {
  ParcelRouteValues,
  PickupRecipientValues,
} from "@/lib/shipment-draft.schema";

import type {
  ShipmentHub,
} from "@/lib/server/shipment-hubs";

// --------------------------------------
// Component props
// --------------------------------------

interface ShipmentReviewStepProps {
  pickup: PickupRecipientValues;
  parcel: ParcelRouteValues;
  hubs: ShipmentHub[];
  onBack: () => void;
}

// --------------------------------------
// Currency formatting
// --------------------------------------

function formatShippingAmount(
  amountMinor: number,
  currency: string,
): string {
  try {
    const formatter = new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
      },
    );

    const fractionDigits =
      formatter.resolvedOptions()
        .maximumFractionDigits ?? 2;

    return formatter.format(
      amountMinor / 10 ** fractionDigits,
    );
  } catch {
    return `${currency} ${amountMinor} minor units`;
  }
}

// --------------------------------------
// Reusable information row
// --------------------------------------

function ReviewItem({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm font-medium leading-7 text-[#102D46]">
        {value}
      </dd>

      {description && (
        <dd className="break-words text-xs leading-6 text-slate-500">
          {description}
        </dd>
      )}
    </div>
  );
}

// --------------------------------------
// Shipping quote loading skeleton
// --------------------------------------

function QuoteSkeleton() {
  return (
    <div
      role="status"
      aria-label="Calculating shipping quote"
      className="space-y-5"
    >
      <div className="h-4 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />

      <div className="h-10 w-44 animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none" />

      <div className="h-4 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />

      <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />

      <span className="sr-only">
        Calculating your shipping total.
      </span>
    </div>
  );
}

// --------------------------------------
// Shipping quote error state
// --------------------------------------

function QuoteError({
  message,
  onRetry,
  retrying,
}: {
  message: string;
  onRetry: () => void;
  retrying: boolean;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 p-5"
    >
      <h3 className="text-sm font-semibold text-red-800">
        Shipping quote unavailable
      </h3>

      <p className="mt-2 text-sm leading-7 text-red-700">
        {message}
      </p>

      <button
        type="button"
        disabled={retrying}
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-50"
      >
        <RefreshCcw
          aria-hidden="true"
          className={`size-4 ${
            retrying ? "animate-spin" : ""
          }`}
        />

        {retrying ? "Retrying..." : "Try again"}
      </button>
    </div>
  );
}

// --------------------------------------
// Verified shipping quote
// --------------------------------------

function QuoteDetails({
  quote,
  onRefresh,
  refreshing,
}: {
  quote: ShippingQuote;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const formattedAmount = formatShippingAmount(
    quote.amountMinor,
    quote.currency,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">
          Shipping total
        </p>

        <p className="mt-3 break-words text-4xl font-bold tracking-tight text-[#102D46]">
          {formattedAmount}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Currency: {quote.currency}
        </p>
      </div>

      <div className="rounded-lg border border-[#C6E6DF] bg-[#F0FAF7] p-4">
        <p className="text-sm font-semibold text-[#155E53]">
          Server-calculated quote
        </p>

        <p className="mt-2 text-xs leading-6 text-[#155E53]">
          This amount comes from the active
          shipping rate configured in CourierFlow.
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            Parcel weight
          </span>

          <span className="font-semibold text-[#102D46]">
            {quote.weight} kg
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            Rate card
          </span>

          <span className="font-semibold text-[#102D46]">
            #{quote.rateCardId}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-500">
            Rate version
          </span>

          <span className="font-semibold text-[#102D46]">
            {quote.rateCardVersion}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={refreshing}
        onClick={onRefresh}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] transition-colors hover:text-[#006F66] disabled:opacity-50"
      >
        <RefreshCcw
          aria-hidden="true"
          className={`size-4 ${
            refreshing ? "animate-spin" : ""
          }`}
        />

        {refreshing
          ? "Refreshing quote..."
          : "Refresh quote"}
      </button>

      <div className="border-t border-slate-100 pt-5">
        <button
          type="button"
          disabled
          title="Stripe Checkout will be integrated in the next step"
          className="inline-flex h-12 w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white opacity-60"
        >
          <CreditCard
            aria-hidden="true"
            className="size-4"
          />

          Continue to Stripe
        </button>

        <p className="mt-3 text-center text-xs leading-6 text-slate-500">
          Secure checkout will be enabled after
          shipment creation is connected.
        </p>
      </div>
    </div>
  );
}

// --------------------------------------
// Main review component
// --------------------------------------

export function ShipmentReviewStep({
  pickup,
  parcel,
  hubs,
  onBack,
}: ShipmentReviewStepProps) {
  const originHub = hubs.find(
    (hub) =>
      String(hub.id) === parcel.originHubId,
  );

  const destinationHub = hubs.find(
    (hub) =>
      String(hub.id) === parcel.destinationHubId,
  );

  const quoteQuery = useQuery({
    queryKey: [
      "shipments",
      "quote",
      parcel.originHubId,
      parcel.destinationHubId,
      parcel.weight,
    ],

    queryFn: () =>
      requestShipmentQuote(parcel),

    // Never treat a previously fetched price
    // as permanently current.
    staleTime: 0,
    gcTime: 0,

    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  function refreshQuote() {
    void quoteQuery.refetch();
  }

  const route = [
    originHub?.name ?? "Unknown origin",
    destinationHub?.name ?? "Unknown destination",
  ].join(" → ");

  const parcelDescription =
    parcel.description.trim() ||
    "Description not provided";

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {/* Left: shipment review */}
        <section
          aria-labelledby="shipment-review-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <MapPin
              aria-hidden="true"
              className="size-5 text-[#00877B]"
            />

            <h2
              id="shipment-review-heading"
              className="text-xl font-bold text-[#102D46]"
            >
              Review before you pay
            </h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Please check your shipment information
            before confirming your booking.
          </p>

          <dl className="mt-8 space-y-7">
            <ReviewItem
              label="Pickup"
              value={`${pickup.pickupAddress}, ${pickup.pickupCity}`}
              description={`${pickup.senderName} · ${pickup.senderPhone}`}
            />

            <div className="border-t border-slate-100" />

            <ReviewItem
              label="Recipient"
              value={`${pickup.deliveryAddress}, ${pickup.deliveryCity}`}
              description={`${pickup.recipientName} · ${pickup.recipientPhone}`}
            />

            <div className="border-t border-slate-100" />

            <ReviewItem
              label="Route"
              value={route}
            />

            <div className="border-t border-slate-100" />

            <ReviewItem
              label="Parcel"
              value={`${parcelDescription} · ${parcel.weight} kg`}
            />
          </dl>

          <div className="mt-9 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50"
            >
              <ArrowLeft
                aria-hidden="true"
                className="size-4"
              />

              Back
            </button>
          </div>
        </section>

        {/* Right: actual shipping quote */}
        <section
          aria-labelledby="shipping-quote-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <Package
              aria-hidden="true"
              className="size-5 text-[#00877B]"
            />

            <h2
              id="shipping-quote-heading"
              className="text-xl font-bold text-[#102D46]"
            >
              Shipping quote
            </h2>
          </div>


<div className="mt-8" aria-live="polite">
  {quoteQuery.isPending ? (
    <QuoteSkeleton />
  ) : quoteQuery.isError ? (
    <QuoteError
      message={getErrorMessage(quoteQuery.error)}
      onRetry={refreshQuote}
      retrying={quoteQuery.isFetching}
    />
  ) : (
    <QuoteDetails
      quote={quoteQuery.data}
      onRefresh={refreshQuote}
      refreshing={quoteQuery.isFetching}
    />
  )}
</div>

        </section>
      </div>

      <p className="text-xs leading-6 text-slate-500">
        Your shipment is not booked yet. The quote
        will be recalculated by the backend before
        creating the shipment. Payment will be
        confirmed only after Stripe webhook
        verification.
      </p>
    </div>
  );
}
