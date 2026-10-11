import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  PackageOpen,
  type LucideIcon,
} from "lucide-react";

import { PaymentFilters } from "@/component/customer/payment-filters";

import {
  getCustomerPayments,
  type CustomerPayment,
} from "@/lib/server/customer-payment";

import {
  parsePaymentFilters,
  paymentListHref,
  type PaymentFilterValues,
  type PaymentSearchParams,
} from "@/lib/payment-filters";
import { PaymentPayNowButton } from "@/component/customer/payment-pay-now-button";

export const metadata: Metadata = {
  title: "Payments",
  description: "View your CourierFlow payment history.",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<PaymentSearchParams>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ------------------------------------------
// Formatting
// ------------------------------------------

function formatMoney(amountMinor: number, currency: string): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });

    const digits = formatter.resolvedOptions().maximumFractionDigits;

    return formatter.format(amountMinor / 10 ** (digits ?? 2));
  } catch {
    return `${currency} ${amountMinor} minor units`;
  }
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    AWAITING_PAYMENT: "Awaiting payment",
    CHECKOUT_PENDING: "Checkout pending",
    PAID: "Paid",
    FAILED: "Failed",
    REFUND_PENDING: "Refund pending",
    REFUNDED: "Refunded",
  };

  return labels[status] ?? status;
}

