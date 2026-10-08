
import Link from "next/link";
import { ArrowUpRight, Menu } from "lucide-react";

const navigation = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function PublicHeader() {
  return (
    <header className="relative z-50 bg-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1 text-xl font-bold tracking-tight text-[#102D46]"
          aria-label="CourierFlow home"
        >
          <ArrowUpRight
            className="size-6"
            aria-hidden="true"
          />
          <span>CourierFlow</span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-[#00877B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00877B]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-medium text-[#102D46] transition-colors hover:bg-slate-50"
          >
            Sign in
          </Link>

          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#00877B] px-5 text-sm font-medium text-white transition-colors hover:bg-[#006F66]"
          >
            Send a parcel
          </Link>
        </div>

        <details className="group relative lg:hidden">
          <summary
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-[#102D46] [&::-webkit-details-marker]:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="size-5" aria-hidden="true" />
          </summary>

          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-full mt-3 flex w-64 flex-col gap-1 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 border-t border-slate-100" />

            <Link
              href="/login"
              className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign in
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-[#00877B] px-3 py-2.5 text-center text-sm font-medium text-white"
            >
              Send a parcel
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
