import { TableSkeleton } from "@/components/utils/TableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-36" />
            </div>
            <TableSkeleton rows={10} cols={7} />
            <div className="rounded-lg border p-4">
                <Skeleton className="h-72 w-full" />
            </div>
        </div>
    )
}