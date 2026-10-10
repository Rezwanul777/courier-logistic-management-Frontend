
"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";

import {
  ArrowLeft,
  ArrowRight,
  Check,

} from "lucide-react";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import {  initialPickupRecipientValues, pickupRecipientSchema, PickupRecipientValues } from "@/lib/shipment-draft.schema";


import { ParcelRouteStep } from "@/component/customer/shipment-parcel-route-step";

import {
  initialParcelRouteValues,
  type ParcelRouteValues,
} from "@/lib/shipment-draft.schema";

import type { ShipmentHub } from "@/lib/server/shipment-hubs";









// --------------------------------------
// Wizard stages
// --------------------------------------

const stages = [
  {
    number: "01",
    title: "Pickup & recipient",
  },
  {
    number: "02",
    title: "Parcel & route",
  },
  {
    number: "03",
    title: "Review & pay",
  },
] as const;

// --------------------------------------
// Form configuration
// --------------------------------------

const formGroups = [
  {
    title: "Pickup details",
    fields: [
      {
        name: "senderName",
        label: "Sender name",
        type: "text",
        placeholder: "Enter sender name",
        autoComplete: "name",
      },
      {
        name: "senderPhone",
        label: "Sender phone",
        type: "tel",
        placeholder: "Enter sender phone",
        autoComplete: "tel",
      },
      {
        name: "pickupAddress",
        label: "Pickup address",
        type: "text",
        placeholder: "House / road / area",
        autoComplete: "street-address",
      },
      {
        name: "pickupCity",
        label: "Pickup city",
        type: "text",
        placeholder: "Enter pickup city",
        autoComplete: "address-level2",
      },
    ],
  },
  {
    title: "Recipient details",
    fields: [
      {
        name: "recipientName",
        label: "Recipient name",
        type: "text",
        placeholder: "Enter recipient name",
        autoComplete: "off",
      },
      {
        name: "recipientPhone",
        label: "Recipient phone",
        type: "tel",
        placeholder: "Enter recipient phone",
        autoComplete: "off",
      },
      {
        name: "deliveryAddress",
        label: "Delivery address",
        type: "text",
        placeholder: "House / road / area",
        autoComplete: "off",
      },
      {
        name: "deliveryCity",
        label: "Delivery city",
        type: "text",
        placeholder: "Enter delivery city",
        autoComplete: "off",
      },
    ],
  },
] as const;

// --------------------------------------
// Progress indicator
// --------------------------------------

