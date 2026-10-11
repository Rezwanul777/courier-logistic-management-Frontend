/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  LoaderCircle,
  RefreshCcw,
  XCircle,
} from "lucide-react";

import { apiRequest } from "@/lib/apiClient";
import { getErrorMessage } from "@/lib/api-errors";
import { createCheckoutSession } from "@/lib/shipment-checkout";

// ---------------------------------------------
// API validation
// ---------------------------------------------

const paymentSchema = z.object({
  id: z.number().int().positive(),

  status: z.enum([
    "UNPAID",
    "CHECKOUT_PENDING",
    "PAID",
    "REFUND_PENDING",
    "REFUNDED",
    "FAILED",
  ]),

  amountMinor: z.number().int().nonnegative(),
  currency: z.string().min(3),
  paidAt: z.string().nullable().optional(),
});

type Payment = z.infer<typeof paymentSchema>;

async function getPaymentStatus(
  shipmentId: number,
): Promise<Payment | null> {
  const response = await apiRequest(
    `/payments/shipment/${shipmentId}`,
    paymentSchema.nullable(),
    { method: "GET" },
  );

  return response.data;
}

// ---------------------------------------------
// Currency formatter
// ---------------------------------------------

function formatAmount(
  amountMinor: number,
  currency: string,
) {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });

    const digits =
      formatter.resolvedOptions()
        .maximumFractionDigits ?? 2;

    return formatter.format(
      amountMinor / 10 ** digits,
    );
  } catch {
    return `${currency} ${amountMinor} minor units`;
  }
}

// ---------------------------------------------
// Main component
// ---------------------------------------------

interface PaymentReturnProps {
  shipmentId: number;
  mode: "success" | "cancel";
}

