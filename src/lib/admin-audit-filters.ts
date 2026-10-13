
export interface AdminAuditFilters {
  page: number;
  actorId: number | null;
  entityId: number | null;
  entityType: string;
  action: string;
  from: string;
  to: string;
}

export type AdminAuditSearchParams = Record<
  string,
  string | string[] | undefined
>;

function single(
  value: string | string[] | undefined,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function positiveId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) &&
    id <= 2147483647
    ? id
    : null;
}

function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

export function parseAdminAuditFilters(
  params: AdminAuditSearchParams,
): AdminAuditFilters {
  const rawPage = positiveId(
    single(params.page),
  );

  const rawType = single(params.entityType);

  const entityType =
    /^[A-Za-z][A-Za-z0-9_]{0,59}$/.test(rawType)
      ? rawType
      : "";

  const rawAction = single(
    params.action,
  ).toUpperCase();

  const action =
    /^[A-Z0-9_]{2,80}$/.test(rawAction)
      ? rawAction
      : "";

  const rawFrom = single(params.from);
  const rawTo = single(params.to);

  const from = validDay(rawFrom)
    ? rawFrom
    : "";

  const to = validDay(rawTo)
    ? rawTo
    : "";

  return {
    page: Math.min(rawPage ?? 1, 100000),

    actorId: positiveId(
      single(params.actorId),
    ),

    entityId: positiveId(
      single(params.entityId),
    ),

    entityType,
    action,

    from,
    to: from && to && to < from
      ? ""
      : to,
  };
}

export function adminAuditHref(
  filters: AdminAuditFilters,
): string {
  const params = new URLSearchParams();

  if (filters.page > 1) {
    params.set(
      "page",
      String(filters.page),
    );
  }

  if (filters.actorId !== null) {
    params.set(
      "actorId",
      String(filters.actorId),
    );
  }

  if (filters.entityId !== null) {
    params.set(
      "entityId",
      String(filters.entityId),
    );
  }

  if (filters.entityType) {
    params.set(
      "entityType",
      filters.entityType,
    );
  }

  if (filters.action) {
    params.set(
      "action",
      filters.action,
    );
  }

  if (filters.from) {
    params.set("from", filters.from);
  }

  if (filters.to) {
    params.set("to", filters.to);
  }

  const query = params.toString();

  return query
    ? `/admin/audit-logs?${query}`
    : "/admin/audit-logs";
}
