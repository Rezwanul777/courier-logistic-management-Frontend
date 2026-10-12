
export const courierHistoryTypes = [
  "ALL",
  "PICKUP",
  "DELIVERY",
  "RETURN",
] as const;

export type CourierHistoryType =
  (typeof courierHistoryTypes)[number];

export type CourierHistorySort =
  "newest" | "oldest";

export interface CourierHistoryFilters {
  page: number;
  type: CourierHistoryType;
  search: string;
  sort: CourierHistorySort;
}

export interface CourierHistorySearchParams {
  [key: string]: string | string[] | undefined;
}

function single(
  value: string | string[] | undefined,
): string {
  return typeof value === "string" ? value : "";
}

// ---------------------------------------------
// Parse URL filters safely
// ---------------------------------------------

export function parseCourierHistoryFilters(
  params: CourierHistorySearchParams,
): CourierHistoryFilters {
  const rawPage = single(params.page);

  const pageNumber = /^[1-9]\d*$/.test(rawPage)
    ? Number(rawPage)
    : 1;

  const page =
    Number.isSafeInteger(pageNumber) &&
    pageNumber <= 10000
      ? pageNumber
      : 1;

  const rawType = single(params.type);

  const type: CourierHistoryType =
    courierHistoryTypes.some(
      (option) => option === rawType,
    )
      ? (rawType as CourierHistoryType)
      : "ALL";

  return {
    page,
    type,

    search: single(params.search)
      .trim()
      .slice(0, 100),

    sort:
      single(params.sort) === "oldest"
        ? "oldest"
        : "newest",
  };
}

// ---------------------------------------------
// Generate shareable filter URLs
// ---------------------------------------------

export function courierHistoryHref(
  filters: CourierHistoryFilters,
): string {
  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.type !== "ALL") {
    params.set("type", filters.type);
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();

  return query
    ? `/courier/history?${query}`
    : "/courier/history";
}