export function PaymentReturn({
  shipmentId,
  mode,
}: PaymentReturnProps) {
  const paymentQuery = useQuery({
    queryKey: [
      "customer",
      "payment-status",
      shipmentId,
    ],

    queryFn: () => getPaymentStatus(shipmentId),

    staleTime: 0,
    retry: false,
    refetchOnWindowFocus: true,

    // Stripe's webhook can arrive after the
    // customer is redirected back.
    refetchInterval: (query) => {
      if (query.state.status === "error") {
        return false;
      }

      const status = query.state.data?.status;

      if (
        status === "PAID" ||
        status === "REFUNDED" ||
        status === "REFUND_PENDING" ||
        status === "FAILED"
      ) {
        return false;
      }

      return 6000;
    },

    refetchIntervalInBackground: false,
  });

  const checkoutMutation = useMutation({
    mutationFn: () =>
      createCheckoutSession(shipmentId),

    retry: false,
  });

  async function retryCheckout() {
    try {
      const url =
        await checkoutMutation.mutateAsync();

      window.location.assign(url);
    } catch {
      // The error is displayed below.
    }
  }

  const payment = paymentQuery.data ?? null;

  const isPaid = payment?.status === "PAID";

  const isRefunded =
    payment?.status === "REFUNDED";

  const isRefundPending =
    payment?.status === "REFUND_PENDING";

  const isFailed =
    payment?.status === "FAILED";

  const canRetry =
    payment !== null &&
    !isPaid &&
    !isRefunded &&
    !isRefundPending &&
    (mode === "cancel" || isFailed);

  // Never infer successful payment
  // from mode === "success".
  const title = isPaid
    ? "Payment successful!"
    : isRefunded
      ? "Payment refunded"
      : isRefundPending
        ? "Refund processing"
        : isFailed
          ? "Payment not completed"
          : mode === "cancel"
            ? "Checkout not completed"
            : "Verifying your payment";

  const description = isPaid
    ? "Your payment has been verified. Your shipment is ready for pickup."
    : isRefunded
      ? "Your shipment payment has been refunded."
      : isRefundPending
        ? "Your refund is currently being processed."
        : isFailed
          ? "This payment attempt was unsuccessful. You may retry checkout."
          : mode === "cancel"
            ? "You returned from Stripe without confirmed payment. Your draft shipment is still saved."
            : "We are waiting for the Stripe webhook to confirm your payment.";

  const StatusIcon = isPaid
    ? CheckCircle2
    : isFailed || mode === "cancel"
      ? XCircle
      : Clock3;

  const iconColor = isPaid
    ? "bg-emerald-50 text-emerald-700"
    : isFailed || mode === "cancel"
      ? "bg-amber-50 text-amber-700"
      : "bg-[#E8F5F2] text-[#00877B]";

  return (
    <main className="flex min-h-svh items-center justify-center bg-[#F4F6F9] px-5 py-12">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">
        {paymentQuery.isPending ? (
          <div role="status">
            <LoaderCircle
              aria-hidden="true"
              className="mx-auto size-12 animate-spin text-[#00877B]"
            />

            <h1 className="mt-6 text-2xl font-bold text-[#102D46]">
              Checking payment status
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Please wait while we retrieve your
              latest payment information.
            </p>
          </div>
        ) : paymentQuery.isError ? (
          <div>
            <XCircle
              aria-hidden="true"
              className="mx-auto size-12 text-red-600"
            />

            <h1 className="mt-6 text-2xl font-bold text-[#102D46]">
              Unable to verify payment
            </h1>

            <p
              role="alert"
              className="mt-3 text-sm leading-7 text-red-700"
            >
              {getErrorMessage(paymentQuery.error)}
            </p>

            <button
              type="button"
              onClick={() => {
                void paymentQuery.refetch();
              }}
              disabled={paymentQuery.isFetching}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] disabled:opacity-50"
            >
              <RefreshCcw className="size-4" />
              Check again
            </button>
          </div>
        ) : payment === null ? (
          <div>
            <Clock3
              aria-hidden="true"
              className="mx-auto size-12 text-amber-600"
            />

            <h1 className="mt-6 text-2xl font-bold text-[#102D46]">
              Payment record unavailable
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              No payment record is available for
              this shipment yet. You can check
              your shipment details.
            </p>

            <button
              type="button"
              onClick={() => {
                void paymentQuery.refetch();
              }}
              className="mt-5 text-sm font-semibold text-[#00877B]"
            >
              Refresh payment status
            </button>
          </div>
        ) : (
          <div>
            <div
              className={`mx-auto flex size-16 items-center justify-center rounded-full ${iconColor}`}
            >
              <StatusIcon
                aria-hidden="true"
                className="size-8"
              />
            </div>

            <h1 className="mt-6 text-2xl font-bold tracking-tight text-[#102D46]">
              {title}
            </h1>

            <p
              role="status"
              className="mt-4 text-sm leading-7 text-slate-600"
            >
              {description}
            </p>

            <div className="mt-7 space-y-4 rounded-lg bg-[#F4F6F9] p-5 text-left">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Shipment ID
                </p>

                <p className="mt-1 text-sm font-semibold text-[#102D46]">
                  #{shipmentId}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Payment amount
                </p>

                <p className="mt-1 text-xl font-bold text-[#102D46]">
                  {formatAmount(
                    payment.amountMinor,
                    payment.currency,
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Payment status
                </p>

                <p className="mt-1 text-sm font-semibold text-[#102D46]">
                  {payment.status.replaceAll("_", " ")}
                </p>
              </div>
            </div>

            {!isPaid &&
              !isRefunded &&
              !isRefundPending && (
                <button
                  type="button"
                  onClick={() => {
                    void paymentQuery.refetch();
                  }}
                  disabled={paymentQuery.isFetching}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] disabled:opacity-50"
                >
                  <RefreshCcw
                    aria-hidden="true"
                    className={
                      paymentQuery.isFetching
                        ? "size-4 animate-spin"
                        : "size-4"
                    }
                  />

                  Refresh payment status
                </button>
              )}

            {canRetry && (
              <button
                type="button"
                onClick={() => {
                  void retryCheckout();
                }}
                disabled={checkoutMutation.isPending}
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkoutMutation.isPending ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <CreditCard className="size-4" />
                )}

                {checkoutMutation.isPending
                  ? "Preparing Checkout..."
                  : "Retry Stripe Checkout"}
              </button>
            )}

            {checkoutMutation.isError && (
              <p
                role="alert"
                className="mt-4 text-sm text-red-700"
              >
                {getErrorMessage(
                  checkoutMutation.error,
                )}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
          <Link
            href={`/customer/shipments/${shipmentId}`}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#102D46] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#183B56]"
          >
            View shipment

            <ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </Link>

          <Link
            href="/customer/shipments"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-semibold text-[#102D46] hover:bg-slate-50"
          >
            Back to My Shipments
          </Link>
        </div>
      </section>
    </main>
  );
}
