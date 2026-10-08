"use client";

import type { ComponentProps } from "react";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AuthInputProps = Omit<
  ComponentProps<typeof Input>,
  "id" | "onChange" | "value"
> & {
  id: string;
  label: string;
  value: string;
  invalid: boolean;
  errors: Array<{ message?: string } | undefined>;
  onValueChange: (value: string) => void;
};

export function AuthInput({
  id,
  label,
  value,
  invalid,
  errors,
  onValueChange,
  ...props
}: AuthInputProps) {
  return (
    <Field
      data-invalid={invalid}
      data-disabled={props.disabled}
    >
      <FieldLabel htmlFor={id}>{label}</FieldLabel>

      <Input
        {...props}
        id={id}
        value={value}
        className="h-11"
        onChange={(event) => {
          onValueChange(event.target.value);
        }}
        aria-invalid={invalid}
        aria-describedby={
          invalid ? `${id}-error` : undefined
        }
      />

      {invalid && (
        <FieldError
          id={`${id}-error`}
          errors={errors}
        />
      )}
    </Field>
  );
}
