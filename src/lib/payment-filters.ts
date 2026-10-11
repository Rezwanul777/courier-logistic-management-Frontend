
export const paymentStatusOptions = [
  "ALL",
  "PAID",
  "AWAITING_PAYMENT",
  "CHECKOUT_PENDING",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
] as const;

export type PaymentStatusFilter =
  (typeof paymentStatusOptions)[number];

export type PaymentSort = "newest" | "oldest";

export interface PaymentFilterValues {
  page: number;
  search: string;
  status: PaymentStatusFilter;
  sort: PaymentSort;
}

export interface PaymentSearchParams {
  page?: string | string[];
  search?: string | string[];
  status?: string | string[];
  sort?: string | string[];
}

function getString(
  value: string | string[] | undefined,
): string {
  return typeof value === "string" ? value : "";
}

export function parsePaymentFilters(
  params: PaymentSearchParams,
): PaymentFilterValues {
  const rawPage = getString(params.page);

  const parsedPage = /^[1-9]\d*$/.test(rawPage)
    ? Number(rawPage)
    : 1;

  const page =
    Number.isSafeInteger(parsedPage) &&
    parsedPage >= 1 &&
    parsedPage <= 100000
      ? parsedPage
      : 1;

  const search = getString(params.search)
    .trim()
    .slice(0, 100);

  const rawStatus = getString(params.status);

  const status: PaymentStatusFilter =
    (
      paymentStatusOptions as readonly string[]
    ).includes(rawStatus)
      ? (rawStatus as PaymentStatusFilter)
      : "ALL";

  const sort: PaymentSort =
    getString(params.sort) === "oldest"
      ? "oldest"
      : "newest";

  return {
    page,
    search,
    status,
    sort,
  };
}

export function paymentListHref(
  filters: PaymentFilterValues,
  page: number = filters.page,
): string {
  const params = new URLSearchParams();

  if (page > 1 && Number.isSafeInteger(page)) {
    params.set("page", String(page));
  }

  if (filters.search.trim()) {
    params.set(
      "search",
      filters.search.trim().slice(0, 100),
    );
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }

  const query = params.toString();

  return query
    ? `/customer/payments?${query}`
    : "/customer/payments";
}
