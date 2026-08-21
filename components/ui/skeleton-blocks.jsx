import { Skeleton } from '@/components/ui/skeleton'

export const SkeletonText = ({ className = 'h-4 w-40' }) => (
  <Skeleton className={className} />
)

export const SkeletonAvatar = ({ className = 'size-10 rounded-full' }) => (
  <Skeleton className={className} />
)

export const SkeletonStatCard = () => (
  <div className="admin-stat-card rounded-xl p-5">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="mt-3 h-8 w-16" />
    <Skeleton className="mt-2 h-3 w-28" />
  </div>
)

export const SkeletonCard = ({ className = '' }) => (
  <div className={`admin-panel rounded-xl p-5 ${className}`}>
    <Skeleton className="mb-4 h-4 w-32" />
    <Skeleton className="mb-2 h-3 w-full" />
    <Skeleton className="mb-2 h-3 w-5/6" />
    <Skeleton className="h-3 w-2/3" />
  </div>
)

export const SkeletonForm = ({ fields = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index}>
        <Skeleton className="mb-2 h-3 w-24" />
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    ))}
    <Skeleton className="h-11 w-full rounded-xl" />
  </div>
)

export const SkeletonTable = ({ rows = 6, cols = 5 }) => (
  <div className="admin-table-scroll rounded-xl">
    <div className="admin-table-wrap p-4">
      <div className="mb-4 flex gap-4">
        {Array.from({ length: cols }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, row) => (
          <div key={row} className="flex items-center gap-4">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            {Array.from({ length: cols - 1 }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export const SkeletonList = ({ rows = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="admin-panel flex items-center gap-3 rounded-xl p-4">
        <Skeleton className="size-10 shrink-0 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-16 rounded-lg" />
      </div>
    ))}
  </div>
)

export const SkeletonDashboard = () => (
  <div>
    <Skeleton className="mb-6 h-4 w-72" />
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonStatCard key={index} />
      ))}
    </div>
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonStatCard key={index} />
      ))}
    </div>
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Skeleton className="h-[320px] w-full rounded-xl" />
      <Skeleton className="mx-auto aspect-square max-h-[280px] w-full rounded-xl" />
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
)
