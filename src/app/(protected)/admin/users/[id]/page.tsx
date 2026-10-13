
import type { Metadata } from "next";
import type { ReactNode } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  getAdminUserById,
} from "@/lib/server/admin-users";

import {
  UserStatusActions,
} from "@/component/admin/user-status-actions";

export const metadata: Metadata = {
  title: "User Details | CourierFlow",
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

function Detail({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="break-words text-sm font-medium text-[#102D46]">
        {children}
      </dd>
    </div>
  );
}

export default async function AdminUserDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const user = await getAdminUserById(id);

  return (
    <div className="space-y-7">
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#00877B] hover:underline"
      >
        <ArrowLeft
          aria-hidden="true"
          className="size-4"
        />
        Back to users
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#102D46]">
          User details
        </h1>

        <p className="mt-3 text-sm text-slate-600">
          Review this account and its current
          access status.
        </p>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,1fr)]">
        {/* Account information */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <UserRound
              aria-hidden="true"
              className="size-5 text-[#00877B]"
            />

            <h2 className="text-lg font-bold text-[#102D46]">
              Account information
            </h2>
          </div>

          <div className="mt-6">
            <p className="text-xl font-bold text-[#102D46]">
              {user.name || `User #${user.id}`}
            </p>

            <p className="mt-1 break-all text-sm text-slate-600">
              {user.email}
            </p>
          </div>

          <dl className="mt-8 grid gap-6 sm:grid-cols-2">
            <Detail label="User ID">
              #{user.id}
            </Detail>

            <Detail label="Role">
              {user.role}
            </Detail>

            <Detail label="Phone">
              {user.phone || "Not provided"}
            </Detail>

            <Detail label="Account status">
              <span
                className={
                  user.isActive
                    ? "font-semibold text-emerald-700"
                    : "font-semibold text-amber-700"
                }
              >
                {user.isActive
                  ? "Active"
                  : "Inactive"}
              </span>
            </Detail>

            <Detail label="Email verification">
              {user.emailVerified
                ? "Verified"
                : "Not verified"}
            </Detail>

            <Detail label="Joined">
              {formatDate(user.createdAt)}
            </Detail>

            <Detail label="Last updated">
              {formatDate(user.updatedAt)}
            </Detail>
          </dl>
        </section>

        {/* Access management */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck
              aria-hidden="true"
              className="size-5 text-[#00877B]"
            />

            <h2 className="text-lg font-bold text-[#102D46]">
              Access management
            </h2>
          </div>

          <div className="mt-6">
            <UserStatusActions
              key={`${user.id}-${user.isActive}`}
              user={user}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
