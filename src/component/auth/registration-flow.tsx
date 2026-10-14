"use client";

import Link from "next/link";
import { toast } from "sonner";

import { useState } from "react";

import { VerifyEmailForm } from "@/component/auth/verify-email-form";

import { GoogleSignIn } from "@/component/auth/google-sign-in";

import { Button } from "@/components/ui/button";

import { RegisterForm } from "./registration-from";

// ---------------------------------------------
// Customer registration flow
// ---------------------------------------------

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
          {/* Existing email OTP verification */}
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
          {/* Existing password registration */}

          <RegisterForm
            onContinue={(registeredEmail) => {
              setEmail(registeredEmail);

              toast.success("Verification code sent!", {
                description:
                  "Please check your email and enter the verification code to activate your account.",
                duration: 5000,
              });
            }}
          />

          <Link
            href="/verify-email"
            className="text-center text-sm text-primary underline-offset-4 hover:underline"
          >
            Already received a code? Verify email
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-xs font-semibold uppercase text-slate-400">
              Or
            </span>

            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Google customer registration */}
          <div className="space-y-3">
            <p className="text-center text-xs text-slate-500">
              Sign up with your Google account
            </p>

            <GoogleSignIn mode="register" />
          </div>
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
