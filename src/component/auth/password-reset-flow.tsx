/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { AuthInput } from "@/component/auth/auth-input";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

import {
  passwordResetRequestSchema,
  passwordResetSchema,
  requestPasswordReset,
  resetPassword,
} from "@/lib/auth-api";

import { getErrorMessage } from "@/lib/api-errors";

export function PasswordResetFlow() {
  const [codeRequested, setCodeRequested] =
    useState(false);

  const [completed, setCompleted] = useState(false);

  const [emailError, setEmailError] = useState("");

  const requestMutation = useMutation({
    mutationFn: requestPasswordReset,
  });

  const resetMutation = useMutation({
    mutationFn: resetPassword,
  });

  const form = useForm({
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
    },

    validators: {
      onSubmit: passwordResetSchema,
    },

    onSubmit: async ({ value }) => {
      if (!codeRequested) return;

      try {
        await resetMutation.mutateAsync(value);
        setCompleted(true);
        form.reset();
      } catch {
        // The mutation error is displayed below.
      }
    },
  });

  async function sendResetCode() {
    const result = passwordResetRequestSchema.safeParse({
      email: form.getFieldValue("email"),
    });

    if (!result.success) {
      setEmailError(
        result.error.issues[0]?.message ??
          "Enter a valid email address.",
      );
      return;
    }

    setEmailError("");

    try {
      await requestMutation.mutateAsync(result.data);
      setCodeRequested(true);
    } catch {
      // The request error is displayed below.
    }
  }

  function changeEmail() {
    setCodeRequested(false);
    setEmailError("");
    requestMutation.reset();
    resetMutation.reset();
    form.reset();
  }

  if (completed) {
    return (
      <div
        role="status"
        className="rounded-xl border border-[#B8E3D8] bg-[#F0FAF7] p-7"
      >
        <CheckCircle2
          className="size-11 text-[#00877B]"
          aria-hidden="true"
        />

        <h2 className="mt-5 text-2xl font-bold text-[#102D46]">
          Password reset successful
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          Your password has been changed.
          Previous sessions have been invalidated.
          Sign in using your new password.
        </p>

        <Link
          href="/login"
          className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#006F66]"
        >
          Back to sign in
          <ArrowRight
            className="size-4"
            aria-hidden="true"
          />
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold tracking-tight text-[#102D46]">
        Reset password
      </h1>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Enter your email address to request a
        verification code and create a new password.
      </p>

      <form
        noValidate
        className="mt-8 flex flex-col gap-6"
        onSubmit={(event) => {
          event.preventDefault();

          if (
            codeRequested &&
            !form.state.isSubmitting
          ) {
            void form.handleSubmit();
          }
        }}
      >
        {requestMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {getErrorMessage(requestMutation.error)}
            </AlertDescription>
          </Alert>
        )}

        {resetMutation.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {getErrorMessage(resetMutation.error)}
            </AlertDescription>
          </Alert>
        )}

        <FieldGroup>
          <form.Field name="email">
            {(field) => (
              <div>
                <AuthInput
                  id="reset-email"
                  name={field.name}
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  disabled={
                    codeRequested ||
                    requestMutation.isPending
                  }
                  invalid={false}
                  errors={[]}
                  onBlur={field.handleBlur}
                  onValueChange={(value) => {
                    setEmailError("");
                    requestMutation.reset();
                    field.handleChange(value);
                  }}
                />

                {emailError && (
                  <p
                    role="alert"
                    className="mt-2 text-sm text-destructive"
                  >
                    {emailError}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {!codeRequested && (
            <Button
              type="button"
              size="lg"
              className="h-12 w-full bg-[#00877B] text-white hover:bg-[#006F66]"
              disabled={requestMutation.isPending}
              onClick={() => {
                void sendResetCode();
              }}
            >
              {requestMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}

              {requestMutation.isPending
                ? "Sending code..."
                : "Send reset code"}
            </Button>
          )}

          {codeRequested && (
            <>
              <div
                role="status"
                className="rounded-lg border border-[#B8E3D8] bg-[#F0FAF7] p-4 text-sm leading-6 text-[#155E53]"
              >
                If an eligible account exists for
                this email address, a reset code has
                been sent. Check your inbox.
              </div>

              <form.Field name="otp">
                {(field) => (
                  <AuthInput
                    id="reset-otp"
                    name={field.name}
                    label="Reset code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={field.state.value}
                    disabled={resetMutation.isPending}
                    invalid={
                      field.state.meta.isTouched &&
                      !field.state.meta.isValid
                    }
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={(value) => {
                      resetMutation.reset();
                      field.handleChange(
                        value.replace(/\D/g, "").slice(0, 6),
                      );
                    }}
                  />
                )}
              </form.Field>

              <form.Field name="newPassword">
                {(field) => (
                  <AuthInput
                    id="reset-new-password"
                    name={field.name}
                    label="New password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter a new password"
                    value={field.state.value}
                    disabled={resetMutation.isPending}
                    invalid={
                      field.state.meta.isTouched &&
                      !field.state.meta.isValid
                    }
                    errors={field.state.meta.errors}
                    onBlur={field.handleBlur}
                    onValueChange={(value) => {
                      resetMutation.reset();
                      field.handleChange(value);
                    }}
                  />
                )}
              </form.Field>

              <p className="text-xs leading-6 text-slate-500">
                Use at least 6 characters, including
                uppercase, lowercase, a number, and
                a special character.
              </p>

              <form.Subscribe
                selector={(state) => state.isSubmitting}
              >
                {(submitting) => (
                  <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full bg-[#00877B] text-white hover:bg-[#006F66]"
                    disabled={
                      submitting || resetMutation.isPending
                    }
                  >
                    {(submitting ||
                      resetMutation.isPending) && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}

                    {submitting ||
                    resetMutation.isPending
                      ? "Resetting password..."
                      : "Reset password"}
                  </Button>
                )}
              </form.Subscribe>

              <button
                type="button"
                onClick={changeEmail}
                disabled={resetMutation.isPending}
                className="self-center text-sm font-medium text-[#00877B] hover:underline disabled:opacity-50"
              >
                Use another email address
              </button>
            </>
          )}
        </FieldGroup>
      </form>

      <p className="mt-8 text-center text-sm text-slate-600">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#00877B] hover:underline"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
