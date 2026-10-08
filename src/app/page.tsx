
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  LayoutGrid,
  Package,
  Truck,
} from "lucide-react";

import { PublicHeader } from "@/component/layout/public-header";

export const metadata: Metadata = {
  title: "Courier & Logistics Platform",
  description:
    "Book a pickup, pay securely, and follow your shipment from the first hub to the final doorstep.",
};

const features = [
  {
    title: "Send with confidence",
    description:
      "Book, pay, and track from one simple workspace.",
    icon: Package,
  },
  {
    title: "Know your next task",
    description:
      "Accept assignments and confirm pickup or delivery.",
    icon: Truck,
  },
  {
    title: "Keep parcels moving",
    description:
      "Coordinate couriers, hubs, zones, and shipments.",
    icon: LayoutGrid,
  },
] as const;

function ShipmentIllustration() {
  return (
    <div className="rounded-xl bg-[#F3F5F9] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#00877B]">
        Your parcel, in focus
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold tracking-tight text-[#102D46] sm:text-2xl">
          CF-2026-00842
        </h2>

        <span className="rounded-md bg-[#E4EFFB] px-2.5 py-1 text-xs font-medium text-[#3D76AD]">
          In transit
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-[#102D46] sm:text-3xl">
        Dhaka → Sylhet
      </p>

      <div className="mt-6 overflow-hidden rounded-lg bg-[#E4F4F0]">
        <svg
          viewBox="0 0 480 160"
          className="h-auto w-full"
          role="img"
          aria-label="Illustrative shipment route with three tracking milestones"
        >
          <defs>
            <pattern
              id="courier-grid"
              width="60"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 60 0 L 0 0 0 40"
                fill="none"
                stroke="#A8CDC5"
                strokeWidth="1"
              />
            </pattern>
          </defs>

          <rect
            width="480"
            height="160"
            fill="#E4F4F0"
          />

          <rect
            width="480"
            height="160"
            fill="url(#courier-grid)"
          />

          <path
            d="M 68 118
               C 126 117, 155 50, 226 51
               S 328 113, 408 41"
            fill="none"
            stroke="#00877B"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="2 9"
          />

          <circle
            cx="68"
            cy="118"
            r="9"
            fill="#00877B"
          />

          <circle
            cx="226"
            cy="51"
            r="10"
            fill="#00877B"
          />

          <circle
            cx="408"
            cy="41"
            r="9"
            fill="#102D46"
          />
        </svg>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          "01 Picked up",
          "02 In transit",
          "03 Delivered",
        ].map((step) => (
          <span
            key={step}
            className="text-[11px] font-medium text-[#00877B] sm:text-xs"
          >
            {step}
          </span>
        ))}
      </div>

      <p className="mt-5 text-sm text-slate-500">
        Shipment milestones, without the guesswork.
      </p>

      <p className="mt-2 text-xs text-slate-400">
        Illustrative shipment preview
      </p>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="grid items-center gap-12 py-14 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00877B]">
          Courier & logistics platform
        </p>

        <h1 className="mt-7 max-w-xl text-4xl font-bold leading-[1.18] tracking-tight text-[#102D46] sm:text-5xl lg:text-[56px]">
          Every parcel.
          <span className="mt-2 block">
            One clear journey.
          </span>
        </h1>

        <p className="mt-7 max-w-lg text-base leading-8 text-slate-600">
          Book a pickup, pay securely, and follow your
          shipment from the first hub to the final
          doorstep.
        </p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
          >
            Create a shipment
            <ArrowRight
              aria-hidden="true"
              className="size-4"
            />
          </Link>

          <Link
            href="#track-shipment"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
          >
            Track my parcel
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {[
            "Secure Stripe checkout",
            "Every milestone visible",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-xs text-slate-500 sm:text-sm"
            >
              <Check
                aria-hidden="true"
                className="size-4 text-[#00877B]"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <ShipmentIllustration />
    </section>
  );
}

function TrackingSection() {
  return (
    <section
      id="track-shipment"
      aria-labelledby="tracking-heading"
      className="scroll-mt-8 rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2
        id="tracking-heading"
        className="text-xl font-bold text-[#102D46]"
      >
        Already sent a parcel?
      </h2>

      <form
        action="/login"
        method="get"
        className="mt-5 flex flex-col gap-3 sm:flex-row"
      >
        <div className="flex-1">
          <label
            htmlFor="tracking-code"
            className="sr-only"
          >
            Tracking code
          </label>

          <input
            id="tracking-code"
            name="trackingCode"
            type="text"
            required
            maxLength={64}
            autoComplete="off"
            placeholder="Enter your tracking code"
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none transition-colors placeholder:text-slate-400 focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-[#00877B]/15"
          />
        </div>

        <button
          type="submit"
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg bg-[#00877B] px-7 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
        >
          Track shipment
        </button>
      </form>

      <p className="mt-3 text-sm text-slate-500">
        Sign in to securely view your shipment and its
        tracking history.
      </p>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section
      aria-labelledby="features-heading"
      className="py-14 md:py-20"
    >
      <h2
        id="features-heading"
        className="text-2xl font-bold tracking-tight text-[#102D46] sm:text-3xl"
      >
        Built for every side of delivery
      </h2>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {features.map((feature) => {
          const Icon = feature.icon;

          return (
            <article
              key={feature.title}
              className="rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#B9DCD6]"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#E8F5F2] text-[#00877B]">
                <Icon
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.8}
                />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-[#102D46]">
                {feature.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {feature.description}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-[#102D46] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
        >
          ↗ CourierFlow
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
          <span>Shipments with clarity.</span>

          <Link
            href="/services"
            className="hover:text-white"
          >
            Services
          </Link>

          <Link
            href="/pricing"
            className="hover:text-white"
          >
            Pricing
          </Link>

          <Link
            href="/contact"
            className="hover:text-white"
          >
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <HeroSection />
          <TrackingSection />
          <FeaturesSection />
        </div>
      </main>

      <PublicFooter />
    </>
  );
}