function WizardProgress({
  currentStep,
}: {
  currentStep: 1 | 2 |3;
}) {
  return (
    <nav aria-label="Shipment creation progress">
      <ol className="grid gap-3 sm:grid-cols-3">
        {stages.map((stage, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <li key={stage.number}>
              <div
                aria-current={
                  isActive ? "step" : undefined
                }
                className={
                  isActive || isCompleted
                    ? "flex min-h-14 items-center gap-3 rounded-lg border border-[#C6E6DF] bg-[#E8F5F2] px-4 text-[#00877B]"
                    : "flex min-h-14 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-slate-500"
                }
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-current/30 text-xs font-bold">
                  {isCompleted ? (
                    <Check
                      aria-hidden="true"
                      className="size-4"
                    />
                  ) : (
                    stage.number
                  )}
                </span>

                <span className="text-xs font-semibold sm:text-sm">
                  {stage.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// --------------------------------------
// Step 1: Pickup & recipient
// --------------------------------------

function PickupRecipientStep({
  initialValues,
  onContinue,
}: {
  initialValues: PickupRecipientValues;
  onContinue: (values: PickupRecipientValues) => void;
}) {
  const form = useForm({
    defaultValues: initialValues,

    validators: {
      onBlur: pickupRecipientSchema,
      onSubmit: pickupRecipientSchema,
    },

    onSubmit: async ({ value }) => {
      const validated =
        pickupRecipientSchema.parse(value);

      onContinue(validated);
    },
  });

  return (
    <section
      aria-labelledby="pickup-form-title"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
    >
      <h2
        id="pickup-form-title"
        className="text-xl font-bold tracking-tight text-[#102D46]"
      >
        Where should we collect and deliver?
      </h2>

      <p className="mt-2 text-sm leading-7 text-slate-500">
        Provide accurate pickup and recipient information
        to help couriers complete the delivery.
      </p>

      <form
        noValidate
        className="mt-8"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Subscribe
          selector={(state) => state.submissionAttempts}
        >
          {(submissionAttempts) => (
            <div className="space-y-9">
              {formGroups.map((group) => (
                <fieldset
                  key={group.title}
                  className="space-y-5"
                >
                  <legend className="mb-5 text-base font-semibold text-[#102D46]">
                    {group.title}
                  </legend>

                  <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
                    {group.fields.map((config) => (
                      <form.Field
                        key={config.name}
                        name={config.name}
                      >
                        {(field) => {
                          const invalid =
                            (field.state.meta.isTouched ||
                              submissionAttempts > 0) &&
                            !field.state.meta.isValid;

                          return (
                            <Field
                              data-invalid={invalid}
                              className="min-w-0 gap-2"
                            >
                              <FieldLabel
                                htmlFor={config.name}
                                className="text-sm font-medium text-[#102D46]"
                              >
                                {config.label}
                              </FieldLabel>

                              <Input
                                id={config.name}
                                name={field.name}
                                type={config.type}
                                autoComplete={
                                  config.autoComplete
                                }
                                placeholder={
                                  config.placeholder
                                }
                                required
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(event) => {
                                  field.handleChange(
                                    event.target.value,
                                  );
                                }}
                                aria-invalid={invalid}
                                aria-describedby={
                                  invalid
                                    ? `${config.name}-error`
                                    : undefined
                                }
                                className="h-12 rounded-lg border-slate-200 bg-white px-4 text-sm focus-visible:border-[#00877B] focus-visible:ring-[#00877B]/15"
                              />

                              {invalid && (
                                <FieldError
                                  id={`${config.name}-error`}
                                  errors={
                                    field.state.meta.errors
                                  }
                                />
                              )}
                            </Field>
                          );
                        }}
                      </form.Field>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
          )}
        </form.Subscribe>

        <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/customer/shipments"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-6 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50"
          >
            Cancel
          </Link>

          <form.Subscribe
            selector={(state) => state.isSubmitting}
          >
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] disabled:cursor-wait disabled:opacity-60"
              >
                Continue

                <ArrowRight
                  aria-hidden="true"
                  className="size-4"
                />
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </section>
  );
}

// --------------------------------------
// Step 2 transition
// The parcel form will be added in Step 26.
// --------------------------------------

interface ReviewStepPreviewProps {
  pickup: PickupRecipientValues;
  parcel: ParcelRouteValues;
  hubs: ShipmentHub[];
  onBack: () => void;
}

function ReviewStepPreview({
  pickup,
  parcel,
  hubs,
  onBack,
}: ReviewStepPreviewProps) {
  const origin = hubs.find(
    (hub) =>
      String(hub.id) === parcel.originHubId,
  );

  const destination = hubs.find(
    (hub) =>
      String(hub.id) === parcel.destinationHubId,
  );

  const summary = [
    {
      label: "Pickup",
      value: `${pickup.pickupAddress}, ${pickup.pickupCity}`,
    },
    {
      label: "Recipient",
      value: `${pickup.deliveryAddress}, ${pickup.deliveryCity}`,
    },
    {
      label: "Route",
      value: `${origin?.name ?? "Unavailable"} → ${destination?.name ?? "Unavailable"}`,
    },
    {
      label: "Parcel",
      value: `${parcel.description || "No description"} · ${parcel.weight} kg`,
    },
  ];

  return (
    <section
      aria-labelledby="shipment-review-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
    >
      <h2
        id="shipment-review-heading"
        className="text-xl font-bold text-[#102D46]"
      >
        Review before you pay
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Review the information you entered before
        requesting a shipping quote.
      </p>

      <dl className="mt-8 grid gap-7 lg:grid-cols-2">
        {summary.map((item) => (
          <div
            key={item.label}
            className="space-y-2"
          >
            <dt className="text-sm font-semibold text-slate-500">
              {item.label}
            </dt>

            <dd className="break-words text-sm leading-7 text-[#102D46]">
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-sm font-semibold text-amber-900">
          Shipping quote not available yet
        </h3>

        <p className="mt-2 text-sm leading-7 text-amber-800">
          Your shipment information is ready
          for review. Checkout will be enabled
          after server-side rate calculation
          is implemented.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-6 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50"
        >
          <ArrowLeft
            aria-hidden="true"
            className="size-4"
          />

          Back
        </button>

        <button
          type="button"
          disabled
          title="Secure shipping quote is not implemented yet"
          className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white opacity-60"
        >
          Continue to Stripe
        </button>
      </div>
    </section>
  );
}



export function CreateShipmentWizard({
  hubs,
}: {
  hubs: ShipmentHub[];
}) {
  const [currentStep, setCurrentStep] =
    useState<1 | 2 | 3>(1);

  const [pickupDetails, setPickupDetails] =
    useState<PickupRecipientValues>(
      initialPickupRecipientValues,
    );

  const [parcelDetails, setParcelDetails] =
    useState<ParcelRouteValues>(
      initialParcelRouteValues,
    );

  function continueFromPickup(
    values: PickupRecipientValues,
  ) {
    setPickupDetails(values);
    setCurrentStep(2);
  }

  function continueFromParcel(
    values: ParcelRouteValues,
  ) {
    setParcelDetails(values);
    setCurrentStep(3);
  }

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-[#102D46]">
          Create shipment · Step {currentStep}
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          A clear view of your shipments,
          from pickup to delivery.
        </p>
      </header>

      <WizardProgress currentStep={currentStep} />

      {currentStep === 1 ? (
        <PickupRecipientStep
          initialValues={pickupDetails}
          onContinue={continueFromPickup}
        />
      ) : currentStep === 2 ? (
        <ParcelRouteStep
          hubs={hubs}
          initialValues={parcelDetails}
          onBack={() => setCurrentStep(1)}
          onContinue={continueFromParcel}
        />
      ) : (
        <ReviewStepPreview
          pickup={pickupDetails}
          parcel={parcelDetails}
          hubs={hubs}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </div>
  );
}





