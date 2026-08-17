import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ServicioCardSkeleton() {
  return (
    <Card className="h-full border-none py-0 ring-1 ring-border/70">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <Skeleton className="size-11 rounded-2xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="flex items-center justify-between border-t border-border/70 pt-4">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-5 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}
