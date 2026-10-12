
import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Truck,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import {
  getAdminShipmentDetail,
  type AdminShipmentDetail,
} from "@/lib/server/admin-shipment-detail";

import {
  getActiveCouriers,
} from "@/lib/server/admin-courier";

import {
  AssignPickupForm,
} from "@/component/admin/assign-pickup-form";

// ---------------------------------------------
// Page metadata
// ---------------------------------------------

export const metadata: Metadata = {
  title: "Shipment Operations | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

// ---------------------------------------------
// Types
// ---------------------------------------------

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type TrackingEvent =
  AdminShipmentDetail["trackingEvents"][number];

type CourierTask =
  AdminShipmentDetail["courierTasks"][number];

// ---------------------------------------------
// Formatting helpers
// ---------------------------------------------

function readable(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
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

function formatMoney(
  minor: number,
  currency: string,
): string {
  try {
    const formatter = new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency: currency.toUpperCase(),
      },
    );

    const digits =
      formatter.resolvedOptions()
        .maximumFractionDigits ?? 2;

    return formatter.format(
      minor / 10 ** digits,
    );
  } catch {
    return `${currency} ${minor} minor units`;
  }
}

function field(
  data: unknown,
  key: string,
): string | null {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    return null;
  }

  const value =
    (data as Record<string, unknown>)[key];

  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  return value.trim();
}

function formatAddress(data: unknown): string {
  if (typeof data === "string") {
    return data.trim() || "Not provided";
  }

  const parts = [
    field(data, "address"),
    field(data, "city"),
    field(data, "district"),
  ].filter(
    (item): item is string =>
      Boolean(item),
  );

  if (parts.length === 0) {
    return "Not provided";
  }

  return [...new Set(parts)].join(", ");
}

// ---------------------------------------------
// Shared status badge
// ---------------------------------------------

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "DELIVERED" ||
    status === "PAID" ||
    status === "COMPLETED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "DELIVERY_FAILED" ||
          status === "CANCELLED" ||
          status === "FAILED"
        ? "bg-red-50 text-red-700"
        : status === "DRAFT" ||
            status === "CHECKOUT_PENDING" ||
            status === "UNPAID"
          ? "bg-amber-50 text-amber-700"
          : "bg-teal-50 text-teal-700";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {readable(status)}
    </span>
  );
}

// ---------------------------------------------
// Reusable information panel
// ---------------------------------------------

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <Icon
          aria-hidden="true"
          className="size-5 text-[#00877B]"
        />

        <h2 className="text-lg font-bold text-[#102D46]">
          {title}
        </h2>
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

// ---------------------------------------------
// Reusable detail row
// ---------------------------------------------

function Detail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm leading-6 text-[#102D46]">
        {children}
      </dd>
    </div>
  );
}

// ---------------------------------------------
// Shipment tracking timeline
// ---------------------------------------------

