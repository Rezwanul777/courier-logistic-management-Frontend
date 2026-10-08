/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  CreditCard,
  PackageSearch,
  Truck,
} from "lucide-react";

import { PublicHeader } from "@/component/layout/public-header";
import { PublicFooter } from "@/component/layout/public-footer";

const title = "Contact & Delivery Help";
const description =
  "Find answers about CourierFlow shipments, payments, tracking, and courier deliveries.";

const canonicalUrl = process.env.SITE_URL
  ? new URL("/contact", process.env.SITE_URL).toString()
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

const faqs = [
  {
    question: "Where is my parcel?",
    answer:
      "Open My shipments and select a booking to see its latest recorded milestone.",
    icon: PackageSearch,
  },
  {
    question: "My payment is still pending",
    answer:
      "Return to the booking and refresh its payment status. Confirmation follows payment verification.",
    icon: CreditCard,
  },
  {
    question: "Who can change a delivery task?",
    answer:
      "Couriers update assigned tasks. Admins manage courier assignment and hub transfers.",
    icon: Truck,
  },
] as const;

function HelpSection() {
  return (
    <section
      aria-labelledby="help-title"
      className="pt-14 pb-12 sm:pt-20 lg:pt-24"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00877B]">
        Delivery help
      </p>

      <h1
        id="help-title"
        className="mt-6 max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight text-[#102D46] sm:text-5xl lg:text-[56px]"
      >
        Let&apos;s get your parcel
        <span className="mt-2 block">
          moving again.
        </span>
      </h1>

      <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
        Find guidance for your booking, payment,
        or shipment tracking.
      </p>
    </section>
  );
}

function FrequentlyAskedQuestions() {
  return (
    <section
      aria-label="Frequently asked questions"
      className="space-y-5"
    >
      {faqs.map((faq) => {
        const Icon = faq.icon;

        return (
          <article
            key={faq.question}
            className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#E8F5F2] text-[#00877B]">
                <Icon
                  aria-hidden="true"
                  className="size-5"
                  strokeWidth={1.8}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#102D46]">
                  {faq.question}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ContactFormPreview() {
  return (
    <section
      aria-labelledby="contact-heading"
      className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-lg bg-[#E8F5F2] text-[#00877B]">
          <CircleHelp
            aria-hidden="true"
            className="size-5"
          />
        </div>

        <h2
          id="contact-heading"
          className="text-xl font-bold tracking-tight text-[#102D46]"
        >
          Contact operations
        </h2>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">
        This contact form will be available once
        message delivery is connected.
      </p>

      <fieldset
        disabled
        className="mt-7 flex flex-col gap-6"
        aria-describedby="contact-status"
      >
        <div>
          <label
            htmlFor="contact-email"
            className="mb-2 block text-sm font-medium text-[#102D46]"
          >
            Your email
          </label>

          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="contact-tracking"
            className="mb-2 block text-sm font-medium text-[#102D46]"
          >
            Tracking code{" "}
            <span className="font-normal text-slate-400">
              (optional)
            </span>
          </label>

          <input
            id="contact-tracking"
            name="trackingCode"
            type="text"
            autoComplete="off"
            placeholder="Enter tracking code"
            className="h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label
            htmlFor="contact-message"
            className="mb-2 block text-sm font-medium text-[#102D46]"
          >
            Message
          </label>

          <textarea
            id="contact-message"
            name="message"
            rows={5}
            placeholder="Tell us what happened"
            className="w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="button"
          disabled
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white opacity-60 disabled:cursor-not-allowed"
        >
          Send message

          <ArrowRight
            aria-hidden="true"
            className="size-4"
          />
        </button>
      </fieldset>

      <p
        id="contact-status"
        role="status"
        className="mt-5 text-sm leading-6 text-slate-500"
      >
        Message submission is not available yet.
      </p>

      <div className="mt-5 border-t border-slate-100 pt-5">
        <p className="text-sm leading-7 text-slate-600">
          For shipment-specific help,{" "}
          <Link
            href="/login"
            className="font-semibold text-[#00877B] underline-offset-4 hover:underline"
          >
            sign in first.
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function ContactPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 bg-white">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12">
          <HelpSection />

          <div className="grid items-start gap-8 pb-20 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pb-24">
            <FrequentlyAskedQuestions />
            <ContactFormPreview />
          </div>
        </div>
      </main>

      <PublicFooter />
    </>
  );
}
