import type { Metadata } from "next";
import { redirect } from "next/navigation";


import { getCurrentUser } from "@/lib/auth-server";
import { LogoutButton } from "@/component/auth/Logout-button";

export const metadata: Metadata = {
  title: "Your account",
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Your account
        </h1>

        <LogoutButton />
      </header>

      <dl className="grid gap-6 rounded-xl border bg-card p-6 sm:grid-cols-2">
        {Object.entries({
          Name: user.name,
          Email: user.email,
          Role: user.role,
        }).map(([label, value]) => (
          <div
            key={label}
            className="flex min-w-0 flex-col gap-1"
          >
            <dt className="text-sm text-muted-foreground">
              {label}
            </dt>

            <dd className="break-words font-medium">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
