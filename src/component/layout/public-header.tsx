

import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";

import { PublicAuthActions } from "@/component/layout/public-auth-actions";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function PublicHeader() {
  return (
    <header className="relative z-50 w-full border-b border-slate-100 bg-white">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        {/* Brand logo */}
        <Link
          href="/"
          aria-label="CourierFlow home"
          className="inline-flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-[#102D46] transition-colors hover:text-[#00877B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00877B]"
        >
          <ArrowUpRight
            aria-hidden="true"
            className="size-6 text-[#00877B]"
            strokeWidth={2.5}
          />

          <span>CourierFlow</span>
        </Link>

        {/* Desktop navigation */}
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 xl:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-slate-600 transition-colors hover:text-[#00877B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00877B]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop authentication actions */}
        <div className="hidden min-w-0 xl:block">
          <PublicAuthActions variant="desktop" />
        </div>

        {/* Mobile and tablet navigation */}
        <details className="group relative xl:hidden">
          <summary
            aria-label="Toggle navigation menu"
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-[#102D46] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00877B] [&::-webkit-details-marker]:hidden"
          >
            <Menu
              aria-hidden="true"
              className="size-5"
            />
          </summary>

          <div className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            {/* Mobile navigation links */}
            <nav
              aria-label="Mobile navigation"
              className="flex flex-col gap-1 p-3"
            >
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#E8F5F2] hover:text-[#00877B]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile authentication actions */}
            <div className="border-t border-slate-100 p-3">
              <PublicAuthActions variant="mobile" />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
