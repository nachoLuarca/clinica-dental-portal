import { Skeleton } from "@/components/ui/skeleton"

export function ServicioCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex items-start gap-3.5 sm:items-center">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-6 w-48 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
      </div>
      <div className="flex items-center gap-4 pl-12.5 sm:pl-0">
        <div className="flex flex-col items-start gap-1.5 sm:items-end">
          <Skeleton className="h-3.5 w-12 rounded-full" />
          <Skeleton className="h-4.5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
