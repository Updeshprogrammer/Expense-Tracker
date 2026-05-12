import { Skeleton } from '@/components/ui/Skeleton';

export function ChartSkeleton() {
  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:mb-8 sm:p-6">
      <Skeleton className="mb-6 h-7 w-56 sm:h-8" />
      <Skeleton className="mx-auto aspect-square w-[min(100%,280px)] rounded-full sm:w-[320px]" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="pb-2 pt-2 sm:py-8 sm:pb-8">
      <div className="mb-6 sm:mb-8">
        <Skeleton className="mb-3 h-9 w-3/4 max-w-md sm:h-11" />
        <Skeleton className="h-5 w-2/3 max-w-sm" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-6"
          >
            <div className="mb-4 flex justify-between">
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="h-8 w-36" />
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:mb-8 sm:p-6">
        <Skeleton className="mb-6 h-7 w-48 sm:h-8" />
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Skeleton className="mx-auto aspect-square w-[min(100%,280px)] max-w-[280px] rounded-full sm:max-w-none" />
          <div className="flex w-full flex-col gap-2 sm:max-w-xs">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <Skeleton className="mb-6 h-7 w-40" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-lg dark:border-gray-700 dark:bg-gray-800 sm:p-8">
          <Skeleton className="mb-6 h-7 w-44" />
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto mt-4 h-4 w-48" />
          <Skeleton className="mx-auto mt-6 h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
