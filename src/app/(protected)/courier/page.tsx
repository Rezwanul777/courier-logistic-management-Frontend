
import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  MapPin,
  Package,
} from "lucide-react";

import {
  getCourierTasks,
  type CourierTask,
  type CourierTaskTypeFilter,
} from "@/lib/server/courier-tasks";

import {
  formatTaskAddress,
  formatTaskDate,
  taskStatusLabel,
} from "@/lib/courier-task-format";

export const metadata: Metadata = {
  title: "My Tasks | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    page?: string | string[];
    type?: string | string[];
  }>;
}

const filters: {
  label: string;
  value: CourierTaskTypeFilter;
}[] = [
  { label: "All tasks", value: "ALL" },
  { label: "Pickup", value: "PICKUP" },
  { label: "Delivery", value: "DELIVERY" },
];

function taskListHref(
  type: CourierTaskTypeFilter,
  page = 1,
): string {
  const params = new URLSearchParams();

  if (type !== "ALL") {
    params.set("type", type);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query
    ? `/courier?${query}`
    : "/courier";
}

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-[#102D46]">
        {value}
      </p>

      <p className="mt-2 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function TaskCard({
  task,
}: {
  task: CourierTask;
}) {
  const assigned = task.status === "ASSIGNED";

  const statusClasses = assigned
    ? "bg-amber-50 text-amber-700"
    : "bg-teal-50 text-teal-700";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
            >
              {taskStatusLabel(task.status)}
            </span>

            <span className="text-xs text-slate-400">
              Task #{task.id}
            </span>
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#102D46]">
            {taskStatusLabel(task.type)}
            {" · "}
            {task.shipment.trackingCode}
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            {task.type === "PICKUP"
              ? "Collect the parcel from the sender."
              : "Delivery task assigned to your account."}
          </p>
        </div>

        <Package
          aria-hidden="true"
          className="size-6 text-[#00877B]"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600">
        <span>{task.shipment.originHub.name}</span>
        <span className="text-slate-400">→</span>
        <span>{task.shipment.destinationHub.name}</span>
        <span className="text-slate-300">·</span>
        <span>{task.shipment.weight} kg</span>
      </div>

      {task.shipment.description && (
        <p className="mt-2 text-sm text-slate-500">
          {task.shipment.description}
        </p>
      )}

      <div className="mt-5 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pickup address
          </p>

          <p className="mt-2 text-sm leading-6 text-[#102D46]">
            {formatTaskAddress(
              task.shipment.pickupAddress,
            )}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Recipient address
          </p>

          <p className="mt-2 text-sm leading-6 text-[#102D46]">
            {formatTaskAddress(
              task.shipment.recipient,
            )}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <span className="text-xs text-slate-500">
          Assigned {formatTaskDate(task.createdAt)}
        </span>

        <Link
          href={`/courier/tasks/${task.id}`}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66]"
        >
          <MapPin
            aria-hidden="true"
            className="size-4"
          />
          View task
          <ArrowRight
            aria-hidden="true"
            className="size-4"
          />
        </Link>
      </div>
    </article>
  );
}

export default async function CourierDashboard({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const rawType =
    typeof params.type === "string"
      ? params.type
      : "ALL";

  const type: CourierTaskTypeFilter =
    rawType === "PICKUP" ||
    rawType === "DELIVERY"
      ? rawType
      : "ALL";

  const rawPage =
    typeof params.page === "string"
      ? params.page
      : "1";

  const parsedPage = Number(rawPage);

  const page =
    /^[1-9]\d*$/.test(rawPage) &&
    Number.isSafeInteger(parsedPage) &&
    parsedPage <= 10000
      ? parsedPage
      : 1;

  const result = await getCourierTasks(page, type);

  const lastPage = Math.max(
    1,
    result.pagination.totalPages,
  );

  if (page > lastPage) {
    redirect(taskListHref(type, lastPage));
  }

  const { assigned, accepted, completed } =
    result.summary;

  const first =
    result.items.length > 0
      ? (page - 1) * result.pagination.limit + 1
      : 0;

  const last =
    result.items.length > 0
      ? first + result.items.length - 1
      : 0;

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Courier workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#102D46]">
          My tasks
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Your assigned pickups and deliveries,
          with the information needed to complete
          each task.
        </p>
      </header>

      <section
        aria-label="Task statistics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <Metric
          label="Assigned"
          value={assigned}
          description="Waiting for acceptance"
        />

        <Metric
          label="Accepted"
          value={accepted}
          description="Ready for completion"
        />

        <Metric
          label="Completed"
          value={completed}
          description="Recorded task completions"
        />
      </section>

      <section className="space-y-5">
        <nav
          aria-label="Task type filter"
          className="flex flex-wrap gap-2"
        >
          {filters.map((filter) => {
            const active = filter.value === type;

            return (
              <Link
                key={filter.value}
                href={taskListHref(filter.value)}
                aria-current={
                  active ? "page" : undefined
                }
                className={
                  active
                    ? "rounded-lg bg-[#00877B] px-5 py-3 text-sm font-semibold text-white"
                    : "rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                }
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>

        {result.items.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
            <ClipboardList
              aria-hidden="true"
              className="mx-auto size-10 text-slate-400"
            />

            <h2 className="mt-4 text-lg font-semibold text-[#102D46]">
              No active tasks
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              There are no assigned or accepted
              tasks matching this filter.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {result.items.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            Showing {first}–{last} of{" "}
            {result.pagination.total}
          </p>

          <nav
            aria-label="Task pagination"
            className="flex items-center gap-2"
          >
            {page > 1 ? (
              <Link
                href={taskListHref(type, page - 1)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46]"
              >
                <ArrowLeft className="size-4" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-100 px-4 text-sm text-slate-400">
                <ArrowLeft className="size-4" />
                Previous
              </span>
            )}

            {page < result.pagination.totalPages ? (
              <Link
                href={taskListHref(type, page + 1)}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46]"
              >
                Next
                <ArrowRight className="size-4" />
              </Link>
            ) : (
              <span className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-100 px-4 text-sm text-slate-400">
                Next
                <ArrowRight className="size-4" />
              </span>
            )}
          </nav>
        </div>
      </section>
    </div>
  );
}
