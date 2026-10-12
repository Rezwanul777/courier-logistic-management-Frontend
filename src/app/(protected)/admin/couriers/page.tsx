
import type { Metadata } from "next";

import { CourierDirectory } from
  "@/component/admin/courier-directory";

import { CreateCourierForm } from
  "@/component/admin/create-courier-form";

import { getAdminCouriers } from
  "@/lib/server/admin-courier";

export const metadata: Metadata = {
  title: "Courier Management | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function AdminCouriersPage() {
  const couriers = await getAdminCouriers();

  const active = couriers.filter(
    (courier) => courier.isActive,
  ).length;

  const inactive = couriers.length - active;

  return (
    <div className="space-y-7">
      {/* Heading */}
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Courier management
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Manage courier accounts, access, and
          availability for task assignment.
        </p>
      </header>

      {/* Real account counts */}
      <section
        aria-label="Courier account statistics"
        className="grid gap-4 sm:grid-cols-3"
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            All couriers
          </p>

          <p className="mt-3 text-3xl font-bold text-[#102D46]">
            {couriers.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Active couriers
          </p>

          <p className="mt-3 text-3xl font-bold text-[#00877B]">
            {active}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Inactive couriers
          </p>

          <p className="mt-3 text-3xl font-bold text-[#102D46]">
            {inactive}
          </p>
        </div>
      </section>

      {/* Main management sections */}
      <CourierDirectory couriers={couriers} />

      <CreateCourierForm />

      <p className="text-xs leading-6 text-slate-500">
        Courier accounts are created by administrators.
        Active couriers can receive pickup or delivery
        tasks. Accounts with outstanding tasks cannot
        be deactivated through this page.
      </p>
    </div>
  );
}
