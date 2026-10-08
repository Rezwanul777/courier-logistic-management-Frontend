
import type { Metadata } from "next";
import { Check } from "lucide-react";

import { PublicHeader } from "@/component/layout/public-header";
import { PasswordResetFlow } from "@/component/auth/password-reset-flow";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Securely reset your CourierFlow account password.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <>
      <PublicHeader />

      <main className="flex min-h-[calc(100svh-5rem)] flex-1 bg-[#F5F7FA]">
        <div className="mx-auto grid w-full max-w-7xl bg-white lg:grid-cols-2">
          <aside className="hidden flex-col justify-center bg-[#102D46] px-12 py-16 text-white lg:flex xl:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8EDDD0]">
              Your courier account
            </p>

            <h2 className="mt-7 text-5xl font-bold leading-[1.15] tracking-tight">
              Back to your
              <span className="mt-2 block">
                shipments.
              </span>
            </h2>

            <p className="mt-7 max-w-md text-base leading-8 text-slate-300">
              Use the verification code sent to your
              email to reset your password.
            </p>

            <div className="mt-12 flex items-center gap-3 text-sm text-[#B9EBE1]">
              <Check
                className="size-5"
                aria-hidden="true"
              />
              Secure email verification
            </div>
          </aside>

          <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14">
            <div className="w-full max-w-md">
              <PasswordResetFlow />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
