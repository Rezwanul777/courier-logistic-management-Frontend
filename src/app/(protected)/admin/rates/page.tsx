
import type { Metadata } from "next";

import { redirect } from "next/navigation";

import {
  getAdminRateCards,
  getRateCardZones,
} from "@/lib/server/admin-rate-cards";

import {
  parseRateCardFilters,
  rateCardHref,
  type RateCardSearchParams,
} from "@/lib/rate-card-filters";

import {
  RateCardWorkspace,
} from "@/component/admin/rate-card-workspace";

export const metadata: Metadata = {
  title: "Rate Cards | CourierFlow",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<RateCardSearchParams>;
}

export default async function AdminRateCardsPage({
  searchParams,
}: PageProps) {
  const filters = parseRateCardFilters(
    await searchParams,
  );

  // Fetch private rate data and active zones.
  const [data, zones] = await Promise.all([
    getAdminRateCards(filters),
    getRateCardZones(),
  ]);

  // Redirect invalid or outdated page numbers.
  const lastPage = Math.max(
    1,
    data.pagination.totalPages,
  );

  if (filters.page > lastPage) {
    redirect(
      rateCardHref({
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

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#102D46]">
          Rate cards management
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Manage zone-based shipping charges,
          weight ranges, and rate availability.
        </p>
      </header>

      <RateCardWorkspace
        data={data}
        zones={zones}
        filters={filters}
      />

      <p className="text-xs leading-6 text-slate-500">
        Rate changes affect future shipment
        quotations. Existing booked shipment
        amounts and verified payments are
        preserved.
      </p>
    </div>
  );
}
