
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  MapPinned,
  PackageCheck,
} from "lucide-react";

import { LoginForm } from "@/component/auth/Login-Form";
import { PublicHeader } from "@/component/layout/public-header";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to CourierFlow to manage shipments, payments, and delivery operations.",
  robots: {
    index: false,
    follow: false,
  },
};

const benefits = [
  {
    text: "Create a shipment in a few clear steps",
    icon: PackageCheck,
  },
  {
    text: "Pay through secure Stripe Checkout",
    icon: CreditCard,
  },
  {
    text: "Follow each pickup, hub, and delivery event",
    icon: MapPinned,
  },
] as const;

function LoginIntroduction() {
  return (
    <aside className="flex flex-col justify-center bg-[#102D46] px-7 py-12 text-white sm:px-12 lg:min-h-[680px] lg:px-14 lg:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8EDDD0]">
        CourierFlow workspace
      </p>

      <h2 className="mt-7 max-w-md text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
        A better way
        <span className="mt-2 block">
          to move parcels.
        </span>
      </h2>

      <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
        One account. Every shipment. Complete visibility.
      </p>

      <ul className="mt-10 space-y-6">
        {benefits.map(({ text, icon: Icon }) => (
          <li
            key={text}
            className="flex items-start gap-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#8EDDD0]">
              <Icon
                aria-hidden="true"
                className="size-5"
                strokeWidth={1.8}
              />
            </span>

            <span className="pt-1 text-sm leading-6 text-slate-200">
              {text}
            </span>

            <Check
              aria-hidden="true"
              className="ml-auto hidden size-4 shrink-0 text-[#8EDDD0] sm:block"
            />
          </li>
        ))}
      </ul>

      <div className="mt-12 border-t border-white/15 pt-6">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#B9EBE1] transition-colors hover:text-white"
        >
          Learn more about CourierFlow
          <ArrowUpRight
            aria-hidden="true"
            className="size-4"
          />
        </Link>
      </div>
    </aside>
  );
}

function LoginContent() {
  return (
    <section
      aria-labelledby="login-heading"
      className="flex items-center justify-center bg-white px-6 py-12 sm:px-12 lg:px-14"
    >
      <div className="w-full max-w-sm">
        <div className="mb-9">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
            Sign in to your workspace
          </p>

          <h1
            id="login-heading"
            className="text-3xl font-bold tracking-tight text-[#102D46] sm:text-4xl"
          >
            Welcome back
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-600">
            Sign in to your CourierFlow account.
          </p>
        </div>

        <LoginForm />

        <div className="mt-8 border-t border-slate-200 pt-7">
          <p className="text-center text-sm text-slate-600">
            New here?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#00877B] underline-offset-4 hover:underline focus-visible:underline"
            >
              Create a customer account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex-1 bg-[#F5F7FA]">
        <div className="mx-auto w-full max-w-7xl px-0 sm:px-6 sm:py-10 lg:px-12 lg:py-14">
          <div className="grid overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200 lg:grid-cols-2 lg:shadow-sm">
            <LoginIntroduction />
            <LoginContent />
          </div>
        </div>
      </main>
    </>
  );
}
