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

export default function PaymentsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading your payments"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-6"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-11 w-full" />

        <div className="mt-6 space-y-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-12 w-full"
            />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading payment records.
      </span>
    </div>
  );
}
