
export type RateStatus =
  "ALL" | "ACTIVE" | "INACTIVE";

export interface RateCardFilters {
  page: number;
  originZoneId: number | null;
  destinationZoneId: number | null;
  status: RateStatus;
}

export type RateCardSearchParams = Record<
  string,
  string | string[] | undefined
>;

function getSingle(
  value: string | string[] | undefined,
): string {
  return typeof value === "string" ? value : "";
}

function parseId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id)
    ? id
    : null;
}

export function parseRateCardFilters(
  params: RateCardSearchParams,
): RateCardFilters {
  const page = parseId(getSingle(params.page)) ?? 1;
  const status = getSingle(params.status);

  return {
    page: Math.min(page, 10000),
    originZoneId: parseId(
      getSingle(params.originZoneId),
    ),
    destinationZoneId: parseId(
      getSingle(params.destinationZoneId),
    ),
    status:
      status === "ACTIVE" || status === "INACTIVE"
        ? status
        : "ALL",
  };
}

export function rateCardHref(
  filters: RateCardFilters,
): string {
  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.originZoneId !== null) {
    params.set(
      "originZoneId",
      String(filters.originZoneId),
    );
  }

  if (filters.destinationZoneId !== null) {
    params.set(
      "destinationZoneId",
      String(filters.destinationZoneId),
    );
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  const query = params.toString();

  return query
    ? `/admin/rates?${query}`
    : "/admin/rates";
}
