import { LoginForm } from "@/component/auth/Login-Form";
import { PackageCheck, Truck } from "lucide-react";
import type { Metadata } from "next";


export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex xl:p-16">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <Truck aria-hidden="true" className="size-7" />
          CourierFlow
        </div>

        <div className="flex max-w-lg flex-col gap-6 py-16">
          <PackageCheck
            aria-hidden="true"
            className="size-12"
            strokeWidth={1.5}
          />

          <h2 className="text-5xl leading-tight font-semibold tracking-tight xl:text-6xl">
            Every delivery starts with a clear plan.
          </h2>

          <p className="max-w-sm text-lg leading-relaxed opacity-85">
            Manage shipments, delivery tasks and operations
            in one place.
          </p>
        </div>

        <p className="text-sm opacity-75">
          Courier logistics management
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="flex w-full max-w-sm flex-col gap-9">
          <div className="flex items-center gap-2 text-lg font-semibold lg:hidden">
            <Truck
              aria-hidden="true"
              className="size-6 text-primary"
            />
            CourierFlow
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">
              Welcome back
            </h1>

            <p className="text-sm leading-relaxed text-muted-foreground">
              Sign in to your courier workspace.
            </p>
          </div>

          <LoginForm />

          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Use the email address associated with your
            verified account.
          </p>
        </div>
      </section>
    </main>
  );
}
