
import type { Metadata } from "next";
import {
  CheckCircle2,
  CreditCard,
  PackageCheck,
  Route,
} from "lucide-react";

import { RegistrationFlow } from "@/component/auth/registration-flow";
import { PublicHeader } from "@/component/layout/public-header";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your CourierFlow customer account to book, pay for, and track courier shipments.",
  robots: {
    index: false,
    follow: false,
  },
};

const benefits = [
  {
    icon: PackageCheck,
    title: "Simple parcel booking",
    description:
      "Keep pickup, recipient, and parcel details together.",
  },
  {
    icon: Route,
    title: "Clear shipment tracking",
    description:
      "Follow recorded milestones from pickup to delivery.",
  },
  {
    icon: CreditCard,
    title: "Secure checkout",
    description:
      "Review shipping costs before completing payment.",
  },
] as const;

function RegistrationIntroduction() {
  return (
    <aside className="hidden flex-col justify-between bg-[#102D46] px-10 py-12 text-white lg:flex xl:px-14 xl:py-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8EDDD0]">
          Get started with CourierFlow
        </p>

        <h2 className="mt-7 max-w-md text-4xl font-bold leading-[1.15] tracking-tight xl:text-5xl">
          Your parcels.
          <span className="mt-2 block">
            One workspace.
          </span>
        </h2>

        <p className="mt-6 max-w-md text-base leading-8 text-slate-300">
          Create your customer account and keep your
          shipments organized from the first pickup
          to the final doorstep.
        </p>

        <div className="mt-11 space-y-7">
          {benefits.map(
            ({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4"
              >
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#8EDDD0]">
                  <Icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {title}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">
                    {description}
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-white/15 pt-6">
        <div className="flex items-center gap-3 text-sm text-[#B9EBE1]">
          <CheckCircle2
            aria-hidden="true"
            className="size-5 shrink-0"
          />

          <span>
            Email verification helps protect your account.
          </span>
        </div>
      </div>
    </aside>
  );
}

function RegistrationContent() {
  return (
    <section
      aria-label="Customer registration"
      className="flex items-center justify-center bg-white px-6 py-12 sm:px-10 lg:px-12 xl:px-14"
    >
      <div className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#00877B]">
            Customer registration
          </p>
        </div>

        <RegistrationFlow />

        <div className="mt-8 border-t border-slate-100 pt-6">
          <p className="text-center text-xs leading-6 text-slate-500">
            Your account is activated after
            successful email verification.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function RegisterPage() {
  return (
    <>
      {/* <PublicHeader /> */}

      <main className="flex min-h-[calc(100svh-5rem)] flex-1 bg-[#F5F7FA]">
        <div className="mx-auto w-full max-w-7xl sm:px-6 sm:py-10 lg:px-12 lg:py-14">
          <div className="grid min-h-full overflow-hidden bg-white sm:rounded-2xl sm:border sm:border-slate-200 lg:grid-cols-2 lg:shadow-sm">
            <RegistrationIntroduction />
            <RegistrationContent />
          </div>
        </div>
      </main>
    </>
  );
}
