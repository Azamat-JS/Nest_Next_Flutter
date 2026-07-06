import { TableSkeleton } from "@/components/utils/TableSkeleton"

export default function Loading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-muted animate-pulse" />
                <div className="space-y-1">
                    <div className="h-5 w-40 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-28 rounded bg-muted animate-pulse" />
                </div>
            </div>
            <TableSkeleton rows={10} cols={5} />
        </div>
    )
}
