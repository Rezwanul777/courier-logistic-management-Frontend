"use client";

import { Button } from "@/components/ui/button";

export default function AccountError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">
        We could not load your account
      </h1>

      <p className="text-muted-foreground">
        The courier service may be unavailable.
        Please try again.
      </p>

      <Button className="w-fit" onClick={reset}>
        Try again
      </Button>
    </main>
  );
}
