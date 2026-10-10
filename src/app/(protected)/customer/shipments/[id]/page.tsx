
import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  Package,
} from "lucide-react";

import {
  getCustomerShipmentDetail,
  type ShipmentDetail,
  type ShipmentPayment,
  type TrackingEvent,
} from "@/lib/server/customer-shipment-detail";

export const metadata: Metadata = {
  title: "Shipment Details",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// ----------------------------------------
// Formatting
// ----------------------------------------

function formatStatus(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return `${new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date)} UTC`;
}

function formatWeight(weight: number): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(weight)} kg`;
}

function formatMoney(
  amountMinor: number,
  currency: string,
): string {
  const code = currency.toUpperCase();

  try {
    const formatter = new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: code,
      },
    );

    const digits =
      formatter.resolvedOptions()
        .maximumFractionDigits;

    return formatter.format(
      amountMinor / 10 ** (digits ?? 2),
    );
  } catch {
    return `${code} ${amountMinor} minor units`;
  }
}


function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readableText(
  value: unknown,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function formatAddress(value: unknown): string {
  if (typeof value === "string") {
    return value.trim() || "Not provided";
  }

  if (!isRecord(value)) {
    return "Not provided";
  }

  const addressValue =
    value.address ??
    value.pickupAddress ??
    value.deliveryAddress ??
    value.fullAddress;

  const address = readableText(addressValue);

  const street =
    readableText(value.street) ??
    readableText(value.line1);

  const line2 = readableText(value.line2);
  const area = readableText(value.area);
  const city = readableText(value.city);
  const district = readableText(value.district);

  const parts = [
    address,
    ...(address ? [] : [street, line2, area]),
    city,
    district,
  ].filter((part): part is string =>
    Boolean(part),
  );

  if (parts.length > 0) {
    return [...new Set(parts)].join(", ");
  }

  if (addressValue !== value) {
    return formatAddress(addressValue);
  }

  return "Not provided";
}

// ----------------------------------------
// Status badges
// ----------------------------------------

function ShipmentStatusBadge({
  status,
}: {
  status: string;
}) {
  const color =
    status === "DELIVERED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "DELIVERY_FAILED" ||
          status === "CANCELLED"
        ? "bg-red-50 text-red-700"
        : status === "DRAFT"
          ? "bg-slate-100 text-slate-600"
          : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function PaymentStatusBadge({
  payment,
}: {
  payment: ShipmentPayment | null;
}) {
  const paid = payment?.status === "PAID";

  return (
    <span
      className={
        paid
          ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
          : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
      }
    >
      {payment
        ? formatStatus(payment.status)
        : "Not initiated"}
    </span>
  );
}

// ----------------------------------------
// Shipment journey timeline
// ----------------------------------------

function ShipmentTimeline({
  events,
}: {
  events: TrackingEvent[];
}) {
  const sortedEvents = [...events].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() -
      new Date(a.occurredAt).getTime(),
  );

  return (
    <section
      aria-labelledby="journey-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <MapPin
          aria-hidden="true"
          className="size-5 text-[#00877B]"
        />

        <h2
          id="journey-heading"
          className="text-lg font-bold text-[#102D46]"
        >
          Shipment journey
        </h2>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="mt-8 rounded-lg bg-slate-50 px-5 py-8 text-center">
          <Clock3
            aria-hidden="true"
            className="mx-auto size-8 text-slate-400"
          />

          <p className="mt-3 text-sm text-slate-600">
            No tracking milestones recorded yet.
          </p>
        </div>
      ) : (
        <ol className="mt-8">
          {sortedEvents.map((event, index) => {
            const isLatest = index === 0;
            const isLast =
              index === sortedEvents.length - 1;

            return (
              <li
                key={event.id}
                className="relative flex gap-4 pb-8 last:pb-0"
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute left-[11px] top-7 bottom-0 w-px bg-slate-200"
                  />
                )}

                <div
                  className={
                    isLatest
                      ? "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00877B] text-white"
                      : "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-[#B8DDD6] bg-[#E8F5F2] text-[#00877B]"
                  }
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-4"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-[#102D46]">
                    {formatStatus(event.newStatus)}
                  </h3>

                  {event.reason && (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {event.reason}
                    </p>
                  )}

                  <time
                    dateTime={event.occurredAt}
                    className="mt-2 block text-xs text-slate-500"
                  >
                    {formatDateTime(event.occurredAt)}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// ----------------------------------------
// Shipment information panel
// ----------------------------------------

function InformationItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm leading-7 text-[#102D46]">
        {children}
      </dd>
    </div>
  );
}

function ShipmentInformation({
  shipment,
  payment,
}: {
  shipment: ShipmentDetail;
  payment: ShipmentPayment | null;
}) {
  const amount = payment
    ? formatMoney(
        payment.amountMinor,
        payment.currency,
      )
    : formatMoney(
        shipment.quotedAmountMinor,
        shipment.currency,
      );

  return (
    <section
      aria-labelledby="information-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <Package
          aria-hidden="true"
          className="size-5 text-[#00877B]"
        />

        <h2
          id="information-heading"
          className="text-lg font-bold text-[#102D46]"
        >
          Shipment information
        </h2>
      </div>

      <dl className="mt-8 space-y-7">
        <InformationItem label="Route">
          {shipment.originHub.name}
          <span className="mx-2 text-slate-400">
            →
          </span>
          {shipment.destinationHub.name}
        </InformationItem>

        <InformationItem label="Parcel">
          {shipment.description?.trim() ||
            "Description not provided"}
          <span className="mx-2 text-slate-400">
            ·
          </span>
          {formatWeight(shipment.weight)}
        </InformationItem>

        <InformationItem label="Pickup">
          {formatAddress(
            shipment.pickupAddress,
          )}
        </InformationItem>

        <InformationItem label="Recipient">
          {formatAddress(shipment.recipient)}
        </InformationItem>

        <InformationItem label="Payment">
          <div className="flex flex-wrap items-center gap-3">
            <span>{amount}</span>

            <PaymentStatusBadge payment={payment} />
          </div>

          {!payment && (
            <p className="mt-2 text-xs text-slate-500">
              Quoted amount. No payment record
              exists yet.
            </p>
          )}
        </InformationItem>
      </dl>

      <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
        <p className="text-xs text-slate-500">
          Detailed payment actions will be available
          when the Payments page is implemented.
        </p>

        <Link
          href="/customer/shipments"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-4"
          />
          Back to shipments
        </Link>
      </div>
    </section>
  );
}

// ----------------------------------------
// Main page
// ----------------------------------------

export default async function ShipmentDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const { shipment, payment } =
    await getCustomerShipmentDetail(id);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#102D46]">
          Shipment details
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          A clear view of your shipment, from
          pickup to delivery.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-lg font-bold text-[#102D46] sm:text-xl">
            {shipment.trackingCode}
          </p>

          <ShipmentStatusBadge
            status={shipment.status}
          />

          <PaymentStatusBadge payment={payment} />
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        <ShipmentTimeline
          events={shipment.trackingEvents}
        />

        <ShipmentInformation
          shipment={shipment}
          payment={payment}
        />
      </div>
    </div>
  );
}
