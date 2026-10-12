
import type { Metadata } from "next";

import Link from "next/link";

import {
  ArrowLeft,
  CalendarClock,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";

import {
  getCourierTask,
} from "@/lib/server/courier-tasks";

import {
  formatTaskAddress,
  formatTaskDate,
  taskField,
  taskStatusLabel,
} from "@/lib/courier-task-format";

import {
  CourierTaskActions,
} from "@/component/courier/courier-task-actions";

export const metadata: Metadata = {
  title: "Task Details | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm leading-7 text-[#102D46]">
        {value}
      </dd>
    </div>
  );
}

export default async function CourierTaskDetails({
  params,
}: PageProps) {
  const { id } = await params;

  const task = await getCourierTask(id);

  const pickup = task.shipment.pickupAddress;
  const recipient = task.shipment.recipient;

  return (
    <div className="space-y-7">
      <Link
        href="/courier"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] hover:underline"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-4"
        />
        Back to my tasks
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Courier workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#102D46]">
          Task details
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Review the shipment and complete your
          assigned courier task.
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            {taskStatusLabel(task.status)}
          </span>

          <span className="text-sm font-semibold text-[#102D46]">
            {taskStatusLabel(task.type)}
          </span>

          <span className="break-all text-sm font-semibold text-[#00877B]">
            {task.shipment.trackingCode}
          </span>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,1fr)]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <MapPin
                aria-hidden="true"
                className="size-5 text-[#00877B]"
              />

              <h2 className="text-lg font-bold text-[#102D46]">
                Collection and delivery information
              </h2>
            </div>

            <dl className="mt-7 grid gap-6 sm:grid-cols-2">
              <InfoRow
                label="Pickup address"
                value={formatTaskAddress(pickup)}
              />

              <InfoRow
                label="Recipient address"
                value={formatTaskAddress(recipient)}
              />

              <InfoRow
                label="Sender name"
                value={
                  taskField(pickup, "senderName") ??
                  "Not provided"
                }
              />

              <InfoRow
                label="Sender phone"
                value={
                  taskField(pickup, "senderPhone") ??
                  "Not provided"
                }
              />

              <InfoRow
                label="Recipient name"
                value={
                  taskField(recipient, "name") ??
                  "Not provided"
                }
              />

              <InfoRow
                label="Recipient phone"
                value={
                  taskField(recipient, "phone") ??
                  "Not provided"
                }
              />
            </dl>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <Package
                aria-hidden="true"
                className="size-5 text-[#00877B]"
              />

              <h2 className="text-lg font-bold text-[#102D46]">
                Parcel information
              </h2>
            </div>

            <dl className="mt-7 grid gap-6 sm:grid-cols-2">
              <InfoRow
                label="Description"
                value={
                  task.shipment.description ??
                  "Not provided"
                }
              />

              <InfoRow
                label="Weight"
                value={`${task.shipment.weight} kg`}
              />

              <InfoRow
                label="Origin hub"
                value={task.shipment.originHub.name}
              />

              <InfoRow
                label="Destination hub"
                value={
                  task.shipment.destinationHub.name
                }
              />

              <InfoRow
                label="Shipment status"
                value={taskStatusLabel(
                  task.shipment.status,
                )}
              />
            </dl>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <UserRound
                aria-hidden="true"
                className="size-5 text-[#00877B]"
              />

              <h2 className="text-lg font-bold text-[#102D46]">
                Task actions
              </h2>
            </div>

            <div className="mt-6">
              <CourierTaskActions
                task={{
                  id: task.id,
                  type: task.type,
                  status: task.status,
                }}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <CalendarClock
                aria-hidden="true"
                className="size-5 text-[#00877B]"
              />

              <h2 className="text-lg font-bold text-[#102D46]">
                Task activity
              </h2>
            </div>

            <dl className="mt-6 space-y-5">
              <InfoRow
                label="Assigned"
                value={formatTaskDate(
                  task.createdAt,
                )}
              />

              {task.acceptedAt && (
                <InfoRow
                  label="Accepted"
                  value={formatTaskDate(
                    task.acceptedAt,
                  )}
                />
              )}

              {task.completedAt && (
                <InfoRow
                  label="Completed"
                  value={formatTaskDate(
                    task.completedAt,
                  )}
                />
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
