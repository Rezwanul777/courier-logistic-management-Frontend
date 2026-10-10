
import { z } from "zod";

const personNameSchema = z
  .string()
  .trim()
  .min(2, "Enter at least 2 characters.")
  .max(100, "Name must not exceed 100 characters.");

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number.")
  .max(25, "Phone number is too long.")
  .regex(
    /^\+?[0-9()\s-]+$/,
    "Use a valid phone number.",
  )
  .refine(
    (value) =>
      (value.match(/\d/g) ?? []).length >= 7,
    "Phone number must contain at least 7 digits.",
  );

const addressSchema = z
  .string()
  .trim()
  .min(8, "Enter a complete address.")
  .max(300, "Address is too long.");

const citySchema = z
  .string()
  .trim()
  .min(2, "Enter a city.")
  .max(80, "City name is too long.");

export const pickupRecipientSchema = z.object({
  senderName: personNameSchema,
  senderPhone: phoneSchema,
  pickupAddress: addressSchema,
  pickupCity: citySchema,

  recipientName: personNameSchema,
  recipientPhone: phoneSchema,
  deliveryAddress: addressSchema,
  deliveryCity: citySchema,
});

export type PickupRecipientValues = z.infer<
  typeof pickupRecipientSchema
>;

export const initialPickupRecipientValues: PickupRecipientValues = {
  senderName: "",
  senderPhone: "",
  pickupAddress: "",
  pickupCity: "",

  recipientName: "",
  recipientPhone: "",
  deliveryAddress: "",
  deliveryCity: "",
};


const hubIdSchema = z
  .string()
  .regex(
    /^[1-9]\d*$/,
    "Please select a valid hub.",
  );

export const parcelRouteSchema = z
  .object({
    originHubId: hubIdSchema,
    destinationHubId: hubIdSchema,

    weight: z
      .string()
      .trim()
      .regex(
        /^\d+(\.\d{1,3})?$/,
        "Enter a valid weight in kilograms.",
      )
      .refine(
        (value) =>
          Number.isFinite(Number(value)) &&
          Number(value) > 0,
        "Weight must be greater than zero.",
      ),

    description: z
      .string()
      .trim()
      .max(
        500,
        "Description cannot exceed 500 characters.",
      ),
  })
  .refine(
    (values) =>
      values.originHubId !==
      values.destinationHubId,
    {
      path: ["destinationHubId"],
      message:
        "Origin and destination hubs must be different.",
    },
  );

export type ParcelRouteValues = z.infer<
  typeof parcelRouteSchema
>;

export const initialParcelRouteValues: ParcelRouteValues = {
  originHubId: "",
  destinationHubId: "",
  weight: "",
  description: "",
};

