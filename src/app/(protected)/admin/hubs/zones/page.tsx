
import type { Metadata } from "next";

import Link from "next/link";
import { redirect } from "next/navigation";

import {
  getAdminZones,
  parseLocationFilters,
  type LocationSearchParams,
} from "@/lib/server/admin-location";

import { toLocationRows } from "@/lib/location-rows";
import { locationUrl } from "@/lib/location-url";

import {
  LocationWorkspace,
} from "@/component/admin/location-workspace";

export const metadata: Metadata = {
  title: "Zone Management | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<LocationSearchParams>;
}

export default async function AdminZonesPage({
  searchParams,
}: PageProps) {
  const filters = parseLocationFilters(
    await searchParams,
  );

  const data = await getAdminZones(filters);

  const lastPage = Math.max(
    1,
    data.pagination.totalPages,
  );

  if (filters.page > lastPage) {
    redirect(
      locationUrl("zones", {
        ...filters,
        page: lastPage,
      }),
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
          Admin workspace
        </p>

        <h1 className="mt-3 text-3xl font-bold text-[#102D46]">
          Hubs & zones
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Create and manage geographical zones
          used for hub assignment and shipping rates.
        </p>
      </header>

      <nav
        aria-label="Location management tabs"
        className="flex gap-3 border-b border-slate-200"
      >
        <Link
          href="/admin/hubs"
          className="px-5 py-3 text-sm font-medium text-slate-600 hover:text-[#00877B]"
        >
          Hubs
        </Link>

        <Link
          href="/admin/hubs/zones"
          aria-current="page"
          className="border-b-2 border-[#00877B] px-5 py-3 text-sm font-semibold text-[#00877B]"
        >
          Zones
        </Link>
      </nav>

      <LocationWorkspace
        kind="zones"
        rows={toLocationRows(data.items)}
        zones={[]}
        pagination={data.pagination}
        filters={filters}
      />
    </div>
  );
}
