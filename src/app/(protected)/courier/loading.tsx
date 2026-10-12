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

export default function CourierLoading() {
  return (
    <div
      role="status"
      aria-label="Loading courier tasks"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-9 w-12" />
            <Skeleton className="mt-3 h-4 w-36" />
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-11 w-64" />

        {Array.from({ length: 3 }, (_, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <Skeleton className="h-6 w-44" />
            <Skeleton className="mt-5 h-5 w-full max-w-md" />
            <Skeleton className="mt-5 h-24 w-full" />
          </div>
        ))}
      </div>

      <span className="sr-only">
        Loading courier task records.
      </span>
    </div>
  );
}
