import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface SectionLoadingFallbackProps {
  rows?: number;
  hasHeader?: boolean;
  className?: string;
}

export default function SectionLoadingFallback({ 
  rows = 3, 
  hasHeader = true,
  className = ""
}: SectionLoadingFallbackProps) {
  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader>
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-64 mt-2" />
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function KPILoadingFallback() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ChartLoadingFallback() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  );
}

export function TableLoadingFallback({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-4 w-[120px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
