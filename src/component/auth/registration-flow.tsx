"use client";

import Link from "next/link";
import { useState } from "react";


import { VerifyEmailForm } from "@/component/auth/verify-email-form";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "./registration-from";

export function RegistrationFlow() {
  const [email, setEmail] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {email ? "Check your inbox" : "Create your account"}
        </h1>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {email
            ? "Enter the code sent to your email. It expires after 5 minutes."
            : "Sign up to book and track your courier shipments."}
        </p>
      </div>

      {email ? (
        <>
          <VerifyEmailForm email={email} />

          <Button
            variant="link"
            className="self-center"
            onClick={() => setEmail(null)}
          >
            Start a new registration
          </Button>
        </>
      ) : (
        <>
          <RegisterForm onContinue={setEmail} />

          <Link
            href="/verify-email"
            className="text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            Already received a code? Verify email
          </Link>
        </>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
