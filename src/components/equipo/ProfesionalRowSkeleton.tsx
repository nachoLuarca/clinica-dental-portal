import { Skeleton } from "@/components/ui/skeleton"

export function ProfesionalRowSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:gap-6">
      <Skeleton className="size-16 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-6 w-48 rounded-md" />
        <Skeleton className="h-3 w-32 rounded-full" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <Skeleton className="h-10 w-40 shrink-0 rounded-full" />
    </div>
  )
}
