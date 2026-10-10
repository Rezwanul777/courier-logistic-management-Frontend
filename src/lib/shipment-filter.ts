
export const shipmentStatuses = [
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

export type ShipmentStatus =
  (typeof shipmentStatuses)[number];

export const dateRanges = [
  "all",
  "7d",
  "30d",
  "90d",
] as const;

export type DateRange =
  (typeof dateRanges)[number];

export interface ShipmentFilters {
  page: number;
  search: string;
  status: ShipmentStatus | "";
  dateRange: DateRange;
}

type RawParams = Partial<
  Record<
    keyof ShipmentFilters,
    string | string[]
  >
>;

function singleValue(
  value: string | string[] | undefined,
): string {
  return typeof value === "string" ? value : "";
}

function isShipmentStatus(
  value: string,
): value is ShipmentStatus {
  return shipmentStatuses.some(
    (status) => status === value,
  );
}

function isDateRange(
  value: string,
): value is DateRange {
  return dateRanges.some(
    (range) => range === value,
  );
}

export function parseShipmentFilters(
  params: RawParams,
): ShipmentFilters {
  const rawPage = Number(
    singleValue(params.page) || "1",
  );

  const page =
    Number.isSafeInteger(rawPage) &&
    rawPage >= 1 &&
    rawPage <= 10_000
      ? rawPage
      : 1;

  const rawStatus = singleValue(params.status);
  const rawDateRange = singleValue(params.dateRange);

  return {
    page,
    search: singleValue(params.search)
      .trim()
      .slice(0, 80),
    status: isShipmentStatus(rawStatus)
      ? rawStatus
      : "",
    dateRange: isDateRange(rawDateRange)
      ? rawDateRange
      : "all",
  };
}

export function shipmentListHref(
  filters: ShipmentFilters,
  page = filters.page,
): string {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.dateRange !== "all") {
    params.set("dateRange", filters.dateRange);
  }

  const query = params.toString();

  return query
    ? `/customer/shipments?${query}`
    : "/customer/shipments";
}
