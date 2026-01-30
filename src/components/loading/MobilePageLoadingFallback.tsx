import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading fallback otimizado para mobile
 * Layout compacto com animação rápida
 */
export function MobilePageLoadingFallback() {
  return (
    <div className="flex flex-col gap-3 p-4 animate-in fade-in-0 duration-200">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* KPI Cards skeleton - 2x2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-lg p-3 border">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="bg-card rounded-lg p-3 border">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-24 w-full" />
      </div>

      {/* List items skeleton */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-2 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
