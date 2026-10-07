export interface ListParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  sort: string;
}

/**
 * Scope private records by authenticated user ID.
 * The auth step must also cancel and clear all queries on logout/account switch.
 */
export const queryKeys = {
  session: ["session"] as const,
  shipments: {
    all: (userId: number) => ["shipments", userId] as const,
    list: (userId: number, params: ListParams) =>
      ["shipments", userId, "list", params] as const,
    detail: (userId: number, id: number) =>
      ["shipments", userId, "detail", id] as const,
    tracking: (userId: number, id: number) =>
      ["shipments", userId, "tracking", id] as const,
  },
  payments: {
    all: (userId: number) => ["payments", userId] as const,
    shipment: (userId: number, id: number) =>
      ["payments", userId, "shipment", id] as const,
  },
  tasks: {
    all: (userId: number) => ["tasks", userId] as const,
    list: (userId: number, params: ListParams) =>
      ["tasks", userId, "list", params] as const,
  },
  resources: {
    all: (
      userId: number,
      name: "users" | "couriers" | "hubs" | "zones" | "rates" | "audit-logs",
    ) => ["resources", userId, name] as const,
    list: (userId: number, name: string, params: ListParams) =>
      ["resources", userId, name, "list", params] as const,
  },
};
