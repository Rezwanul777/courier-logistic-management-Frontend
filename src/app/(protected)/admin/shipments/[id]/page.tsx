
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

import {
  AssignDeliveryForm,
} from "@/component/admin/assign-delivery-form";

import {
  HubTransferOperations,
} from "@/component/admin/hub-transfer-operations";

// =============================================
// Page configuration
// =============================================

export const metadata: Metadata = {
  title: "Shipment Operations | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

// =============================================
// Types
// =============================================

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type TrackingEvent =
  AdminShipmentDetail["trackingEvents"][number];

type CourierTask =
  AdminShipmentDetail["courierTasks"][number];

type ActiveCouriers = Awaited<
  ReturnType<typeof getActiveCouriers>
>;

// =============================================
// Formatting helpers
// =============================================

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

// =============================================
// Shared status badge
// =============================================

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const completedStatuses = [
    "DELIVERED",
    "PAID",
    "COMPLETED",
    "RECEIVED",
  ];

  const failedStatuses = [
    "DELIVERY_FAILED",
    "CANCELLED",
    "FAILED",
  ];

  const pendingStatuses = [
    "DRAFT",
    "CHECKOUT_PENDING",
    "UNPAID",
    "ASSIGNED",
  ];

  let classes =
    "bg-teal-50 text-teal-700";

  if (completedStatuses.includes(status)) {
    classes =
      "bg-emerald-50 text-emerald-700";
  } else if (failedStatuses.includes(status)) {
    classes =
      "bg-red-50 text-red-700";
  } else if (pendingStatuses.includes(status)) {
    classes =
      "bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${classes}`}
    >
      {readable(status)}
    </span>
  );
}

// =============================================
// Reusable information panel
// =============================================

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
          className="size-5 shrink-0 text-[#00877B]"
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

// =============================================
// Reusable detail row
// =============================================

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

// =============================================
// Shipment tracking timeline
// =============================================

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
      const difference =
        new Date(b.occurredAt).getTime() -
        new Date(a.occurredAt).getTime();

      return difference || b.id - a.id;
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

// =============================================
// Courier assignment history
// =============================================

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
          className="space-y-3 py-5 first:pt-0 last:pb-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#102D46]">
                {readable(task.type)} task #{task.id}
              </p>
            </div>

            <StatusBadge
              status={task.status}
            />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-[#102D46]">
              {task.courier.name ||
                task.courier.email}
            </p>

            <p className="break-all text-xs text-slate-500">
              {task.courier.email}
            </p>
          </div>

          <div className="space-y-1 text-xs text-slate-500">
            <p>
              Assigned: {formatDate(task.createdAt)}
            </p>

            {task.acceptedAt && (
              <p>
                Accepted: {formatDate(task.acceptedAt)}
              </p>
            )}

            {task.completedAt && (
              <p>
                Completed: {formatDate(task.completedAt)}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// Courier assignment section
// Supports both PICKUP and DELIVERY
// =============================================

function CourierAssignmentSection({
  shipment,
  couriers,
}: {
  shipment: AdminShipmentDetail;
  couriers: ActiveCouriers;
}) {
  const isPaid =
    shipment.payment?.status === "PAID";

  const canAssignPickup =
    shipment.status === "READY_FOR_PICKUP" &&
    isPaid;

  const canAssignDelivery =
    shipment.status === "AT_DESTINATION_HUB" &&
    isPaid;

  const requiresPayment =
    (
      shipment.status === "READY_FOR_PICKUP" ||
      shipment.status === "AT_DESTINATION_HUB"
    ) &&
    !isPaid;

  const canAssign =
    canAssignPickup || canAssignDelivery;

  return (
    <Panel
      title="Courier assignment"
      icon={Truck}
    >
      {/* -------------------------------
          Pickup courier assignment
         ------------------------------- */}

      {canAssignPickup && (
        <AssignPickupForm
          key={`pickup-${shipment.id}`}
          shipmentId={shipment.id}
          couriers={couriers}
        />
      )}

      {/* -------------------------------
          Delivery courier assignment
         ------------------------------- */}

      {canAssignDelivery && (
        <AssignDeliveryForm
          key={`delivery-${shipment.id}`}
          shipmentId={shipment.id}
          couriers={couriers}
        />
      )}

      {/* -------------------------------
          Payment is not verified
         ------------------------------- */}

      {requiresPayment && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-800">
            Payment verification required
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            Courier assignment is unavailable
            until the shipment payment is verified.
          </p>
        </div>
      )}

      {/* -------------------------------
          Assignment not available
         ------------------------------- */}

      {!canAssign &&
        !requiresPayment &&
        shipment.courierTasks.length === 0 && (
          <p className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Courier assignment is not available
            for the current shipment status.
          </p>
        )}

      {/* -------------------------------
          Pickup and delivery history
         ------------------------------- */}

      <div
        className={
          canAssign || requiresPayment
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

// =============================================
// Shipment information
// =============================================

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
          {formatAddress(
            shipment.recipient,
          )}
        </Detail>

        <Detail label="Created">
          {formatDate(shipment.createdAt)}
        </Detail>
      </dl>
    </Panel>
  );
}

// =============================================
// Customer and recipient information
// =============================================

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

// =============================================
// Payment information
// =============================================

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

// =============================================
// Hub transfer operations
// =============================================

function HubTransferSection({
  shipment,
}: {
  shipment: AdminShipmentDetail;
}) {
  return (
    <Panel
      title="Hub transfer operations"
      icon={MapPin}
    >
      <HubTransferOperations
        key={`${shipment.id}-${shipment.status}`}
        shipment={shipment}
      />
    </Panel>
  );
}

// =============================================
// Main Admin Shipment Details page
// =============================================

export default async function AdminShipmentDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  // -------------------------------------------
  // 1. Fetch complete shipment details
  // -------------------------------------------

  const shipment =
    await getAdminShipmentDetail(id);

  // -------------------------------------------
  // 2. Determine assignment eligibility
  // -------------------------------------------

  const isPaid =
    shipment.payment?.status === "PAID";

  const canAssignCourier =
    isPaid &&
    (
      shipment.status === "READY_FOR_PICKUP" ||
      shipment.status === "AT_DESTINATION_HUB"
    );

  // -------------------------------------------
  // 3. Fetch couriers only when needed
  // -------------------------------------------

  const couriers = canAssignCourier
    ? await getActiveCouriers()
    : [];

  // -------------------------------------------
  // 4. Render Admin shipment workspace
  // -------------------------------------------

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

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Review shipment progress, courier tasks,
          hub transfers, and verified payment
          information.
        </p>

        {/* Tracking code and status */}
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

        {/* ===================================
            Left column
           =================================== */}

        <div className="min-w-0 space-y-5">
          {/* Shipment journey */}
          <Panel
            title="Shipment journey"
            icon={MapPin}
          >
            <ShipmentJourney
              events={shipment.trackingEvents}
            />
          </Panel>

          {/* Shipment information */}
          <ShipmentInformation
            shipment={shipment}
          />
        </div>

        {/* ===================================
            Right column
           =================================== */}

        <div className="min-w-0 space-y-5">
          {/* Customer and recipient */}
          <CustomerInformation
            shipment={shipment}
          />

          {/* Payment information */}
          <PaymentInformation
            shipment={shipment}
          />

          {/* Pickup and delivery assignment */}
          <CourierAssignmentSection
            shipment={shipment}
            couriers={couriers}
          />

          {/* Hub transfer management */}
          <HubTransferSection
            shipment={shipment}
          />
        </div>
      </div>
    </div>
  );
}
