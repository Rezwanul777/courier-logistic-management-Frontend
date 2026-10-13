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

export default function HubsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading hubs and zones"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <Skeleton className="h-12 w-64" />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-11 w-full" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-7 w-48" />

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-7 w-48" />

        <div className="mt-6 space-y-5">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading location records.
      </span>
    </div>
  );
}
