import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonDemo() {
    return (
        <div className="flex justify-center min-h-screen gap-4">
            <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-62.5 bg-slate-200" />
                <Skeleton className="h-4 w-50 bg-slate-200" />
            </div>
        </div>
    )
}
