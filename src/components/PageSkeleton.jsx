import { Skeleton } from "@/components/ui/skeleton";

function HeaderSkeleton({ hasAction = true }) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      {hasAction && <Skeleton className="h-9 w-32" />}
    </div>
  );
}

function StatsRowSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-24 flex-1 min-w-[250px] rounded-lg" />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return <Skeleton className="h-80 w-full rounded-lg" />;
}

function ChartRowSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <Skeleton className="h-[260px] w-full rounded-lg" />
      <Skeleton className="h-[260px] w-full rounded-lg" />
    </div>
  );
}

export function PageSkeleton({ layout = "table", statsCount = 4, hasAction = true }) {
  return (
    <div className="space-y-5">
      <HeaderSkeleton hasAction={hasAction} />
      <StatsRowSkeleton count={statsCount} />
      {layout === "table" && <TableSkeleton />}
      {layout === "charts" && (
        <>
          <ChartRowSkeleton />
          <ChartRowSkeleton />
        </>
      )}
      {layout === "cards" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      )}
    </div>
  );
}

export { HeaderSkeleton, StatsRowSkeleton, TableSkeleton, ChartRowSkeleton };
