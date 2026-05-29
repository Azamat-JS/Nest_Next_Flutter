import { TableSkeleton } from "@/components/utils/TableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-44" />
            </div>
            <TableSkeleton rows={10} cols={6} />
        </div>
    )
}