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
      className={`animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none ${className}`}
    />
  );
}

export default function MyShipmentsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading shipments"
      className="space-y-6"
    >
      <div className="space-y-3">
        <Skeleton className="h-9 w-52" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <Skeleton className="h-11 w-40" />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="grid gap-4 border-b border-slate-100 p-6 sm:grid-cols-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>

        <div className="space-y-5 p-6">
          {Array.from({ length: 10 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-5"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="hidden h-5 w-40 sm:block" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="hidden h-5 w-20 md:block" />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 p-6">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>

      <span className="sr-only">
        Please wait while shipment records load.
      </span>
    </div>
  );
}
