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

export default function AdminShipmentsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading Admin shipments"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid gap-4 p-6 md:grid-cols-3">
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
          <Skeleton className="h-11" />
        </div>

        <div className="flex gap-5 border-y border-slate-100 px-6 py-5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-4 w-28"
            />
          ))}
        </div>

        <div className="space-y-5 p-6">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-12 w-full"
            />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading shipment records.
      </span>
    </div>
  );
}
