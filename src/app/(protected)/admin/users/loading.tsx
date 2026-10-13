
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

export default function UsersLoading() {
  return (
    <div
      role="status"
      aria-label="Loading Admin users"
      className="space-y-7"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <Skeleton className="h-7 w-48" />

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-11 w-full"
            />
          ))}
        </div>

        <div className="mt-8 space-y-5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-14 w-full"
            />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Loading user records.
      </span>
    </div>
  );
}
