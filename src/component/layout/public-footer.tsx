
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const footerLinks = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Help", href: "/contact" },
] as const;

export function PublicFooter() {
  return (
    <footer className="bg-[#102D46] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
        <Link
          href="/"
          aria-label="CourierFlow home"
          className="inline-flex items-center gap-1 text-lg font-bold tracking-tight"
        >
          <ArrowUpRight
            aria-hidden="true"
            className="size-5"
          />
          CourierFlow
        </Link>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
          <span>Shipments with clarity.</span>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-6 gap-y-3"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-white focus-visible:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
