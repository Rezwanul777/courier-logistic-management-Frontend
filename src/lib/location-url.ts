
export interface LocationFilters {
  page: number;
  search: string;
}

export function locationUrl(
  kind: "hubs" | "zones",
  filters: LocationFilters,
): string {
  const base =
    kind === "hubs"
      ? "/admin/hubs"
      : "/admin/hubs/zones";

  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set("page", String(filters.page));
  }

  if (filters.search) {
    params.set("search", filters.search);
  }

  const query = params.toString();

  return query ? `${base}?${query}` : base;
}
