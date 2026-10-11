
import { z } from "zod";

import { apiRequest } from "@/lib/apiClient";

import {
  parcelRouteSchema,
  pickupRecipientSchema,
  type ParcelRouteValues,
  type PickupRecipientValues,
} from "@/lib/shipment-draft.schema";

import type { ShippingQuote } from "@/lib/shipment-quote";

// -------------------------------------------
// Response validation
// -------------------------------------------

const createdShipmentSchema = z.object({
  id: z.number().int().positive(),
  trackingCode: z.string().min(1),
  status: z.literal("DRAFT"),
});

const checkoutSessionSchema = z.object({
  checkoutUrl: z.url(),
  sessionId: z.string().min(1),
});

export type CreatedShipment = z.infer<
  typeof createdShipmentSchema
>;

interface CreateShipmentInput {
  pickup: PickupRecipientValues;
  parcel: ParcelRouteValues;
  quote: ShippingQuote;
}

// -------------------------------------------
// Create a real draft shipment
// -------------------------------------------

export async function createCustomerShipment({
  pickup,
  parcel,
  quote,
}: CreateShipmentInput): Promise<CreatedShipment> {
  const sender = pickupRecipientSchema.parse(pickup);
  const route = parcelRouteSchema.parse(parcel);

  const originHubId = Number(route.originHubId);

  const destinationHubId = Number(
    route.destinationHubId,
  );

  const weight = Number(route.weight);

  // Prevent accidentally submitting a quote
  // belonging to a different route or weight.
  if (
    quote.originHubId !== originHubId ||
    quote.destinationHubId !== destinationHubId ||
    quote.weight !== weight
  ) {
    throw new Error(
      "Shipment information and quote do not match.",
    );
  }

  const response = await apiRequest(
    "/shipments",
    createdShipmentSchema,
    {
      method: "POST",

      body: {
        originHubId,
        destinationHubId,
        weight,

        ...(route.description
          ? { description: route.description.trim() }
          : {}),

        pickupAddress: {
          senderName: sender.senderName,
          senderPhone: sender.senderPhone,
          address: sender.pickupAddress,
          city: sender.pickupCity,
        },

        recipient: {
          name: sender.recipientName,
          phone: sender.recipientPhone,
          address: sender.deliveryAddress,
          city: sender.deliveryCity,
        },

        // This confirms the customer's quote.
        // The backend MUST recalculate and verify
        // the amount. The client never sets price.
        quoteConfirmation: {
          rateCardId: quote.rateCardId,
          amountMinor: quote.amountMinor,
          currency: quote.currency,
        },
      },
    },
  );

  return response.data;
}

// -------------------------------------------
// Create or reuse a Stripe Checkout session
// -------------------------------------------

export async function createCheckoutSession(
  shipmentId: number,
): Promise<string> {
  if (
    !Number.isSafeInteger(shipmentId) ||
    shipmentId <= 0
  ) {
    throw new Error("Invalid shipment ID.");
  }

  const response = await apiRequest(
    "/payments/checkout",
    checkoutSessionSchema,
    {
      method: "POST",

      body: {
        shipmentId,
      },
    },
  );

  const url = new URL(
    response.data.checkoutUrl,
  );

  // Accept only genuine Stripe Checkout URLs.
  if (
    url.protocol !== "https:" ||
    url.hostname !== "checkout.stripe.com"
  ) {
    throw new Error(
      "The payment service returned an invalid checkout URL.",
    );
  }

  return url.toString();
}
