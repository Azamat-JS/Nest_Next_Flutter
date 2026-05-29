import { TableSkeleton } from "@/components/utils/TableSkeleton"

export default function Loading() {
    return (
        <div className="space-y-4">
            <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
            <TableSkeleton rows={10} cols={4} />
        </div>
    )
}