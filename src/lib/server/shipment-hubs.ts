
import "server-only";

import { z } from "zod";

import { apiResponseSchema } from "@/lib/api-schemas";
import { getServerConfig } from "@/lib/env";

const hubSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  code: z.string(),
  zoneId: z.number().int().positive(),
});

const hubsResponseSchema = apiResponseSchema(
  z.array(hubSchema),
);

export type ShipmentHub = z.infer<
  typeof hubSchema
>;

export async function getShipmentHubs(): Promise<
  ShipmentHub[]
> {
  const { backendApiUrl } = getServerConfig();

  const response = await fetch(
    `${backendApiUrl}/hubs`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
      redirect: "error",
      signal: AbortSignal.timeout(12_000),
    },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load available shipment hubs.",
    );
  }

  const parsed = hubsResponseSchema.safeParse(
    await response.json(),
  );

  if (!parsed.success) {
    throw new Error(
      "Unexpected hub information received.",
    );
  }

  return parsed.data.data;
}
