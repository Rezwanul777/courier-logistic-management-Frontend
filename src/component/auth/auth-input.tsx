
"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

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
  showPasswordToggle?: boolean;
  onValueChange: (value: string) => void;
};

export function AuthInput({
  id,
  label,
  value,
  invalid,
  errors,
  type,
  showPasswordToggle = false,
  onValueChange,
  ...props
}: AuthInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] =
    useState(false);

  const canTogglePassword =
    type === "password" && showPasswordToggle;

  const inputType =
    canTogglePassword && isPasswordVisible
      ? "text"
      : type;

  return (
    <Field
      data-invalid={invalid}
      data-disabled={props.disabled}
    >
      <FieldLabel htmlFor={id}>
        {label}
      </FieldLabel>

      <div className="relative">
        <Input
          {...props}
          id={id}
          type={inputType}
          value={value}
          className={
            canTogglePassword
              ? "h-11 pr-12"
              : "h-11"
          }
          onChange={(event) => {
            onValueChange(event.target.value);
          }}
          aria-invalid={invalid}
          aria-describedby={
            invalid ? `${id}-error` : undefined
          }
        />

        {canTogglePassword && (
          <button
            type="button"
            disabled={props.disabled}
            onClick={() => {
              setIsPasswordVisible((previous) => !previous);
            }}
            aria-label={
              isPasswordVisible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
            aria-pressed={isPasswordVisible}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-[#00877B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPasswordVisible ? (
              <EyeOff
                aria-hidden="true"
                className="size-5"
              />
            ) : (
              <Eye
                aria-hidden="true"
                className="size-5"
              />
            )}
          </button>
        )}
      </div>

      {invalid && (
        <FieldError
          id={`${id}-error`}
          errors={errors}
        />
      )}
    </Field>
  );
}
