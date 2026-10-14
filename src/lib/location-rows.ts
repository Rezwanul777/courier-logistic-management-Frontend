

import type {
  AdminHub,
  AdminZone,
} from "@/lib/server/admin-location";

export interface LocationRow {
  id: number;
  code: string;
  name: string;
  address: string | null;
  zoneName: string | null;
  zoneId: number | null;
}

export function toLocationRows(
  items: AdminHub[] | AdminZone[],
): LocationRow[] {
  return items.map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,

    address:
      "address" in item
        ? item.address
        : null,

    zoneName:
      "zone" in item
        ? item.zone.name
        : null,

    zoneId:
      "zoneId" in item
        ? item.zoneId
        : null,
  }));
}
