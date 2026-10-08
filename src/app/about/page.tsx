
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import { PublicHeader } from "@/component/layout/public-header";
import { PublicFooter } from "@/component/layout/public-footer";

const title = "About CourierFlow";
const description =
  "Learn how CourierFlow brings customers, couriers, and logistics operations together through clear shipment tracking, secure payments, and accountable delivery workflows.";

const canonicalUrl = process.env.SITE_URL
  ? new URL("/about", process.env.SITE_URL).toString()
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
    siteName: "CourierFlow",
  },
  twitter: {
    card: "summary",
    title: `${title} | CourierFlow`,
    description,
  },
};

const benefits = [
  {
    title: "Visibility at every step",
    description:
      "See each recorded pickup, hub transfer, and delivery event.",
    icon: PackageCheck,
  },
  {
    title: "Accountability by role",
    description:
      "Customers manage bookings. Couriers complete tasks. Admins coordinate operations.",
    icon: ShieldCheck,
  },
  {
    title: "Payments you can verify",
    description:
      "Secure checkout and verified payment records keep bookings moving.",
    icon: CreditCard,
  },
] as const;

const journeySteps = [
  "Book",
  "Pay",
  "Pickup",
  "Hub transfer",
  "Delivery",
] as const;

function PurposeSection() {
  return (
    <section
      aria-labelledby="about-heading"
      className="pt-14 pb-12 sm:pt-20 lg:pt-24"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00877B]">
        Our purpose
      </p>

      <h1
        id="about-heading"
        className="mt-6 max-w-4xl text-4xl font-bold leading-[1.15] tracking-tight text-[#102D46] sm:text-5xl lg:text-[56px]"
      >
        Less uncertainty.
        <span className="mt-2 block">
          More delivery clarity.
        </span>
      </h1>

      <p className="mt-7 max-w-3xl text-base leading-8 text-slate-600">
        CourierFlow brings customers, couriers, and
        operations together through a shared shipment
        journey.
      </p>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section
      aria-label="Why CourierFlow"
      className="pb-14 sm:pb-20"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;

          return (
            <article
              key={benefit.title}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#A5D3CA] sm:p-7"
            >
              <div className="flex size-12 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
                <Icon
                  aria-hidden="true"
                  className="size-6"
                  strokeWidth={1.8}
                />
              </div>

              <h2 className="mt-6 text-lg font-semibold tracking-tight text-[#102D46]">
                {benefit.title}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                {benefit.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function JourneySection() {
  return (
    <section
      aria-labelledby="journey-heading"
      className="pb-20 sm:pb-24"
    >
      <div className="rounded-2xl bg-[#F3F5F9] p-6 sm:p-9 lg:p-12">
        <div className="flex items-center gap-3">
          <CheckCircle2
            aria-hidden="true"
            className="size-6 text-[#00877B]"
          />

          <h2
            id="journey-heading"
            className="text-2xl font-bold tracking-tight text-[#102D46] sm:text-3xl"
          >
            One shared journey
          </h2>
        </div>

        <ol className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-4">
          {journeySteps.map((step, index) => (
            <li
              key={step}
              className="flex items-center gap-3"
            >
              <span className="inline-flex min-h-10 items-center rounded-lg border border-[#C6E6DF] bg-white px-4 py-2 text-sm font-semibold text-[#102D46]">
                {step}
              </span>

              {index < journeySteps.length - 1 && (
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-[#00877B]"
                />
              )}
            </li>
          ))}
        </ol>

        <p className="mt-7 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          Clear actions for each role. A traceable
          event at each milestone.
        </p>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
          >
            Start sending

            <ArrowUpRight
              aria-hidden="true"
              className="size-4"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <PurposeSection />

          <BenefitsSection />

          <JourneySection />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
