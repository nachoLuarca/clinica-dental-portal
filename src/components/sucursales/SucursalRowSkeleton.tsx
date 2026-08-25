import { Skeleton } from "@/components/ui/skeleton"

export function SucursalRowSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-6">
      <Skeleton className="h-6 w-40 rounded-md" />
      <Skeleton className="h-4 w-56 rounded-md" />
      <Skeleton className="h-4 w-32 rounded-md" />
      <Skeleton className="h-4 w-48 rounded-md" />
    </div>
  )
}
