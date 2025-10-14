import { Card, CardContent, CardHeader } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

export function NodeCardSkeleton() {
  return (
    <Card className="min-h-[420px] overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-3 rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-5 w-20 rounded-full" />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* CPU */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* 内存 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* 磁盘 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>

        <Skeleton className="h-px w-full" />

        {/* 网络 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-10" />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-1.5 py-0.5 whitespace-nowrap justify-between"
              >
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 px-1.5 py-0.5 whitespace-nowrap justify-between"
              >
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
