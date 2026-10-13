
export type AdminUserRole =
  | "ALL"
  | "CUSTOMER"
  | "COURIER"
  | "ADMIN";

export type AdminUserStatus =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

export type AdminUserSortBy =
  | "createdAt"
  | "name"
  | "email";

export type AdminUserSortOrder =
  | "asc"
  | "desc";

export interface AdminUserFilters {
  page: number;
  search: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  sortBy: AdminUserSortBy;
  sortOrder: AdminUserSortOrder;
}

export type AdminUserSearchParams = Record<
  string,
  string | string[] | undefined
>;

function single(
  value: string | string[] | undefined,
): string {
  return typeof value === "string"
    ? value
    : "";
}

export function parseAdminUserFilters(
  params: AdminUserSearchParams,
): AdminUserFilters {
  const rawPage = single(params.page);

  const parsedPage =
    /^[1-9]\d*$/.test(rawPage)
      ? Number(rawPage)
      : 1;

  const page =
    Number.isSafeInteger(parsedPage) &&
    parsedPage <= 100000
      ? parsedPage
      : 1;

  const rawRole = single(params.role);
  const rawStatus = single(params.status);
  const rawSortBy = single(params.sortBy);
  const rawSortOrder = single(params.sortOrder);

  return {
    page,

    search: single(params.search)
      .trim()
      .slice(0, 100),

    role:
      rawRole === "CUSTOMER" ||
      rawRole === "COURIER" ||
      rawRole === "ADMIN"
        ? rawRole
        : "ALL",

    status:
      rawStatus === "ACTIVE" ||
      rawStatus === "INACTIVE"
        ? rawStatus
        : "ALL",

    sortBy:
      rawSortBy === "name" ||
      rawSortBy === "email"
        ? rawSortBy
        : "createdAt",

    sortOrder:
      rawSortOrder === "asc"
        ? "asc"
        : "desc",
  };
}

export function adminUserHref(
  filters: AdminUserFilters,
): string {
  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.role !== "ALL") {
    params.set("role", filters.role);
  }

  if (filters.status !== "ALL") {
    params.set("status", filters.status);
  }

  if (filters.sortBy !== "createdAt") {
    params.set("sortBy", filters.sortBy);
  }

  if (filters.sortOrder !== "desc") {
    params.set("sortOrder", filters.sortOrder);
  }

  const query = params.toString();

  return query
    ? `/admin/users?${query}`
    : "/admin/users";
}
