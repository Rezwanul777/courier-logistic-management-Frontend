/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-slate-200 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function ShipmentDetailsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading shipment details"
      className="space-y-7"
    >
      <header className="space-y-4">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-full max-w-md" />

        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-20 rounded-full" />
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <Skeleton className="mb-9 h-6 w-44" />

          <div className="space-y-9">
            {Array.from(
              { length: 5 },
              (_, index) => (
                <div
                  key={index}
                  className="flex gap-4"
                >
                  <Skeleton className="size-6 shrink-0 rounded-full" />

                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-full max-w-64" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
          <Skeleton className="mb-9 h-6 w-48" />

          <div className="space-y-7">
            {Array.from(
              { length: 5 },
              (_, index) => (
                <div
                  key={index}
                  className="space-y-3"
                >
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full max-w-64" />
                </div>
              ),
            )}
          </div>

          <Skeleton className="mt-8 h-11 w-full" />
        </section>
      </div>

      <span className="sr-only">
        Please wait while shipment information loads.
      </span>
    </div>
  );
}
