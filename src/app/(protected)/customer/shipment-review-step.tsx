/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";

import {
  ArrowLeft,
  CreditCard,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCcw,
} from "lucide-react";

import { ApiError, getErrorMessage } from "@/lib/api-errors";

import {
  createCheckoutSession,
  createCustomerShipment,
  type CreatedShipment,
} from "@/lib/shipment-checkout";

import { requestShipmentQuote, type ShippingQuote } from "@/lib/shipment-quote";

import type {
  ParcelRouteValues,
  PickupRecipientValues,
} from "@/lib/shipment-draft.schema";

import type { ShipmentHub } from "@/lib/server/shipment-hubs";

interface ShipmentReviewStepProps {
  pickup: PickupRecipientValues;
  parcel: ParcelRouteValues;
  hubs: ShipmentHub[];
  onBack: () => void;
}

// -----------------------------------------
// Helpers
// -----------------------------------------

function formatShippingAmount(amountMinor: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });

    const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;

    return formatter.format(amountMinor / 10 ** digits);
  } catch {
    return `${currency} ${amountMinor} minor units`;
  }
}

function isUncertainBookingError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.code === "NETWORK" ||
      error.code === "INVALID_RESPONSE" ||
      error.status >= 500)
  );
}

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

function QuoteSkeleton() {
  return (
    <div
      role="status"
      aria-label="Calculating shipping quote"
      className="space-y-5"
    >
      <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
      <div className="h-10 w-44 animate-pulse rounded bg-slate-200" />
      <div className="h-20 animate-pulse rounded bg-slate-100" />
      <div className="h-11 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

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

      <p className="mt-2 text-sm leading-7 text-red-700">{message}</p>

      <button
        type="button"
        disabled={retrying}
        onClick={onRetry}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 disabled:opacity-50"
      >
        <RefreshCcw className="size-4" />
        {retrying ? "Retrying..." : "Try again"}
      </button>
    </div>
  );
}

// -----------------------------------------
// Quote and Stripe Checkout UI
// -----------------------------------------

interface QuoteDetailsProps {
  quote: ShippingQuote;
  onRefresh: () => void;
  refreshing: boolean;
  onCheckout: () => void;
  checkoutPending: boolean;
  checkoutError: unknown;
  createdShipment: CreatedShipment | null;
  bookingUncertain: boolean;
  quoteFailed: boolean;
}

function QuoteDetails({
  quote,
  onRefresh,
  refreshing,
  onCheckout,
  checkoutPending,
  checkoutError,
  createdShipment,
  bookingUncertain,
  quoteFailed,
}: QuoteDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-slate-500">Shipping total</p>

        <p className="mt-3 break-words text-4xl font-bold tracking-tight text-[#102D46]">
          {formatShippingAmount(quote.amountMinor, quote.currency)}
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
          This amount comes from the active shipping rate configured in
          CourierFlow. The backend verifies it again when creating your
          shipment.
        </p>
      </div>

      <div className="space-y-3 border-t border-slate-100 pt-5 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Parcel weight</span>
          <span className="font-semibold text-[#102D46]">
            {quote.weight} kg
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Rate card</span>
          <span className="font-semibold text-[#102D46]">
            #{quote.rateCardId}
          </span>
        </div>

        <div className="flex justify-between gap-4">
          <span className="text-slate-500">Rate version</span>
          <span className="font-semibold text-[#102D46]">
            {quote.rateCardVersion}
          </span>
        </div>
      </div>

      {!createdShipment && !bookingUncertain && (
        <button
          type="button"
          disabled={refreshing || checkoutPending}
          onClick={onRefresh}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] disabled:opacity-50"
        >
          <RefreshCcw
            className={refreshing ? "size-4 animate-spin" : "size-4"}
          />

          {refreshing ? "Refreshing quote..." : "Refresh quote"}
        </button>
      )}

      {createdShipment && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-amber-900">
            Draft shipment created
          </p>

          <p className="mt-2 break-all text-sm text-amber-800">
            {createdShipment.trackingCode}
          </p>

          <p className="mt-2 text-xs leading-6 text-amber-800">
            Your shipment is saved. Payment has not been confirmed yet.
          </p>

          <Link
            href={`/customer/shipments/${createdShipment.id}`}
            className="mt-3 inline-block text-sm font-semibold text-[#00877B] hover:underline"
          >
            View saved shipment
          </Link>
        </div>
      )}

      {bookingUncertain && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        >
          <p className="text-sm font-semibold text-amber-900">
            Booking status needs checking
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            The server response was interrupted. A draft may already have been
            saved. Check My Shipments before attempting another booking.
          </p>

          <Link
            href="/customer/shipments"
            className="mt-3 inline-block text-sm font-semibold text-[#00877B] hover:underline"
          >
            Check My Shipments
          </Link>
        </div>
      )}

      {quoteFailed && !createdShipment && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          Quote refresh failed. Refresh the quotation before continuing.
        </div>
      )}

      {Boolean(checkoutError) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <p className="text-sm font-semibold text-red-800">
            Unable to continue checkout
          </p>

          <p className="mt-2 text-sm leading-6 text-red-700">
            {getErrorMessage(checkoutError)}
          </p>

          {!createdShipment && !bookingUncertain && (
            <p className="mt-2 text-xs text-red-700">
              If your shipping rate changed, refresh the quote and try again.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCheckout}
          disabled={
            checkoutPending || refreshing || bookingUncertain || quoteFailed
          }
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checkoutPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <CreditCard aria-hidden="true" className="size-4" />
          )}

          {checkoutPending
            ? "Preparing secure checkout..."
            : createdShipment
              ? "Retry Stripe Checkout"
              : "Continue to Stripe"}
        </button>

        <p className="mt-3 text-center text-xs leading-6 text-slate-500">
          Payment is confirmed only after Stripe webhook verification.
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------
// Main Review and Pay component
// -----------------------------------------