function getStatusStyles(status: string): string {
  switch (status) {
    case "PAID":
      return "bg-emerald-50 text-emerald-700";

    case "AWAITING_PAYMENT":
    case "CHECKOUT_PENDING":
      return "bg-amber-50 text-amber-700";

    case "FAILED":
      return "bg-red-50 text-red-700";

    case "REFUND_PENDING":
      return "bg-blue-50 text-blue-700";

    case "REFUNDED":
      return "bg-slate-100 text-slate-600";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

// ------------------------------------------
// Summary cards
// ------------------------------------------

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 break-words text-3xl font-bold tracking-tight text-[#102D46]">
            {value}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F2] text-[#00877B]">
          <Icon aria-hidden="true" className="size-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-6 text-slate-500">{description}</p>
    </article>
  );
}

// ------------------------------------------
// Payment status badge
// ------------------------------------------

function PaymentStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyles(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ------------------------------------------
// Empty state
// ------------------------------------------

function EmptyPayments({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
        <PackageOpen aria-hidden="true" className="size-7" />
      </div>

      <h2 className="mt-5 text-lg font-semibold text-[#102D46]">
        {hasFilters ? "No matching payments" : "No payment history yet"}
      </h2>

      <p className="mt-2 max-w-sm text-sm leading-7 text-slate-500">
        {hasFilters
          ? "No payment records match your selected search and filters."
          : "Your shipments and their payment statuses will appear here after you create a booking."}
      </p>

      <Link
        href={hasFilters ? "/customer/payments" : "/customer/shipments/new"}
        className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66]"
      >
        {hasFilters ? "Clear all filters" : "Create shipment"}
      </Link>
    </div>
  );
}

// ------------------------------------------
// Payment table
// ------------------------------------------

function PaymentTable({
  payments,
  hasFilters,
}: {
  payments: CustomerPayment[];
  hasFilters: boolean;
}) {
  if (payments.length === 0) {
    return <EmptyPayments hasFilters={hasFilters} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-[#F8FAFC]">
          <tr className="text-xs text-slate-500">
            <th scope="col" className="px-6 py-4 font-semibold">
              Shipment
            </th>

            <th scope="col" className="px-6 py-4 font-semibold">
              Payment status
            </th>

            <th scope="col" className="px-6 py-4 font-semibold">
              Currency
            </th>

            <th scope="col" className="px-6 py-4 font-semibold">
              Amount
            </th>

            <th scope="col" className="px-6 py-4 font-semibold">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {payments.map((payment) => (
            <tr
              key={payment.shipmentId}
              className="transition-colors hover:bg-slate-50/70"
            >
              <td className="px-6 py-5">
                <Link
                  href={`/customer/shipments/${payment.shipmentId}`}
                  className="font-semibold text-[#00877B] hover:underline"
                >
                  {payment.trackingCode}
                </Link>
              </td>

              <td className="px-6 py-5">
                <PaymentStatusBadge status={payment.paymentStatus} />
              </td>

              <td className="px-6 py-5 font-medium text-[#102D46]">
                {payment.currency}
              </td>

              <td className="whitespace-nowrap px-6 py-5 font-semibold text-[#102D46]">
                {formatMoney(payment.amountMinor, payment.currency)}
              </td>

              <td className="px-6 py-5">
                {payment.canPay ? (
                  <PaymentPayNowButton shipmentId={payment.shipmentId} />
                ) : (
                  <Link
                    href={`/customer/shipments/${payment.shipmentId}`}
                    className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#00877B] transition-colors hover:text-[#006F66] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
                  >
                    View shipment
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------
// Filter-preserving pagination
// ------------------------------------------

function PaymentPagination({
  pagination,
  count,
  filters,
}: {
  pagination: Pagination;
  count: number;
  filters: PaymentFilterValues;
}) {
  const { page, limit, total, totalPages } = pagination;

  const first = count === 0 ? 0 : (page - 1) * limit + 1;

  const last = count === 0 ? 0 : first + count - 1;

  const linkClass =
    "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-[#102D46] hover:bg-slate-50";

  const disabledClass =
    "inline-flex h-9 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 px-4 text-sm text-slate-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-5">
      <p className="text-sm text-slate-500">
        Showing {first}–{last} of {total}
      </p>

      <nav aria-label="Payments pagination" className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={paymentListHref(filters, page - 1)}
            prefetch={false}
            className={linkClass}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Previous
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            <ArrowLeft className="size-4" />
            Previous
          </span>
        )}

        {page < totalPages ? (
          <Link
            href={paymentListHref(filters, page + 1)}
            prefetch={false}
            className={linkClass}
          >
            Next
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <span aria-disabled="true" className={disabledClass}>
            Next
            <ArrowRight className="size-4" />
          </span>
        )}
      </nav>
    </div>
  );
}

// ------------------------------------------
// Main Payments page
// ------------------------------------------

export default async function CustomerPaymentsPage({
  searchParams,
}: PageProps) {
  const filters = parsePaymentFilters(await searchParams);

  const data = await getCustomerPayments(filters);

  const { summary, pagination, items } = data;

  // Avoid leaving customers on a non-existent
  // page after filters reduce the results.
  const lastPage = Math.max(pagination.totalPages, 1);

  if (filters.page > lastPage) {
    redirect(paymentListHref(filters, lastPage));
  }

  const hasFilters =
    Boolean(filters.search) ||
    filters.status !== "ALL" ||
    filters.sort !== "newest";

  return (
    <div className="space-y-7">
      {/* Heading */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#102D46]">
          Payments
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          A clear view of your shipments, from pickup to delivery.
        </p>
      </header>

      {/* Database-backed summary cards */}
      <section
        aria-label="Payment summary"
        className="grid gap-4 md:grid-cols-3"
      >
        <SummaryCard
          title="Paid shipments"
          value={summary.paidShipments.toLocaleString("en-US")}
          description="Verified payments"
          icon={CheckCircle2}
        />

        <SummaryCard
          title="Pending"
          value={summary.pendingShipments.toLocaleString("en-US")}
          description="Awaiting checkout or payment confirmation"
          icon={Clock3}
        />

        <SummaryCard
          title="Payment method"
          value={summary.paymentMethod}
          description="Secure online checkout"
          icon={CreditCard}
        />
      </section>

      {/* Payment history */}
      <section
        aria-label="Customer payment history"
        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
      >
        <PaymentFilters filters={filters} />

        <PaymentTable payments={items} hasFilters={hasFilters} />

        <PaymentPagination
          pagination={pagination}
          count={items.length}
          filters={filters}
        />
      </section>

      <p className="text-xs leading-6 text-slate-500">
        Payment records are displayed per shipment. A pending payment remains
        pending until confirmed by the backend.
      </p>
    </div>
  );
}
