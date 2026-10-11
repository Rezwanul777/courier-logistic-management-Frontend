
export const adminShipmentStatuses = [
  "ALL",
  "DRAFT",
  "READY_FOR_PICKUP",
  "PICKUP_ASSIGNED",
  "PICKED_UP",
  "AT_ORIGIN_HUB",
  "IN_TRANSIT",
  "AT_DESTINATION_HUB",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "DELIVERY_FAILED",
  "RETURN_IN_TRANSIT",
  "RETURNED_TO_SENDER",
  "CANCEL_REQUESTED",
  "CANCELLED",
] as const;

export const adminShipmentTabs = [
  "all",
  "ready",
  "transit",
  "delivered",
  "exceptions",
] as const;

export const adminShipmentDateRanges = [
  "all",
  "7d",
  "30d",
  "90d",
] as const;

export type AdminShipmentStatus =
  (typeof adminShipmentStatuses)[number];

export type AdminShipmentTab =
  (typeof adminShipmentTabs)[number];

export type AdminShipmentDateRange =
  (typeof adminShipmentDateRanges)[number];

export type AdminShipmentSort =
  "newest" | "oldest";

export interface AdminShipmentFilters {
  page: number;
  search: string;
  status: AdminShipmentStatus;
  tab: AdminShipmentTab;
  dateRange: AdminShipmentDateRange;
  sort: AdminShipmentSort;
}

export interface AdminShipmentSearchParams {
  [key: string]: string | string[] | undefined;
}

function single(
  value: string | string[] | undefined,
): string {
  return typeof value === "string" ? value : "";
}

function isOption<T extends string>(
  value: string,
  options: readonly T[],
): value is T {
  return options.some((option) => option === value);
}

export function parseAdminShipmentFilters(
  params: AdminShipmentSearchParams,
): AdminShipmentFilters {
  const rawPage = single(params.page);

  const parsedPage = /^[1-9]\d*$/.test(rawPage)
    ? Number(rawPage)
    : 1;

  const page =
    Number.isSafeInteger(parsedPage) &&
    parsedPage <= 100000
      ? parsedPage
      : 1;

  const rawStatus = single(params.status);
  const rawTab = single(params.tab);
  const rawRange = single(params.dateRange);

  return {
    page,

    search: single(params.search)
      .trim()
      .slice(0, 100),

    status: isOption(
      rawStatus,
      adminShipmentStatuses,
    )
      ? rawStatus
      : "ALL",

    tab: isOption(
      rawTab,
      adminShipmentTabs,
    )
      ? rawTab
      : "all",

    dateRange: isOption(
      rawRange,
      adminShipmentDateRanges,
    )
      ? rawRange
      : "30d",

    sort:
      single(params.sort) === "oldest"
        ? "oldest"
        : "newest",
  };
}

export function adminShipmentHref(
  filters: AdminShipmentFilters,
): string {
  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.tab !== "all") {
    params.set("tab", filters.tab);
  }

  if (filters.dateRange !== "30d") {
    params.set("dateRange", filters.dateRange);
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();

  return query
    ? `/admin/shipments?${query}`
    : "/admin/shipments";
}
