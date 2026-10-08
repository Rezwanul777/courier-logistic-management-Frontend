/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  LoaderCircle,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { sessionUserSchema } from "@/lib/auth-schema";
import { queryKeys } from "@/lib/query-keys";

const demoResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: sessionUserSchema,
  }),
});

type DemoRole = "CUSTOMER" | "COURIER" | "ADMIN";

const demoRoles = [
  {
    role: "CUSTOMER",
    label: "Customer demo",
    icon: UserRound,
  },
  {
    role: "COURIER",
    label: "Courier demo",
    icon: Truck,
  },
  {
    role: "ADMIN",
    label: "Admin demo",
    icon: ShieldCheck,
  },
] as const;

async function signInDemo(role: DemoRole) {
  const response = await fetch("/api/demo-login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify({ role }),
  });

  if (!response.ok) {
    throw new Error(
      response.status === 429
        ? "Too many attempts. Please try again later."
        : "Demo login is unavailable. Please try again.",
    );
  }

  const result = demoResponseSchema.safeParse(
    await response.json(),
  );

  if (!result.success) {
    throw new Error("Unexpected demo login response.");
  }

  return result.data.data.user;
}

export function DemoLogin({
  enabled,
}: {
  enabled: boolean;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: signInDemo,
  });

  async function handleDemoLogin(role: DemoRole) {
    try {
      const user = await mutation.mutateAsync(role);

      await queryClient.cancelQueries();
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session, user);

      // Role-specific dashboards will be connected later.
      // /account is the currently implemented protected page.
      window.location.replace("/account");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to sign in to the demo account.",
      );
    }
  }

  return (
    <section
      aria-labelledby="demo-login-heading"
      className="mt-8 border-t border-slate-200 pt-7"
    >
      <div className="mb-6 text-center">
        <h2
          id="demo-login-heading"
          className="text-base font-semibold text-[#102D46]"
        >
          Quick demo access
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Explore each role with one click.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {demoRoles.map(({ role, label, icon: Icon }) => {
          const isCurrent =
            mutation.isPending &&
            mutation.variables === role;

          return (
            <Button
              key={role}
              type="button"
              variant="outline"
              disabled={!enabled || mutation.isPending}
              onClick={() => {
                void handleDemoLogin(role);
              }}
              className="h-auto min-h-24 flex-col gap-2 rounded-xl border-slate-200 px-3 py-4 text-center hover:border-[#00877B] hover:bg-[#E8F5F2]"
            >
              {isCurrent ? (
                <LoaderCircle className="size-5 animate-spin text-[#00877B]" />
              ) : (
                <Icon
                  aria-hidden="true"
                  className="size-5 text-[#00877B]"
                />
              )}

              <span className="text-xs font-semibold whitespace-normal text-[#102D46]">
                {isCurrent ? "Signing in..." : label}
              </span>
            </Button>
          );
        })}
      </div>

      {!enabled && (
        <p
          role="status"
          className="mt-4 text-center text-xs leading-5 text-slate-500"
        >
          Demo accounts are not configured yet.
        </p>
      )}
    </section>
  );
}
