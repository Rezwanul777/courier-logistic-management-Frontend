import type { Metadata } from "next";
import Link from "next/link";
import { VerifyEmailForm } from "@/component/auth/verify-email-form";

export const metadata: Metadata = {
  title: "Verify email",
};

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-7">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Verify your email
          </h1>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Enter your registration email and the 6-digit
            code. Codes expire after 5 minutes.
          </p>
        </div>

        <VerifyEmailForm />

        <Link
          href="/register"
          className="text-center text-sm text-primary underline-offset-4 hover:underline"
        >
          Need a new code? Start a new registration
        </Link>
      </div>
    </main>
  );
}
