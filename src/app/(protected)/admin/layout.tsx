/** biome-ignore-all lint/a11y/useValidAriaRole: <explanation> */

import type { ReactNode } from "react";

import { DashboardShell } from "@/component/dashboard/dashboard-shell";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell role="ADMIN">
      {children}
    </DashboardShell>
  );
}
