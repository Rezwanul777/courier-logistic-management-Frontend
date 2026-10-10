/** biome-ignore-all lint/a11y/useAriaPropsSupportedByRole: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, UserRound } from "lucide-react";

import { LogoutButton } from "@/component/auth/Logout-button";
import { apiRequest } from "@/lib/apiClient";
import { sessionUserSchema } from "@/lib/auth-schema";
import { getPostLoginPath } from "@/lib/auth-redirect";
import { queryKeys } from "@/lib/query-keys";

interface PublicAuthActionsProps {
  variant?: "desktop" | "mobile";
}

const roleLabels = {
  CUSTOMER: "Customer",
  ADMIN: "Admin",
  COURIER: "Courier",
} as const;

export function PublicAuthActions({
  variant = "desktop",
}: PublicAuthActionsProps) {
  const { data: user, isPending } = useQuery({
    queryKey: queryKeys.session,
    queryFn: async () => {
      const response = await apiRequest(
        "/auth/me",
        sessionUserSchema,
        { method: "GET" },
      );

      return response.data;
    },
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: true,
  });

  const isMobile = variant === "mobile";

  const containerClass = isMobile
    ? "flex w-full flex-col gap-3"
    : "hidden items-center gap-3 lg:flex";

  if (isPending) {
    return (
      <div
        role="status"
        aria-label="Checking account session"
        className={containerClass}
      >
        <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
        <div className="h-10 w-24 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className={containerClass}>
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-medium text-[#102D46] hover:bg-slate-50"
        >
          Sign in
        </Link>

        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-[#00877B] px-5 text-sm font-medium text-white hover:bg-[#006F66]"
        >
          Send a parcel
        </Link>
      </div>
    );
  }

  const destination = getPostLoginPath(user.role);

  const hasDashboard = user.role === "CUSTOMER";

  return (
    <div className={containerClass}>
      <div
        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 px-3 py-2"
        aria-label={`${user.name}, ${roleLabels[user.role]}`}
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#E8F5F2]">
          <UserRound
            aria-hidden="true"
            className="size-5 text-[#00877B]"
          />
        </div>

        <div className="min-w-0 max-w-40">
          <p className="truncate text-sm font-semibold text-[#102D46]">
            {user.name}
          </p>

          <p className="truncate text-xs text-slate-500">
            {user.email}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-[#E8F5F2] px-2.5 py-1 text-xs font-semibold text-[#00877B]">
          {roleLabels[user.role]}
        </span>
      </div>

      <Link
        href={destination}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-[#102D46] transition-colors hover:bg-slate-50"
      >
        <LayoutDashboard
          aria-hidden="true"
          className="size-4"
        />

        {hasDashboard ? "Dashboard" : "My account"}
      </Link>

      <LogoutButton />
    </div>
  );
}
