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

export default function AdminOverviewLoading() {
  return (
    <div
      role="status"
      aria-label="Loading Admin operations overview"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="space-y-5 rounded-xl border border-slate-200 bg-white p-6"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-48 w-full" />
        </div>

        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
          <Skeleton className="h-6 w-40" />

          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-14 w-full"
            />
          ))}
        </div>
      </div>

      <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-6 w-44" />

        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-10 w-full"
          />
        ))}
      </div>

      <span className="sr-only">
        Loading operational statistics.
      </span>
    </div>
  );
}
