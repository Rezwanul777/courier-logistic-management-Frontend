
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  MapPinned,
  PackagePlus,
  Truck,
} from "lucide-react";

import { PublicHeader } from "@/component/layout/public-header";
import { PublicFooter } from "@/component/layout/public-footer";

const pageTitle = "Courier Services | CourierFlow";

const pageDescription =
  "Book courier shipments, track delivery milestones, and manage logistics operations with CourierFlow.";

const canonicalUrl = process.env.SITE_URL
  ? new URL("/services", process.env.SITE_URL).toString()
  : undefined;

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  alternates: canonicalUrl
    ? { canonical: canonicalUrl }
    : undefined,
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: canonicalUrl,
  },
};

const services = [
  {
    title: "Parcel booking",
    description:
      "Set the pickup, recipient, hubs, and parcel weight.",
    icon: PackagePlus,
    href: "/login",
  },
  {
    title: "Shipment tracking",
    description:
      "View the recorded status and milestone history.",
    icon: MapPinned,
    href: "/login",
  },
  {
    title: "Courier coordination",
    description:
      "Assign pickup and delivery tasks to couriers.",
    icon: Truck,
    href: "/login",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Add your parcel",
    description:
      "Pickup details, recipient information, and delivery route.",
  },
  {
    number: "02",
    title: "Review & pay",
    description:
      "Check the booking and complete Stripe Checkout.",
  },
  {
    number: "03",
    title: "Follow the journey",
    description:
      "Track recorded events until delivery is confirmed.",
  },
] as const;

export default function ServicesPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <section
            aria-labelledby="services-title"
            className="pt-14 pb-12 sm:pt-20 lg:pt-24"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00877B]">
              What you can do
            </p>

            <h1
              id="services-title"
              className="mt-5 max-w-3xl text-4xl font-bold leading-[1.15] tracking-tight text-[#102D46] sm:text-5xl lg:text-[56px]"
            >
              From booking to doorstep.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
              A connected set of tools for sending
              parcels and managing courier operations.
            </p>
          </section>

          <section
            aria-label="Courier services"
            className="pb-14 sm:pb-20"
          >
            <div className="grid gap-5 md:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title}
                    className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-[#A5D3CA] sm:p-7"
                  >
                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#E8F5F2] text-[#00877B]">
                      <Icon
                        aria-hidden="true"
                        className="size-6"
                        strokeWidth={1.8}
                      />
                    </div>

                    <h2 className="mt-6 text-xl font-semibold tracking-tight text-[#102D46]">
                      {service.title}
                    </h2>

                    <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
                      {service.description}
                    </p>

                    <Link
                      href={service.href}
                      className="mt-7 inline-flex h-10 w-fit items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
                    >
                      Get started

                      <ArrowRight
                        aria-hidden="true"
                        className="size-4"
                      />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            aria-labelledby="steps-title"
            className="pb-20 sm:pb-24"
          >
            <div className="rounded-2xl bg-[#F3F5F9] p-6 sm:p-9 lg:p-12">
              <div className="flex items-center gap-3">
                <ClipboardCheck
                  aria-hidden="true"
                  className="size-6 text-[#00877B]"
                />

                <h2
                  id="steps-title"
                  className="text-2xl font-bold tracking-tight text-[#102D46] sm:text-3xl"
                >
                  Send in three clear steps
                </h2>
              </div>

              <ol className="mt-9 grid gap-4">
                {steps.map((step) => (
                  <li
                    key={step.number}
                    className="flex items-start gap-5 rounded-xl border border-slate-200 bg-white p-5 sm:gap-7 sm:p-6"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-2xl font-bold text-[#00877B] sm:text-3xl"
                    >
                      {step.number}
                    </span>

                    <div>
                      <h3 className="text-lg font-semibold text-[#102D46]">
                        {step.title}
                      </h3>

                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {step.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#006F66] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B]"
                >
                  Start sending

                  <ArrowRight
                    aria-hidden="true"
                    className="size-4"
                  />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
