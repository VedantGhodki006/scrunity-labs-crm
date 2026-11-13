import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CrmDashboardSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i} size="sm">
            <CardHeader className="gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