export function ShipmentReviewStep({
  pickup,
  parcel,
  hubs,
  onBack,
}: ShipmentReviewStepProps) {
  const [createdShipment, setCreatedShipment] =
    useState<CreatedShipment | null>(null);

  const [bookingUncertain, setBookingUncertain] = useState(false);

  // Prevent two rapid clicks before React
  // finishes updating the mutation state.
  const submissionLock = useRef(false);

  const originHub = hubs.find((hub) => String(hub.id) === parcel.originHubId);

  const destinationHub = hubs.find(
    (hub) => String(hub.id) === parcel.destinationHubId,
  );

  const quoteQuery = useQuery({
    queryKey: [
      "shipments",
      "quote",
      parcel.originHubId,
      parcel.destinationHubId,
      parcel.weight,
    ],

    queryFn: () => requestShipmentQuote(parcel),

    enabled: !createdShipment,

    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      let shipment = createdShipment;

      if (!shipment) {
        const quote = quoteQuery.data;

        if (!quote || quoteQuery.isFetching || quoteQuery.isError) {
          throw new Error("A current shipping quote is required.");
        }

        try {
          shipment = await createCustomerShipment({
            pickup,
            parcel,
            quote,
          });

          // Save the real shipment ID immediately.
          // If Stripe fails, retry checkout for
          // this shipment instead of creating
          // another one.
          setCreatedShipment(shipment);
        } catch (error: unknown) {
          // A network failure does not prove the
          // POST was rolled back. Do not blindly
          // create a second shipment.
          if (isUncertainBookingError(error)) {
            setBookingUncertain(true);
          }

          throw error;
        }
      }

      return createCheckoutSession(shipment.id);
    },

    retry: false,
  });

  function refreshQuote() {
    if (!createdShipment && !bookingUncertain && !checkoutMutation.isPending) {
      void quoteQuery.refetch();
    }
  }

  async function handleCheckout() {
    if (
      submissionLock.current ||
      checkoutMutation.isPending ||
      bookingUncertain
    ) {
      return;
    }

    submissionLock.current = true;

    try {
      const checkoutUrl = await checkoutMutation.mutateAsync();

      // Real Stripe-hosted checkout.
      window.location.assign(checkoutUrl);
    } catch {
      // React Query stores the error.
      // QuoteDetails displays it.
    } finally {
      submissionLock.current = false;
    }
  }

  const route = [
    originHub?.name ?? "Unknown origin",
    destinationHub?.name ?? "Unknown destination",
  ].join(" → ");

  const parcelDescription =
    parcel.description.trim() || "Description not provided";

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        {/* Left panel: shipment details */}
        <section
          aria-labelledby="shipment-review-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <MapPin aria-hidden="true" className="size-5 text-[#00877B]" />

            <h2
              id="shipment-review-heading"
              className="text-xl font-bold text-[#102D46]"
            >
              Review before you pay
            </h2>
          </div>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Please check your shipment information before confirming your
            booking.
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

            <ReviewItem label="Route" value={route} />

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
              disabled={
                checkoutMutation.isPending ||
                Boolean(createdShipment) ||
                bookingUncertain
              }
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back
            </button>
          </div>
        </section>

        {/* Right panel: quote and checkout */}
        <section
          aria-labelledby="shipping-quote-heading"
          className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
        >
          <div className="flex items-center gap-3">
            <Package aria-hidden="true" className="size-5 text-[#00877B]" />

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
            ) : quoteQuery.isError && !quoteQuery.data ? (
              <QuoteError
                message={getErrorMessage(quoteQuery.error)}
                onRetry={refreshQuote}
                retrying={quoteQuery.isFetching}
              />
            ) : quoteQuery.data ? (
              <QuoteDetails
                quote={quoteQuery.data}
                onRefresh={refreshQuote}
                refreshing={quoteQuery.isFetching}
                onCheckout={() => {
                  void handleCheckout();
                }}
                checkoutPending={checkoutMutation.isPending}
                checkoutError={checkoutMutation.error}
                createdShipment={createdShipment}
                bookingUncertain={bookingUncertain}
                quoteFailed={quoteQuery.isError}
              />
            ) : (
              <p className="text-sm text-slate-500">
                Shipping quote unavailable.
              </p>
            )}
          </div>
        </section>
      </div>

      <p className="text-xs leading-6 text-slate-500">
        The backend verifies the shipping price again before booking. Creating a
        draft does not confirm payment. Only a verified Stripe webhook can mark
        the shipment paid.
      </p>
    </div>
  );
}
