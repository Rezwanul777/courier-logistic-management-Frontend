/** biome-ignore-all lint/suspicious/noArrayIndexKey: <explanation> */
/** biome-ignore-all lint/a11y/useSemanticElements: <explanation> */

function SkeletonBlock({
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

export default function CustomerLoading() {
  return (
    <div
      role="status"
      aria-label="Loading customer dashboard"
      className="mx-auto w-full max-w-7xl space-y-8"
    >
      <div className="space-y-4">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-9 w-48" />
        <SkeletonBlock className="h-4 w-full max-w-sm" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-6"
          >
            <div className="flex justify-between gap-4">
              <div className="space-y-5">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-8 w-36" />
              </div>

              <SkeletonBlock className="size-11" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="space-y-3 border-b border-slate-100 p-6">
          <SkeletonBlock className="h-6 w-44" />
          <SkeletonBlock className="h-4 w-60 max-w-full" />
        </div>

        <div className="space-y-5 p-6">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-4"
            >
              <SkeletonBlock className="h-4 w-32" />
              <SkeletonBlock className="h-6 w-24" />
              <SkeletonBlock className="hidden h-4 w-24 sm:block" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading shipment information.
      </span>
    </div>
  );
}
