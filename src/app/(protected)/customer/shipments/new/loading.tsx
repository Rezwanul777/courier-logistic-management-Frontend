/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */

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

export default function CreateShipmentLoading() {
  return (
    <div
      role="status"
      aria-label="Loading shipment form"
      className="space-y-7"
    >
      <div className="space-y-4">
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-14 w-full"
          />
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <Skeleton className="h-7 w-72 max-w-full" />

        <div className="mt-9 space-y-8">
          {Array.from({ length: 2 }, (_, group) => (
            <div key={group} className="space-y-5">
              <Skeleton className="h-5 w-40" />

              <div className="grid gap-5 sm:grid-cols-2">
                {Array.from(
                  { length: 4 },
                  (_, index) => (
                    <div
                      key={index}
                      className="space-y-3"
                    >
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-9 flex gap-3 border-t border-slate-100 pt-6">
          <Skeleton className="h-11 w-28" />
          <Skeleton className="h-11 w-32" />
        </div>
      </div>

      <span className="sr-only">
        Preparing your shipment form.
      </span>
    </div>
  );
}
