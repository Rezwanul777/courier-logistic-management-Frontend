/** biome-ignore-all lint/a11y/useValidAriaRole: <explanation> */

import type { ReactNode } from "react";

import { DashboardShell } from "@/component/dashboard/dashboard-shell";

export default function CustomerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DashboardShell role="CUSTOMER">
      {children}
    </DashboardShell>
  );
}
