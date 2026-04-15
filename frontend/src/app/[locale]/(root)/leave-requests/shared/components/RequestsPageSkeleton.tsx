import { Skeleton } from "@/components/ui/skeleton";

/**
 * RequestsPageSkeleton Component
 * Provides a high-fidelity loading state using skeletons.
 * Mirrors the Sovereign Workspace layout for a seamless transition.
 */
export default function RequestsPageSkeleton() {
  return (
    <div className="flex-1 p-8 max-w-[1600px] mx-auto overflow-y-auto min-h-screen animate-pulse">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-[250px] mb-2" />
        <Skeleton className="h-4 w-[400px]" />
      </div>

      {/* Main Content Grid (12 Columns) */}
      <div className="grid grid-cols-12 gap-8 mb-8">
        {/* LEFT COLUMN: Leave Balance (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex">
          <div className="w-full bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col border border-surface-container/50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48 mt-1" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
            </div>

            <div className="space-y-8 flex-1 flex flex-col justify-center">
              {/* Annual Leave Progress */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>

              {/* Taken & Remaining Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low/30 p-4 rounded-xl flex flex-col gap-1 border border-surface-container/30">
                  <Skeleton className="h-2 w-12" />
                  <div className="flex items-baseline gap-1">
                    <Skeleton className="h-7 w-8" />
                    <Skeleton className="h-2 w-8" />
                  </div>
                </div>
                <div className="bg-secondary/5 p-4 rounded-xl flex flex-col gap-1 border border-secondary/10">
                  <Skeleton className="h-2 w-16" />
                  <div className="flex items-baseline gap-1">
                    <Skeleton className="h-7 w-8" />
                    <Skeleton className="h-2 w-8" />
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button Skeleton */}
            <Skeleton className="h-10 w-full rounded-lg mt-8" />
          </div>
        </div>

        {/* RIGHT COLUMN: Status Grid (8 cols) */}
        <div className="col-span-12 lg:col-span-8">
          <div className="grid grid-cols-2 gap-6 h-full">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-surface-container-lowest rounded-xl p-6 shadow-sm flex flex-col justify-between border-l-4 border-surface-container/20"
              >
                <div className="flex justify-between items-center">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <Skeleton className="h-8 w-12" />
                </div>
                <div className="mt-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-32 mt-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Activity */}
      <div className="space-y-4">
        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden flex flex-col border border-surface-container/50">
          {/* Table Toolbar */}
          <div className="px-8 py-6 flex justify-between items-center bg-white border-b border-surface-container/50">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-4" />
          </div>

          <div className="p-8 space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
