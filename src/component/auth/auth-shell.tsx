import {
  ArrowRight,
  CreditCard,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

const features = [
  {
    icon: Package,
    title: "Book your shipment",
    description:
      "Arrange a pickup with the details in one place.",
  },
  {
    icon: CreditCard,
    title: "Manage payments",
    description:
      "Keep shipment payments connected to your orders.",
  },
  {
    icon: MapPin,
    title: "Follow every delivery",
    description:
      "View tracking updates throughout the journey.",
  },
];

export function AuthShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col bg-muted/40 font-sans">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-6 sm:px-10">
        <Link
          href="/login"
          className="flex items-center gap-3"
          aria-label="CourierFlow sign in"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Truck
              aria-hidden="true"
              className="size-5"
            />
          </span>

          <span className="text-xl font-semibold tracking-tight">
            CourierFlow
          </span>
        </Link>

        <span className="hidden text-sm text-muted-foreground sm:block">
          Courier logistics management
        </span>
      </header>

      <div className="flex flex-1 items-center px-4 pb-8 sm:px-10 sm:pb-12">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="hidden flex-col justify-between gap-12 bg-primary p-12 text-primary-foreground lg:flex xl:p-14">
            <div className="flex flex-col gap-6">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10">
                <Package
                  aria-hidden="true"
                  className="size-7"
                  strokeWidth={1.5}
                />
              </span>

              <h2 className="max-w-sm text-5xl leading-[1.12] font-semibold tracking-tight">
                Your parcels.
                <br />
                One workspace.
              </h2>

              <p className="max-w-sm text-base leading-7 text-primary-foreground/80">
                From the first pickup to the final doorstep,
                keep your courier shipments organized.
              </p>
            </div>

            <div className="flex flex-col gap-7">
              {features.map(
                ({ icon: Icon, title, description }) => (
                  <div
                    key={title}
                    className="flex items-start gap-4"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
                      <Icon
                        aria-hidden="true"
                        className="size-5"
                        strokeWidth={1.75}
                      />
                    </span>

                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold">
                        {title}
                      </p>

                      <p className="max-w-xs text-sm leading-6 text-primary-foreground/75">
                        {description}
                      </p>
                    </div>
                  </div>
                ),
              )}
            </div>

            <div className="flex items-center gap-3 border-t border-primary-foreground/20 pt-6 text-sm text-primary-foreground/80">
              <span>From pickup to doorstep</span>
              <ArrowRight
                aria-hidden="true"
                className="size-4"
              />
            </div>
          </aside>

          <section className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
            <div className="w-full max-w-sm">
              {children}
            </div>
          </section>
        </div>
      </div>

      <footer className="px-6 pb-6 text-center text-xs text-muted-foreground">
        CourierFlow · Your courier workspace
      </footer>
    </main>
  );
}
