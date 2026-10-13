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

export default function RatesLoading() {
  return (
    <div
      role="status"
      aria-label="Loading rate cards"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72 max-w-full" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-7 w-48" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-11 w-full"
            />
          ))}
        </div>

        <Skeleton className="mt-6 h-11 w-40" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-7 w-52" />

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-11 w-full"
            />
          ))}
        </div>

        <div className="mt-8 space-y-5">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-12 w-full"
            />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading shipping rate records.
      </span>
    </div>
  );
}
