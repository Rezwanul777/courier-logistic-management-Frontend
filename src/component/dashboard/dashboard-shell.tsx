
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/component/layout/brand-logo";

import { getCurrentUser } from "@/lib/auth-server";
import type { SessionUser } from "@/lib/auth-schema";

import { LogoutButton } from "@/component/auth/Logout-button";

import { DashboardNavigation } from "./dashboard-navigation";

type DashboardRole = SessionUser["role"];

interface DashboardShellProps {
  role: DashboardRole;
  children: ReactNode;
}

const workspaceNames: Record<DashboardRole, string> = {
  CUSTOMER: "Customer workspace",
  ADMIN: "Operations workspace",
  COURIER: "Courier workspace",
};

function DashboardLogo() {
  return (
     <BrandLogo variant="dark" />
  );
}

export async function DashboardShell({
  role,
  children,
}: DashboardShellProps) {
  // Authentication and role authorization
  // happen on the server, not in the browser.
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== role) {
    // The dedicated Forbidden page
    // will replace this redirect later.
    redirect("/account");
  }

  const workspaceName = workspaceNames[role];

  return (
    <div className="flex min-h-dvh w-full bg-[#F4F6F9]">
      {/* Shared desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-[#102D46] text-white lg:flex">
        <div className="border-b border-white/10 px-6 py-7">
          <DashboardLogo />

          <p className="mt-3 text-xs text-slate-400">
            {workspaceName}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-6">
          <DashboardNavigation role={role} />
        </div>

        {/* Authenticated user identity */}
        <div className="border-t border-white/10 px-6 py-5">
          <p className="truncate text-sm font-semibold text-white">
            {user.name}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {user.email}
          </p>

          <p className="mt-3 text-[11px] font-medium uppercase tracking-wider text-[#8EDDD0]">
            {user.role.toLowerCase()}
          </p>
        </div>
      </aside>

      {/* Shared main workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex min-h-20 w-full items-center justify-between gap-4 px-5 sm:px-8">
            <div className="min-w-0">
              <BrandLogo compact />

              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#00877B]">
                {workspaceName}
              </p>

              <p className="mt-1 truncate text-sm text-slate-600">
                Welcome back, {user.name}
              </p>
            </div>

            <div className="shrink-0">
              <LogoutButton />
            </div>
          </div>

          {/* Shared mobile navigation */}
          <div className="overflow-x-auto bg-[#102D46] lg:hidden">
            <DashboardNavigation
              role={role}
              mobile
            />
          </div>
        </header>

        {/* Each role renders its own page here */}
        <main
          id="dashboard-main"
          className="w-full flex-1 px-5 py-7 sm:px-8 sm:py-9"
        >
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
