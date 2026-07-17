import { Skeleton } from "@/shared/ui/skeleton";
import { cn } from "@/shared/lib/utils";

// Shared skeleton building blocks used while data is loading. They mirror the
// real layouts closely enough that content doesn't jump in when it arrives.

// Big page heading placeholder (e.g. "F1 Drivers 2026").
export function PageTitleSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-56 sm:w-72 mt-3 mb-8", className)} />;
}

// A tall driver/team grid card placeholder (real cards are h-70).
export function GridCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-70 rounded-lg p-4 overflow-hidden bg-muted/60",
        className,
      )}
    >
      <Skeleton className="h-7 w-40 mb-3 bg-foreground/10" />
      <Skeleton className="h-4 w-28 mb-2 bg-foreground/10" />
      <Skeleton className="h-9 w-16 bg-foreground/10" />
      <Skeleton className="absolute bottom-0 right-8 h-52 w-32 rounded-md bg-foreground/10" />
    </div>
  );
}

// A grid of GridCardSkeletons. Pass the same grid classes the real grid uses.
export function GridCardsSkeleton({
  count = 8,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <GridCardSkeleton key={i} />
      ))}
    </div>
  );
}

// A single table-row placeholder with a configurable number of cells.
export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border/50">
      <Skeleton className="h-4 w-6 shrink-0" />
      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
      <Skeleton className="h-4 flex-1 max-w-40" />
      {Array.from({ length: Math.max(0, cols - 2) }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-12 ml-auto sm:ml-0" />
      ))}
    </div>
  );
}

// A stack of table rows for standings / results tables.
export function TableSkeleton({
  rows = 10,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/50 p-4", className)}>
      <div className="flex items-center gap-4 pb-3 mb-1 border-b border-border">
        <Skeleton className="h-3 w-6 shrink-0" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16 ml-auto" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </div>
  );
}
