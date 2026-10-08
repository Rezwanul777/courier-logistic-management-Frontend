
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  LockKeyhole,
  BadgeDollarSign,
  Scale,
  Wallet,
} from "lucide-react";

import { PublicHeader } from "@/component/layout/public-header";
import { PublicFooter } from "@/component/layout/public-footer";

const title = "Courier Pricing & Shipping Quotes";
const description =
  "Understand how CourierFlow calculates shipping costs using delivery zones, parcel weight, and active rate cards.";

const canonicalUrl = process.env.SITE_URL
  ? new URL("/pricing", process.env.SITE_URL).toString()
  : undefined;

export const metadata: Metadata = {
  title,
  description,
  alternates: canonicalUrl
    ? { canonical: canonicalUrl }
    : undefined,
  openGraph: {
    title: `${title} | CourierFlow`,
    description,
    type: "website",
    url: canonicalUrl,
  },
};

const pricingFactors = [
  {
    title: "Weight band",
    description:
      "The matching weight range for your route.",
    icon: Scale,
  },
  {
    title: "Band price",
    description:
      "The amount defined by the matching active rate card.",
    icon: BadgeDollarSign,
  },
  {
    title: "Currency",
    description:
      "The currency defined on the active rate card.",
    icon: Wallet,
  },
] as const;

const fieldClassName =
  "h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 disabled:cursor-not-allowed";

const labelClassName =
  "mb-2 block text-sm font-medium text-[#102D46]";

function QuoteFormPreview() {
  return (
    <section
      aria-labelledby="quote-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="mb-7">
        <h2
          id="quote-heading"
          className="text-xl font-bold tracking-tight text-[#102D46]"
        >
          Estimate your shipment
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Sign in to access your available shipping routes
          and request a quote.
        </p>
      </div>

      <fieldset
        disabled
        aria-describedby="quote-notice"
        className="grid gap-x-5 gap-y-6 sm:grid-cols-2"
      >
        <div>
          <label
            htmlFor="origin-zone"
            className={labelClassName}
          >
            Origin zone
          </label>

          <select
            id="origin-zone"
            name="originZoneId"
            defaultValue=""
            className={fieldClassName}
          >
            <option value="">
              Select origin zone
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="destination-zone"
            className={labelClassName}
          >
            Destination zone
          </label>

          <select
            id="destination-zone"
            name="destinationZoneId"
            defaultValue=""
            className={fieldClassName}
          >
            <option value="">
              Select destination zone
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="parcel-weight"
            className={labelClassName}
          >
            Weight (kg)
          </label>

          <input
            id="parcel-weight"
            name="weight"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Enter parcel weight"
            className={fieldClassName}
          />
        </div>

        <div>
          <span className={labelClassName}>
            Currency
          </span>

          <div className="flex h-12 items-center rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
            Set by the active rate card
          </div>
        </div>
      </fieldset>

      <div className="mt-7">
        <Link
          href="/login"
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
        >
          <LockKeyhole
            aria-hidden="true"
            className="size-4"
          />

          Sign in to get a quote

          <ArrowRight
            aria-hidden="true"
            className="size-4"
          />
        </Link>
      </div>

      <p
        id="quote-notice"
        className="mt-5 text-sm leading-6 text-slate-500"
      >
        Available rate cards and quotes are managed
        through your CourierFlow account.
      </p>
    </section>
  );
}

function PricingExplanation() {
  return (
    <aside
      aria-labelledby="pricing-factors-heading"
      className="rounded-xl bg-[#F3F5F9] p-6 sm:p-8"
    >
      <h2
        id="pricing-factors-heading"
        className="text-xl font-bold tracking-tight text-[#102D46]"
      >
        What goes into your quote?
      </h2>

      <div className="mt-8 space-y-8">
        {pricingFactors.map((factor) => {
          const Icon = factor.icon;

          return (
            <div
              key={factor.title}
              className="flex items-start gap-4"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#E3F3EF] text-[#00877B]">
                <Icon
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#102D46]">
                  {factor.title}
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {factor.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-9 border-t border-slate-200 pt-6">
        <p className="text-sm leading-7 text-slate-600">
          You will review the final amount before
          opening Stripe Checkout.
        </p>
      </div>
    </aside>
  );
}

export default function PricingPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <section className="pt-14 pb-12 sm:pt-20 lg:pt-24">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00877B]">
              Know the cost
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-[#102D46] sm:text-5xl lg:text-[56px]">
              Your route. Your parcel.
              <span className="mt-2 block">
                A clear quote.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              Rates depend on the origin zone,
              destination zone, and shipment weight.
              Review the cost before payment.
            </p>
          </section>

          <section
            aria-label="Shipping quote information"
            className="grid items-start gap-6 pb-20 lg:grid-cols-[1.35fr_1fr] lg:gap-8 lg:pb-24"
          >
            <QuoteFormPreview />
            <PricingExplanation />
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
