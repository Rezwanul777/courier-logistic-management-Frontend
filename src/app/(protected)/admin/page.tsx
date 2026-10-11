
import type { Metadata } from "next";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Package,
  PackageCheck,
  Truck,
} from "lucide-react";

import {
  getAdminOverview,
  type AdminOverview,
} from "@/lib/server/admin-overview";

export const metadata: Metadata = {
  title: "Operations Overview | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

type RecentShipment =
  AdminOverview["recentShipments"][number];

type VolumePoint =
  AdminOverview["volume"][number];

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusStyle(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700";

    case "IN_TRANSIT":
      return "bg-blue-50 text-blue-700";

    case "READY_FOR_PICKUP":
    case "PICKUP_ASSIGNED":
      return "bg-teal-50 text-teal-700";

    case "DRAFT":
      return "bg-amber-50 text-amber-700";

    case "DELIVERY_FAILED":
      return "bg-red-50 text-red-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getNextAction(
  shipment: RecentShipment,
): string {
  switch (shipment.status) {
    case "DRAFT":
      return "Await payment";

    case "READY_FOR_PICKUP":
      return "Assign pickup";

    case "PICKUP_ASSIGNED":
      return "Confirm pickup";

    case "PICKED_UP":
      return "Receive at origin";

    case "AT_ORIGIN_HUB":
      return "Dispatch transfer";

    case "IN_TRANSIT":
      return "Await hub receipt";

    case "AT_DESTINATION_HUB":
      return "Assign delivery";

    case "OUT_FOR_DELIVERY":
      return "Await delivery";

    case "DELIVERY_FAILED":
      return "Review failure";

    case "DELIVERED":
      return "Completed";

    default:
      return "Review shipment";
  }
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: typeof Package;
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-4 text-3xl font-bold tracking-tight text-[#102D46]">
            {formatNumber(value)}
          </p>
        </div>

        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
          <Icon
            aria-hidden="true"
            className="size-5"
          />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </article>
  );
}

function ShipmentVolume({
  points,
}: {
  points: VolumePoint[];
}) {
  const maximum = Math.max(
    1,
    ...points.map((point) => point.count),
  );

  const total = points.reduce(
    (sum, point) => sum + point.count,
    0,
  );

  return (
    <section
      aria-labelledby="shipment-volume-title"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="shipment-volume-title"
            className="text-lg font-bold text-[#102D46]"
          >
            Shipment volume
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Last 7 days · UTC · Real bookings
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-[#102D46]">
            {formatNumber(total)}
          </p>

          <p className="text-xs text-slate-500">
            New bookings
          </p>
        </div>
      </div>

      <div
        role="img"
        aria-label={`Shipments booked during the last seven UTC calendar days: ${points
          .map(
            (point) =>
              `${point.date}: ${point.count}`,
          )
          .join(", ")}`}
        className="mt-8 grid grid-cols-7 gap-2 sm:gap-4"
      >
        {points.map((point) => {
          const height =
            (point.count / maximum) * 100;

          return (
            <div
              key={point.date}
              className="flex min-w-0 flex-col items-center"
              title={`${point.date}: ${point.count} bookings`}
            >
              <div className="flex h-44 w-full flex-col items-center justify-end gap-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-600">
                  {point.count}
                </span>

                <div
                  className="w-full max-w-12 rounded-t-md bg-[#00877B] transition-[height]"
                  style={{
                    height: `${height}%`,
                  }}
                />
              </div>

              <span className="mt-3 text-xs text-slate-500">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <p className="mt-4 text-center text-xs text-slate-500">
          No new shipments in the last seven days.
        </p>
      )}
    </section>
  );
}

function AttentionItem({
  title,
  count,
  description,
  icon: Icon,
}: {
  title: string;
  count: number;
  description: string;
  icon: typeof Package;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-b-0">
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <Icon
            aria-hidden="true"
            className="size-5"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-[#102D46]">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <p className="text-2xl font-bold tabular-nums text-[#102D46]">
        {formatNumber(count)}
      </p>
    </div>
  );
}

function NeedsAttention({
  attention,
}: {
  attention: AdminOverview["attention"];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-[#102D46]">
        Needs attention
      </h2>

      <p className="mt-1 text-xs text-slate-500">
        Current operational exceptions
      </p>

      <div className="mt-4">
        <AttentionItem
          title="Unassigned pickups"
          count={attention.unassignedPickups}
          description="Ready for pickup without an active assignment"
          icon={Truck}
        />

        <AttentionItem
          title="Delivery failures"
          count={attention.deliveryFailures}
          description="Shipments requiring follow-up"
          icon={AlertCircle}
        />

        <AttentionItem
          title="Payment pending"
          count={attention.paymentPending}
          description="Draft shipments awaiting payment"
          icon={Clock3}
        />
      </div>
    </section>
  );
}

function RecentShipments({
  shipments,
}: {
  shipments: RecentShipment[];
}) {
  return (
    <section
      aria-labelledby="recent-shipments-title"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    >
      <header className="border-b border-slate-100 px-6 py-5">
        <h2
          id="recent-shipments-title"
          className="text-lg font-bold text-[#102D46]"
        >
          Recent shipments
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Latest bookings across all customers
        </p>
      </header>

      {shipments.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-14 text-center">
          <Package
            aria-hidden="true"
            className="size-10 text-[#00877B]"
          />

          <h3 className="mt-4 text-lg font-semibold text-[#102D46]">
            No shipments yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            New customer bookings will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs text-slate-500">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Tracking code
                </th>

                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Route
                </th>

                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Status
                </th>

                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Payment
                </th>

                <th
                  scope="col"
                  className="px-6 py-4 font-semibold"
                >
                  Next action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {shipments.map((shipment) => (
                <tr
                  key={shipment.id}
                  className="hover:bg-slate-50/70"
                >
                  <td className="px-6 py-5 font-semibold text-[#00877B]">
                    {shipment.trackingCode}
                  </td>

                  <td className="px-6 py-5 text-[#102D46]">
                    {shipment.originHub}
                    <span className="px-2 text-slate-400">
                      →
                    </span>
                    {shipment.destinationHub}
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(shipment.status)}`}
                    >
                      {formatStatus(shipment.status)}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={
                        shipment.paymentStatus === "PAID"
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }
                    >
                      {shipment.paymentStatus === "PAID"
                        ? "Paid"
                        : "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-xs font-medium text-slate-600">
                    {getNextAction(shipment)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default async function AdminOverviewPage() {
  const data = await getAdminOverview();

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Operations overview
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Manage the movement, people, and details
          behind every delivery.
        </p>
      </header>

      <section
        aria-label="Shipment statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          title="All shipments"
          value={data.summary.allShipments}
          description="All-time bookings"
          icon={Package}
        />

        <StatCard
          title="Ready for pickup"
          value={data.summary.readyForPickup}
          description="Awaiting collection"
          icon={Clock3}
        />

        <StatCard
          title="In transit"
          value={data.summary.inTransit}
          description="Moving between hubs"
          icon={Truck}
        />

        <StatCard
          title="Delivered"
          value={data.summary.delivered}
          description="Completed shipments"
          icon={PackageCheck}
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <ShipmentVolume points={data.volume} />

        <NeedsAttention attention={data.attention} />
      </div>

      <RecentShipments
        shipments={data.recentShipments}
      />

      <p className="text-xs leading-6 text-slate-500">
        Overview statistics are retrieved from the
        live database. Shipment management actions
        will be enabled in the Admin Shipments module.
      </p>
    </div>
  );
}