function ShipmentJourney({
  events,
}: {
  events: TrackingEvent[];
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No tracking events recorded yet.
      </p>
    );
  }

  const orderedEvents = [...events].sort(
    (a, b) => {
      const dateDifference =
        new Date(b.occurredAt).getTime() -
        new Date(a.occurredAt).getTime();

      return dateDifference || b.id - a.id;
    },
  );

  return (
    <ol className="space-y-0">
      {orderedEvents.map((event, index) => {
        const isLatest = index === 0;
        const isLast =
          index === orderedEvents.length - 1;

        return (
          <li
            key={event.id}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute bottom-0 left-[11px] top-7 w-px bg-slate-200"
              />
            )}

            <span
              className={
                isLatest
                  ? "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00877B] text-white"
                  : "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-[#00877B]"
              }
            >
              <CheckCircle2
                aria-hidden="true"
                className="size-4"
              />
            </span>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#102D46]">
                {readable(event.newStatus)}
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
                {formatDate(event.occurredAt)}
              </time>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------
// Courier assignment history
// ---------------------------------------------

function CourierAssignments({
  tasks,
}: {
  tasks: CourierTask[];
}) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm leading-7 text-slate-500">
        No courier assignments have been created
        for this shipment.
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="space-y-2 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#102D46]">
              {readable(task.type)} task #{task.id}
            </p>

            <StatusBadge
              status={task.status}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-700">
              {task.courier.name ||
                task.courier.email}
            </p>

            <p className="text-xs text-slate-500">
              {task.courier.email}
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Assigned: {formatDate(task.createdAt)}
          </p>

          {task.acceptedAt && (
            <p className="text-xs text-slate-500">
              Accepted: {formatDate(task.acceptedAt)}
            </p>
          )}

          {task.completedAt && (
            <p className="text-xs text-slate-500">
              Completed: {formatDate(task.completedAt)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------
// Shipment information panel
// ---------------------------------------------

function ShipmentInformation({
  shipment,
}: {
  shipment: AdminShipmentDetail;
}) {
  return (
    <Panel
      title="Shipment information"
      icon={Package}
    >
      <dl className="grid gap-6 sm:grid-cols-2">
        <Detail label="Origin hub">
          {shipment.originHub.name}
        </Detail>

        <Detail label="Destination hub">
          {shipment.destinationHub.name}
        </Detail>

        <Detail label="Parcel">
          {shipment.description?.trim() ||
            "Description not provided"}
        </Detail>

        <Detail label="Weight">
          {shipment.weight} kg
        </Detail>

        <Detail label="Pickup address">
          {formatAddress(
            shipment.pickupAddress,
          )}
        </Detail>

        <Detail label="Recipient address">
          {formatAddress(shipment.recipient)}
        </Detail>

        <Detail label="Created">
          {formatDate(shipment.createdAt)}
        </Detail>
      </dl>
    </Panel>
  );
}

// ---------------------------------------------
// Customer and recipient panel
// ---------------------------------------------

function CustomerInformation({
  shipment,
}: {
  shipment: AdminShipmentDetail;
}) {
  return (
    <Panel
      title="Customer & recipient"
      icon={UserRound}
    >
      <dl className="space-y-5">
        <Detail label="Customer">
          {shipment.customer.name ||
            shipment.customer.email}
        </Detail>

        <Detail label="Customer email">
          {shipment.customer.email}
        </Detail>

        <Detail label="Customer phone">
          {shipment.customer.phone ||
            "Not provided"}
        </Detail>

        <Detail label="Pickup contact">
          {field(
            shipment.pickupAddress,
            "senderName",
          ) || "Not provided"}
        </Detail>

        <Detail label="Pickup phone">
          {field(
            shipment.pickupAddress,
            "senderPhone",
          ) || "Not provided"}
        </Detail>

        <Detail label="Recipient">
          {field(
            shipment.recipient,
            "name",
          ) || "Not provided"}
        </Detail>

        <Detail label="Recipient phone">
          {field(
            shipment.recipient,
            "phone",
          ) || "Not provided"}
        </Detail>
      </dl>
    </Panel>
  );
}

// ---------------------------------------------
// Payment information panel
// ---------------------------------------------

function PaymentInformation({
  shipment,
}: {
  shipment: AdminShipmentDetail;
}) {
  const payment = shipment.payment;

  return (
    <Panel
      title="Payment information"
      icon={CreditCard}
    >
      <dl className="space-y-5">
        <Detail label="Shipping quote">
          {formatMoney(
            shipment.quotedAmountMinor,
            shipment.currency,
          )}
        </Detail>

        <Detail label="Payment status">
          <StatusBadge
            status={payment?.status ?? "UNPAID"}
          />
        </Detail>

        {payment && (
          <>
            <Detail label="Payment amount">
              {formatMoney(
                payment.amountMinor,
                payment.currency,
              )}
            </Detail>

            <Detail label="Provider">
              {payment.provider}
            </Detail>

            {payment.paidAt && (
              <Detail label="Paid at">
                {formatDate(payment.paidAt)}
              </Detail>
            )}
          </>
        )}
      </dl>
    </Panel>
  );
}

// ---------------------------------------------
// Courier assignment panel
// ---------------------------------------------

function CourierAssignmentSection({
  shipment,
  couriers,
}: {
  shipment: AdminShipmentDetail;
  couriers: Awaited<
    ReturnType<typeof getActiveCouriers>
  >;
}) {
  const canAssignPickup =
    shipment.status === "READY_FOR_PICKUP" &&
    shipment.payment?.status === "PAID";

  const paymentNotVerified =
    shipment.status === "READY_FOR_PICKUP" &&
    shipment.payment?.status !== "PAID";

  return (
    <Panel
      title="Courier assignment"
      icon={Truck}
    >
      {/* Real pickup assignment form */}
      {canAssignPickup && (
        <AssignPickupForm
          shipmentId={shipment.id}
          couriers={couriers}
        />
      )}

      {/* Shipment awaiting payment verification */}
      {paymentNotVerified && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Payment verification required
          </p>

          <p className="mt-2 text-xs leading-6 text-amber-700">
            Pickup assignment is unavailable
            until Stripe payment is confirmed.
          </p>
        </div>
      )}

      {/* Shipment cannot currently be assigned */}
      {!canAssignPickup &&
        !paymentNotVerified &&
        shipment.courierTasks.length === 0 && (
          <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Pickup assignment is available only
            when a shipment is paid and ready
            for pickup.
          </p>
        )}

      {/* Existing assignment records */}
      <div
        className={
          canAssignPickup || paymentNotVerified
            ? "mt-7 border-t border-slate-100 pt-6"
            : "mt-1"
        }
      >
        <h3 className="mb-4 text-sm font-semibold text-[#102D46]">
          Assignment history
        </h3>

        <CourierAssignments
          tasks={shipment.courierTasks}
        />
      </div>
    </Panel>
  );
}

// ---------------------------------------------
// Main Admin shipment details page
// ---------------------------------------------

export default async function AdminShipmentDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  // Fetch shipment, payment, and tracking data.
  const shipment =
    await getAdminShipmentDetail(id);

  // Fetch courier directory only when pickup
  // assignment is permitted for this shipment.
  const canAssignPickup =
    shipment.status === "READY_FOR_PICKUP" &&
    shipment.payment?.status === "PAID";

  const couriers = canAssignPickup
    ? await getActiveCouriers()
    : [];

  return (
    <div className="space-y-7">
      {/* Back navigation */}
      <Link
        href="/admin/shipments"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] hover:underline"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-4"
        />
        Back to shipments
      </Link>

      {/* Shipment header */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Shipment operations
        </h1>

        <p className="mt-2 text-sm leading-7 text-slate-600">
          Review shipment progress, courier tasks,
          and verified payment information.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="break-all text-lg font-bold text-[#102D46]">
            {shipment.trackingCode}
          </p>

          <StatusBadge
            status={shipment.status}
          />

          <StatusBadge
            status={
              shipment.payment?.status ?? "UNPAID"
            }
          />
        </div>
      </header>

      {/* Main two-column layout */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)]">
        {/* Left column */}
        <div className="space-y-5">
          <Panel
            title="Shipment journey"
            icon={MapPin}
          >
            <ShipmentJourney
              events={shipment.trackingEvents}
            />
          </Panel>

          <ShipmentInformation
            shipment={shipment}
          />
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <CustomerInformation
            shipment={shipment}
          />

          <PaymentInformation
            shipment={shipment}
          />

          <CourierAssignmentSection
            shipment={shipment}
            couriers={couriers}
          />
        </div>
      </div>
    </div>
  );
}
