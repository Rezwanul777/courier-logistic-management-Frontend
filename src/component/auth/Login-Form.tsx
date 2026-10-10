"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { ApiError, getErrorMessage } from "@/lib/api-errors";
import { login } from "@/lib/auth-api";
import { loginSchema } from "@/lib/auth-schema";
import { queryKeys } from "@/lib/query-keys";
import Link from "next/link";
import { getPostLoginPath } from "./auth-redirect";


export function LoginForm() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: login,
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const user = await mutation.mutateAsync(value);

        await queryClient.cancelQueries();
        queryClient.clear();
        queryClient.setQueryData(queryKeys.session, user);

        form.reset();
        toast.success("Welcome back!");

        // A new document ensures server checks use the new cookies.

        window.location.replace(getPostLoginPath(user.role));
      } catch {
        // Error state renders below.
        // Step 1's mutation cache displays the error toast.
      }
    },
  });

  const message =
    mutation.error instanceof ApiError && mutation.error.status === 401
      ? "Unable to sign in. Check your email and password, and make sure your account is verified."
      : getErrorMessage(mutation.error);

  return (
    <form
      noValidate
      className="flex flex-col gap-6"
      onSubmit={(event) => {
        event.preventDefault();

        if (!form.state.isSubmitting) {
          void form.handleSubmit();
        }
      }}
    >
      {mutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <form.Field name="email">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor="login-email">Email address</FieldLabel>

                <Input
                  id="login-email"
                  name={field.name}
                  type="email"
                  autoComplete="username"
                  placeholder="you@example.com"
                  className="h-11"
                  disabled={mutation.isPending}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    mutation.reset();
                    field.handleChange(event.target.value);
                  }}
                  aria-invalid={invalid}
                  aria-describedby={invalid ? "login-email-error" : undefined}
                />

                {invalid && (
                  <FieldError
                    id="login-email-error"
                    errors={field.state.meta.errors}
                  />
                )}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const invalid =
              field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={invalid}>
                <FieldLabel htmlFor="login-password">Password</FieldLabel>

                <Input
                  id="login-password"
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-11"
                  disabled={mutation.isPending}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    mutation.reset();
                    field.handleChange(event.target.value);
                  }}
                  aria-invalid={invalid}
                  aria-describedby={
                    invalid ? "login-password-error" : undefined
                  }
                />

                {invalid && (
                  <FieldError
                    id="login-password-error"
                    errors={field.state.meta.errors}
                  />
                )}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <div className="-mt-3 flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#00877B] underline-offset-4 transition-colors hover:text-[#006F66] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00877B]"
        >
          Forgot password?
        </Link>
      </div>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(submitting) => (
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={submitting || mutation.isPending}
          >
            {submitting && (
              <LoaderCircle
                data-icon="inline-start"
                className="motion-safe:animate-spin"
              />
            )}

            {submitting ? "Signing in…" : "Sign in"}

            {!submitting && <ArrowRight data-icon="inline-end" />}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
