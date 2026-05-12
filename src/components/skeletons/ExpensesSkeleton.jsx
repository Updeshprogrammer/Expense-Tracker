import { Skeleton } from '@/components/ui/Skeleton';

export function ExpensesSkeleton({ variant = 'full' }) {
  const showChrome = variant === 'full';

  return (
    <div>
      {showChrome && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="mb-2 h-9 w-48 sm:h-10" />
            <Skeleton className="h-5 w-64 max-w-full" />
          </div>
          <Skeleton className="h-12 w-full rounded-xl sm:w-44" />
        </div>
      )}

      {showChrome && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-blue-200/60 bg-gradient-to-r from-blue-50/80 to-purple-50/80 p-6 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-8 w-28" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-5 w-48 max-w-full" />
                <Skeleton className="h-4 w-3/4 max-w-xs" />
              </div>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="hidden h-4 w-24 sm:block" />
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-14" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
