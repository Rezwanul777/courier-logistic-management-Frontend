
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import {
  CreditCard,
  LoaderCircle,
} from "lucide-react";

import { getErrorMessage } from "@/lib/api-errors";
import { createCheckoutSession } from "@/lib/shipment-checkout";

interface PaymentPayNowButtonProps {
  shipmentId: number;
}

export function PaymentPayNowButton({
  shipmentId,
}: PaymentPayNowButtonProps) {
  const requestLock = useRef(false);

  const [redirecting, setRedirecting] =
    useState(false);

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createCheckoutSession(shipmentId),

    // Payment mutations must not
    // automatically retry.
    retry: false,
  });

  const isBusy =
    checkoutMutation.isPending || redirecting;

  async function handlePayNow() {
    if (requestLock.current || isBusy) {
      return;
    }

    requestLock.current = true;

    try {
      // The backend checks shipment ownership,
      // shipment status, and payment status.
      //
      // Existing open Stripe sessions are reused.
      const checkoutUrl =
        await checkoutMutation.mutateAsync();

      setRedirecting(true);

      // Redirect to real Stripe-hosted Checkout.
      // The URL is validated in shipment-checkout.ts.
      window.location.assign(checkoutUrl);
    } catch {
      // React Query stores the error,
      // which is displayed below.
      requestLock.current = false;
      setRedirecting(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={() => {
          void handlePayNow();
        }}
        disabled={isBusy}
        aria-label={`Pay for shipment ${shipmentId}`}
        className="inline-flex min-h-9 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#00877B] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isBusy ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin"
          />
        ) : (
          <CreditCard
            aria-hidden="true"
            className="size-4"
          />
        )}

        {isBusy
          ? "Redirecting..."
          : "Pay now"}
      </button>

      {checkoutMutation.isError && (
        <div
          role="alert"
          className="max-w-60 space-y-2"
        >
          <p className="text-xs leading-5 text-red-700">
            {getErrorMessage(
              checkoutMutation.error,
            )}
          </p>

          <Link
            href={`/customer/shipments/${shipmentId}`}
            className="inline-block text-xs font-semibold text-[#00877B] hover:underline"
          >
            Check shipment status
          </Link>
        </div>
      )}
    </div>
  );
}
