/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import {
  type FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  CheckCircle2,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import { z } from "zod";

// ---------------------------------------------
// Validation
// ---------------------------------------------

const createCourierSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});

const responseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});

type FormValues = z.infer<
  typeof createCourierSchema
>;

// ---------------------------------------------
// Component
// ---------------------------------------------

export function CreateCourierForm() {
  const router = useRouter();

  const [form, setForm] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
  });

  const [pending, setPending] = useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  function updateField(
    field: keyof FormValues,
    value: string,
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (pending) {
      return;
    }

    setError(null);
    setSuccess(null);

    const parsed = createCourierSchema.safeParse({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    if (!parsed.success) {
      setError(
        "Enter a valid name, email, and password of at least 8 characters.",
      );
      return;
    }

    setPending(true);

    try {
      const response = await fetch(
        "/api/backend/admin/couriers",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",

          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },

          body: JSON.stringify(parsed.data),
        },
      );

      const result = responseSchema.safeParse(
        await response.json(),
      );

      if (!result.success) {
        throw new Error(
          "Unexpected account creation response.",
        );
      }

      if (
        !response.ok ||
        !result.data.success
      ) {
        throw new Error(
          result.data.message ??
            "Unable to create courier account.",
        );
      }

      setSuccess(
        "Courier account created successfully.",
      );

      // Clear the password from component state.
      setForm({
        name: "",
        email: "",
        password: "",
      });

      // Fetch the updated directory.
      router.refresh();
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to create courier account.",
      );
    } finally {
      setPending(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-[#102D46] outline-none focus-visible:border-[#00877B] focus-visible:ring-2 focus-visible:ring-teal-100 disabled:opacity-60";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <UserPlus
          aria-hidden="true"
          className="size-5 text-[#00877B]"
        />

        <h2 className="text-lg font-bold text-[#102D46]">
          Create courier account
        </h2>
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Create a courier login for a delivery
        team member.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-5"
      >
        {/* Courier name */}
        <div className="space-y-2">
          <label
            htmlFor="new-courier-name"
            className="text-sm font-medium text-[#102D46]"
          >
            Courier name
          </label>

          <input
            id="new-courier-name"
            type="text"
            required
            minLength={3}
            maxLength={100}
            autoComplete="name"
            value={form.name}
            disabled={pending}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value,
              )
            }
            placeholder="Enter courier name"
            className={inputClass}
          />
        </div>

        {/* Courier email */}
        <div className="space-y-2">
          <label
            htmlFor="new-courier-email"
            className="text-sm font-medium text-[#102D46]"
          >
            Email address
          </label>

          <input
            id="new-courier-email"
            type="email"
            required
            maxLength={254}
            autoComplete="off"
            value={form.email}
            disabled={pending}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value,
              )
            }
            placeholder="courier@example.com"
            className={inputClass}
          />
        </div>

        {/* Initial password */}
        <div className="space-y-2">
          <label
            htmlFor="new-courier-password"
            className="text-sm font-medium text-[#102D46]"
          >
            Initial password
          </label>

          <input
            id="new-courier-password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            value={form.password}
            disabled={pending}
            onChange={(event) =>
              updateField(
                "password",
                event.target.value,
              )
            }
            placeholder="Minimum 8 characters"
            className={inputClass}
          />

          <p className="text-xs leading-5 text-slate-500">
            Use a strong, unique password.
            Share it with the courier through
            a secure channel.
          </p>
        </div>

        {/* Errors */}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {/* Success */}
        {success && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            <CheckCircle2
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
            />
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#00877B] px-5 text-sm font-semibold text-white hover:bg-[#006F66] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus
                aria-hidden="true"
                className="size-4"
              />
              Create courier account
            </>
          )}
        </button>
      </form>
    </section>
  );
}
