import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.045]",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/[0.09] before:to-transparent",
        className
      )}
    />
  );
}

export function SkeletonLine({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-3 rounded-full", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl", className)}>
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <SkeletonLine className="h-4 w-2/3" />
          <SkeletonLine className="w-1/2" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <SkeletonLine className="w-full" />
        <SkeletonLine className="w-5/6" />
        <SkeletonLine className="w-3/5" />
      </div>
    </div>
  );
}
