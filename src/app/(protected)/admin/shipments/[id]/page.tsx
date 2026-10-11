
import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Truck,
  UserRound,
} from "lucide-react";

import {
  getAdminShipmentDetail,
  type AdminShipmentDetail,
} from "@/lib/server/admin-shipment-detail";

export const metadata: Metadata = {
  title: "Shipment Operations | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

function readable(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

function formatDate(value: string): string {
  return (
    new Intl.DateTimeFormat("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    }).format(new Date(value)) + " UTC"
  );
}

function formatMoney(
  minor: number,
  currency: string,
): string {
  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    });

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

  return typeof value === "string" &&
    value.trim()
    ? value.trim()
    : null;
}

function formatAddress(data: unknown): string {
  if (typeof data === "string") {
    return data.trim() || "Not provided";
  }

  const parts = [
    field(data, "address"),
    field(data, "city"),
    field(data, "district"),
  ].filter((item): item is string =>
    Boolean(item),
  );

  return parts.length
    ? [...new Set(parts)].join(", ")
    : "Not provided";
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const classes =
    status === "DELIVERED" ||
    status === "PAID"
      ? "bg-emerald-50 text-emerald-700"
      : status === "DELIVERY_FAILED" ||
          status === "CANCELLED" ||
          status === "FAILED"
        ? "bg-red-50 text-red-700"
        : status === "DRAFT" ||
            status === "CHECKOUT_PENDING"
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

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Package;
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

function ShipmentJourney({
  events,
}: {
  events: AdminShipmentDetail["trackingEvents"];
}) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No tracking events recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, index) => {
        const latest = index === 0;
        const last = index === events.length - 1;

        return (
          <li
            key={event.id}
            className="relative flex gap-4 pb-8 last:pb-0"
          >
            {!last && (
              <div className="absolute bottom-0 left-[11px] top-7 w-px bg-slate-200" />
            )}

            <span
              className={
                latest
                  ? "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#00877B] text-white"
                  : "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full border border-teal-200 bg-teal-50 text-[#00877B]"
              }
            >
              <CheckCircle2 className="size-4" />
            </span>

            <div>
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

function CourierAssignments({
  tasks,
}: {
  tasks: AdminShipmentDetail["courierTasks"];
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

            <StatusBadge status={task.status} />
          </div>

          <p className="text-sm text-slate-600">
            {task.courier.name ??
              task.courier.email}
          </p>

          <p className="text-xs text-slate-500">
            Assigned {formatDate(task.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function AdminShipmentDetailPage({
  params,
}: Props) {
  const { id } = await params;

  const shipment =
    await getAdminShipmentDetail(id);

  const payment = shipment.payment;

  return (
    <div className="space-y-7">
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

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Shipment operations
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Review shipment progress, courier tasks,
          and verified payment information.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="break-all text-lg font-bold text-[#102D46]">
            {shipment.trackingCode}
          </p>

          <StatusBadge status={shipment.status} />

          <StatusBadge
            status={payment?.status ?? "UNPAID"}
          />
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <Panel
            title="Shipment journey"
            icon={MapPin}
          >
            <ShipmentJourney
              events={shipment.trackingEvents}
            />
          </Panel>

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
                {shipment.description ||
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
        </div>

        <div className="space-y-5">
          <Panel
            title="Customer & recipient"
            icon={UserRound}
          >
            <dl className="space-y-5">
              <Detail label="Customer">
                {shipment.customer.name ??
                  shipment.customer.email}
              </Detail>

              <Detail label="Customer email">
                {shipment.customer.email}
              </Detail>

              <Detail label="Customer phone">
                {shipment.customer.phone ??
                  "Not provided"}
              </Detail>

              <Detail label="Pickup contact">
                {field(
                  shipment.pickupAddress,
                  "senderName",
                ) ?? "Not provided"}
              </Detail>

              <Detail label="Pickup phone">
                {field(
                  shipment.pickupAddress,
                  "senderPhone",
                ) ?? "Not provided"}
              </Detail>

              <Detail label="Recipient">
                {field(shipment.recipient, "name") ??
                  "Not provided"}
              </Detail>

              <Detail label="Recipient phone">
                {field(shipment.recipient, "phone") ??
                  "Not provided"}
              </Detail>
            </dl>
          </Panel>

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

          <Panel
            title="Courier assignment"
            icon={Truck}
          >
            <CourierAssignments
              tasks={shipment.courierTasks}
            />

            <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500">
              Courier assignment and hub workflow
              actions will be enabled in the next
              implementation stage.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
