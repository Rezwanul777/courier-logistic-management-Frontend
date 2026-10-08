"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";

import { AuthInput } from "@/component/auth/auth-input";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

import { getErrorMessage } from "@/lib/api-errors";
import { registerCustomer } from "@/lib/auth-api";
import { registerSchema } from "@/lib/auth-schema";

const fields = [
  {
    name: "name",
    label: "Full name",
    type: "text",
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email address",
    type: "email",
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm password",
    type: "password",
    autoComplete: "new-password",
  },
] as const;

export function RegisterForm({
  onContinue,
}: {
  onContinue: (email: string) => void;
}) {
  const mutation = useMutation({
    mutationFn: registerCustomer,
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: registerSchema,
      onSubmit: registerSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const email = await mutation.mutateAsync(value);

        form.reset();
        onContinue(email);
      } catch {
        // Error state renders below.
        // The shared mutation cache handles the error toast.
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
        {fields.map(
          ({ name, label, type, autoComplete }) => (
            <form.Field key={name} name={name}>
              {(field) => (
                <AuthInput
                  id={`register-${name}`}
                  name={name}
                  label={label}
                  type={type}
                  autoComplete={autoComplete}
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
          ),
        )}
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

            {pending ? "Sending code…" : "Create account"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
