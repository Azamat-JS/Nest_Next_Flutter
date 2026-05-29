import { TableSkeleton } from "@/components/utils/TableSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="space-y-6">
            {/* group header badges */}
            <div className="flex justify-center gap-3">
                <Skeleton className="h-8 w-32 rounded-full" />
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            {/* avg badges */}
            <div className="flex justify-center gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-7 w-44 rounded-full" />
                ))}
            </div>
            <TableSkeleton rows={8} cols={7} />
        </div>
    )
}