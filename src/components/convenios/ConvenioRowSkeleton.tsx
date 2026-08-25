import { Skeleton } from "@/components/ui/skeleton"

export function ConvenioRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-5 sm:gap-6">
      <Skeleton className="size-14 shrink-0 rounded-2xl" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-16 rounded-full" />
        <Skeleton className="h-6 w-40 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
    </div>
  )
}
