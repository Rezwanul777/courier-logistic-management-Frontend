
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  ClipboardList,
  CreditCard,
  History,
  LayoutDashboard,
  MapPinned,
  Package,
  PackagePlus,
  ScrollText,
  Truck,
  UserRound,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import type { SessionUser } from "@/lib/auth-schema";

type DashboardRole = SessionUser["role"];

type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

const navigation: Record<
  DashboardRole,
  readonly NavigationItem[]
> = {
  CUSTOMER: [
    {
      label: "Overview",
      href: "/customer",
      icon: LayoutDashboard,
      enabled: true,
    },
    {
      label: "My shipments",
      href: "/customer/shipments",
      icon: Package,
      enabled: true,
    },
    {
      label: "Create shipment",
      href: "/customer/shipments/new",
      icon: PackagePlus,
      enabled: true,
    },
    {
      label: "Payments",
      href: "/customer/payments",
      icon: CreditCard,
      enabled: true,
    },
    {
      label: "My profile",
      href: "/account",
      icon: UserRound,
      enabled: true,
    },
  ],

  ADMIN: [
    {
      label: "Overview",
      href: "/admin",
      icon: LayoutDashboard,
      enabled: false,
    },
    {
      label: "Shipments",
      href: "/admin/shipments",
      icon: Package,
      enabled: false,
    },
    {
      label: "Couriers",
      href: "/admin/couriers",
      icon: Truck,
      enabled: false,
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: UsersRound,
      enabled: false,
    },
    {
      label: "Hubs & zones",
      href: "/admin/hubs",
      icon: MapPinned,
      enabled: false,
    },
    {
      label: "Rate cards",
      href: "/admin/rates",
      icon: Wallet,
      enabled: false,
    },
    {
      label: "Audit logs",
      href: "/admin/audit-logs",
      icon: ScrollText,
      enabled: false,
    },
  ],

  COURIER: [
    {
      label: "My tasks",
      href: "/courier",
      icon: ClipboardList,
      enabled: false,
    },
    {
      label: "Task history",
      href: "/courier/history",
      icon: History,
      enabled: false,
    },
    {
      label: "My profile",
      href: "/account",
      icon: UserRound,
      enabled: true,
    },
  ],
};

interface DashboardNavigationProps {
  role: DashboardRole;
  mobile?: boolean;
}

export function DashboardNavigation({
  role,
  mobile = false,
}: DashboardNavigationProps) {
  const pathname = usePathname();
  const items = navigation[role];

  // Prefer the most specific route when paths overlap.
  const activeHref = items
    .filter(
      (item) =>
        item.enabled &&
        (pathname === item.href ||
          pathname.startsWith(`${item.href}/`)),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]
    ?.href;

  return (
    <nav
      aria-label={`${role.toLowerCase()} navigation`}
      className={
        mobile
          ? "flex w-max min-w-full items-center gap-2 px-4 py-3"
          : "flex flex-col gap-1 px-4"
      }
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = activeHref === item.href;

        const baseStyles =
          "flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors";

        const content = (
          <>
            <Icon
              aria-hidden="true"
              className="size-5 shrink-0"
              strokeWidth={1.8}
            />

            <span className="whitespace-nowrap font-medium">
              {item.label}
            </span>

            {!item.enabled && !mobile && (
              <span className="ml-auto text-[10px] text-slate-400">
                Soon
              </span>
            )}
          </>
        );

        if (!item.enabled) {
          return (
            <span
              key={item.href}
              aria-disabled="true"
              title="Coming soon"
              className={`${baseStyles} cursor-not-allowed text-slate-400 opacity-65`}
            >
              {content}
            </span>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? `${baseStyles} bg-[#00877B] font-semibold text-white`
                : `${baseStyles} text-slate-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8EDDD0]`
            }
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
