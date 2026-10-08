"use client";

import { useForm } from "@tanstack/react-form";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { AuthInput } from "@/component/auth/auth-input";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

import { getErrorMessage } from "@/lib/api-errors";
import { verifyEmail } from "@/lib/auth-api";
import { verifyEmailSchema } from "@/lib/auth-schema";
import { queryKeys } from "@/lib/query-keys";

export function VerifyEmailForm({
  email = "",
}: {
  email?: string;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: verifyEmail,
  });

  const form = useForm({
    defaultValues: {
      email,
      otp: "",
    },
    validators: {
      onBlur: verifyEmailSchema,
      onSubmit: verifyEmailSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const user = await mutation.mutateAsync(value);

        await queryClient.cancelQueries();
        queryClient.clear();
        queryClient.setQueryData(queryKeys.session, user);

        form.reset();
        window.location.replace("/account");
      } catch {
        // Keep the fields available for correction.
      }
    },
  });

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
          <AlertDescription>
            {getErrorMessage(mutation.error)}
          </AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        {(["email", "otp"] as const).map((name) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <AuthInput
                id={`verify-${name}`}
                name={name}
                label={
                  name === "email"
                    ? "Email address"
                    : "Verification code"
                }
                type={name === "email" ? "email" : "text"}
                autoComplete={
                  name === "email"
                    ? "email"
                    : "one-time-code"
                }
                inputMode={
                  name === "otp" ? "numeric" : "email"
                }
                maxLength={name === "otp" ? 6 : 254}
                placeholder={
                  name === "otp"
                    ? "6-digit code"
                    : "you@example.com"
                }
                value={field.state.value}
                onBlur={field.handleBlur}
                disabled={mutation.isPending}
                invalid={
                  field.state.meta.isTouched &&
                  !field.state.meta.isValid
                }
                errors={field.state.meta.errors}
                onValueChange={(value) => {
                  mutation.reset();
                  field.handleChange(value);
                }}
              />
            )}
          </form.Field>
        ))}
      </FieldGroup>

      <form.Subscribe
        selector={(state) => state.isSubmitting}
      >
        {(pending) => (
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={pending || mutation.isPending}
          >
            {pending && (
              <LoaderCircle
                data-icon="inline-start"
                className="motion-safe:animate-spin"
              />
            )}

            {pending ? "Verifying…" : "Verify email"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
