/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import { useForm } from "@tanstack/react-form";
import { ArrowLeft, ArrowRight, Package } from "lucide-react";

import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";



import type { ShipmentHub } from "@/lib/server/shipment-hubs";
import { parcelRouteSchema, ParcelRouteValues } from "@/lib/shipment-draft.schema";

interface ParcelRouteStepProps {
  hubs: ShipmentHub[];
  initialValues: ParcelRouteValues;
  onBack: () => void;
  onContinue: (values: ParcelRouteValues) => void;
}

const inputStyles =
  "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15";

export function ParcelRouteStep({
  hubs,
  initialValues,
  onBack,
  onContinue,
}: ParcelRouteStepProps) {
  const form = useForm({
    defaultValues: initialValues,

    validators: {
      onBlur: parcelRouteSchema,
      onSubmit: parcelRouteSchema,
    },

    onSubmit: async ({ value }) => {
      const validated = parcelRouteSchema.parse(value);

      const availableIds = new Set(
        hubs.map((hub) => String(hub.id)),
      );

      if (
        !availableIds.has(validated.originHubId) ||
        !availableIds.has(validated.destinationHubId)
      ) {
        return;
      }

      onContinue(validated);
    },
  });

  const noHubsAvailable = hubs.length < 2;

  return (
    <section
      aria-labelledby="parcel-step-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F2] text-[#00877B]">
          <Package
            aria-hidden="true"
            className="size-5"
          />
        </div>

        <h2
          id="parcel-step-heading"
          className="text-xl font-bold tracking-tight text-[#102D46]"
        >
          Tell us about your parcel
        </h2>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">
        Select your delivery route and enter the
        actual parcel weight.
      </p>

      {noHubsAvailable && (
        <div
          role="status"
          className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"
        >
          At least two active hubs are needed to
          create a shipment. Please contact
          operations if your route is unavailable.
        </div>
      )}

      <form
        noValidate
        className="mt-8 space-y-7"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Subscribe
          selector={(state) => state.submissionAttempts}
        >
          {(attempts) => (
            <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
              <form.Field name="originHubId">
                {(field) => {
                  const invalid =
                    (field.state.meta.isTouched ||
                      attempts > 0) &&
                    !field.state.meta.isValid;

                  return (
                    <Field
                      data-invalid={invalid}
                      className="min-w-0 gap-2"
                    >
                      <FieldLabel
                        htmlFor="origin-hub"
                        className="text-sm font-medium text-[#102D46]"
                      >
                        Origin hub
                      </FieldLabel>

                      <select
                        id="origin-hub"
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value,
                          )
                        }
                        onBlur={field.handleBlur}
                        disabled={noHubsAvailable}
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid
                            ? "origin-hub-error"
                            : undefined
                        }
                        required
                        className={inputStyles}
                      >
                        <option value="">
                          Select origin hub
                        </option>

                        {hubs.map((hub) => (
                          <option
                            key={hub.id}
                            value={String(hub.id)}
                          >
                            {hub.name}
                          </option>
                        ))}
                      </select>

                      {invalid && (
                        <FieldError
                          id="origin-hub-error"
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="destinationHubId">
                {(field) => {
                  const invalid =
                    (field.state.meta.isTouched ||
                      attempts > 0) &&
                    !field.state.meta.isValid;

                  return (
                    <Field
                      data-invalid={invalid}
                      className="min-w-0 gap-2"
                    >
                      <FieldLabel
                        htmlFor="destination-hub"
                        className="text-sm font-medium text-[#102D46]"
                      >
                        Destination hub
                      </FieldLabel>

                      <select
                        id="destination-hub"
                        name={field.name}
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value,
                          )
                        }
                        onBlur={field.handleBlur}
                        disabled={noHubsAvailable}
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid
                            ? "destination-hub-error"
                            : undefined
                        }
                        required
                        className={inputStyles}
                      >
                        <option value="">
                          Select destination hub
                        </option>

                        {hubs.map((hub) => (
                          <option
                            key={hub.id}
                            value={String(hub.id)}
                          >
                            {hub.name}
                          </option>
                        ))}
                      </select>

                      {invalid && (
                        <FieldError
                          id="destination-hub-error"
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="weight">
                {(field) => {
                  const invalid =
                    (field.state.meta.isTouched ||
                      attempts > 0) &&
                    !field.state.meta.isValid;

                  return (
                    <Field
                      data-invalid={invalid}
                      className="min-w-0 gap-2"
                    >
                      <FieldLabel
                        htmlFor="parcel-weight"
                        className="text-sm font-medium text-[#102D46]"
                      >
                        Weight (kg)
                      </FieldLabel>

                      <Input
                        id="parcel-weight"
                        name={field.name}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="Enter weight in kg"
                        maxLength={16}
                        required
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value,
                          )
                        }
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid
                            ? "parcel-weight-error"
                            : "parcel-weight-hint"
                        }
                        className={inputStyles}
                      />

                      {invalid ? (
                        <FieldError
                          id="parcel-weight-error"
                          errors={field.state.meta.errors}
                        />
                      ) : (
                        <p
                          id="parcel-weight-hint"
                          className="text-xs text-slate-500"
                        >
                          Enter the actual weight in kilograms.
                        </p>
                      )}
                    </Field>
                  );
                }}
              </form.Field>

              <form.Field name="description">
                {(field) => {
                  const invalid =
                    (field.state.meta.isTouched ||
                      attempts > 0) &&
                    !field.state.meta.isValid;

                  return (
                    <Field
                      data-invalid={invalid}
                      className="min-w-0 gap-2"
                    >
                      <FieldLabel
                        htmlFor="parcel-description"
                        className="text-sm font-medium text-[#102D46]"
                      >
                        Parcel description
                        <span className="font-normal text-slate-400">
                          (optional)
                        </span>
                      </FieldLabel>

                      <Input
                        id="parcel-description"
                        name={field.name}
                        type="text"
                        placeholder="Documents & small parcel"
                        maxLength={500}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(
                            event.target.value,
                          )
                        }
                        aria-invalid={invalid}
                        aria-describedby={
                          invalid
                            ? "parcel-description-error"
                            : undefined
                        }
                        className={inputStyles}
                      />

                      {invalid && (
                        <FieldError
                          id="parcel-description-error"
                          errors={field.state.meta.errors}
                        />
                      )}
                    </Field>
                  );
                }}
              </form.Field>
            </div>
          )}
        </form.Subscribe>

        <div className="rounded-lg border border-[#C6E6DF] bg-[#F0FAF7] px-5 py-4">
          <p className="text-sm leading-7 text-[#155E53]">
            The selected route and parcel weight
            determine the shipping quote.
            The final amount must be calculated
            and verified by the backend.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
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

          <form.Subscribe
            selector={(state) => state.isSubmitting}
          >
            {(submitting) => (
              <button
                type="submit"
                disabled={
                  submitting || noHubsAvailable
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting
                  ? "Validating..."
                  : "Continue"}

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
