import { Skeleton, SkeletonCard, SkeletonLine } from "@/components/ui/Skeleton";

export function SupportAgentDashboardSkeleton() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Skeleton className="h-7 w-48 rounded-full" />
              <div className="space-y-3">
                <SkeletonLine className="h-8 w-72 max-w-[80vw] sm:h-12 sm:w-[28rem]" />
                <SkeletonLine className="w-[34rem] max-w-full" />
                <SkeletonLine className="w-80 max-w-[80vw]" />
              </div>
            </div>
            <Skeleton className="h-12 w-40 rounded-2xl" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <div className="flex items-center justify-between gap-3">
                <SkeletonLine className="w-28" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <SkeletonLine className="mt-5 h-8 w-20" />
            </div>
          ))}
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </section>
      </div>
    </main>
  );
}

export function SupportAgentWorkspaceSkeleton() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#030305] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <Skeleton className="h-11 w-32 rounded-full" />
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Skeleton className="h-7 w-44 rounded-full" />
              <SkeletonLine className="h-9 w-72 max-w-[80vw] sm:h-12 sm:w-96" />
              <SkeletonLine className="w-[36rem] max-w-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-32 rounded-2xl" />
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
              <SkeletonLine className="w-36" />
              <SkeletonLine className="mt-5 h-8 w-16" />
            </div>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <SkeletonCard className="min-h-[26rem]" />
          <SkeletonCard className="min-h-[26rem]" />
        </section>
      </div>
    </main>
  );
}
