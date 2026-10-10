
import { z } from "zod";

import { apiRequest } from "@/lib/apiClient";

import type {
  ParcelRouteValues,
} from "@/lib/shipment-draft.schema";

export const shippingQuoteSchema = z.object({
  originHubId: z.number().int().positive(),
  destinationHubId: z.number().int().positive(),

  originZoneId: z.number().int().positive(),
  destinationZoneId: z.number().int().positive(),

  weight: z.number().finite().positive(),

  rateCardId: z.number().int().positive(),
  rateCardVersion: z.number().int().positive(),

  amountMinor: z.number().int().positive(),

  currency: z
    .string()
    .regex(/^[A-Z]{3}$/),
});

export type ShippingQuote = z.infer<
  typeof shippingQuoteSchema
>;

export async function requestShipmentQuote(
  parcel: ParcelRouteValues,
): Promise<ShippingQuote> {
  const response = await apiRequest(
    "/shipments/quote",
    shippingQuoteSchema,
    {
      method: "POST",

      body: {
        originHubId: Number(parcel.originHubId),
        destinationHubId: Number(
          parcel.destinationHubId,
        ),
        weight: Number(parcel.weight),
      },
    },
  );

  return response.data;
}
