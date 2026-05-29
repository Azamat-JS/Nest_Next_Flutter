import { Skeleton } from "@/components/ui/skeleton"

export function TableSkeleton({ rows = 8, cols = 5 }: { rows?: number; cols?: number }) {
    return (
        <div className="space-y-3">
            {/* header row */}
            <div className="flex gap-4 px-2">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-5 flex-1" />
                ))}
            </div>
            <div className="rounded-md border divide-y">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex gap-4 p-3">
                        {Array.from({ length: cols }).map((_, j) => (
                            <Skeleton key={j} className="h-4 flex-1" />
                        ))}
                    </div>
                ))}
            </div>
            {/* pagination */}
            <div className="flex justify-between items-center px-2 pt-1">
                <Skeleton className="h-8 w-36" />
                <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-8 w-8 rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    )
}
