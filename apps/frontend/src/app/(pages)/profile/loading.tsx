import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="flex justify-center">
            <div className="w-full max-w-md space-y-4 rounded-xl border p-6">
                <div className="flex flex-col items-center gap-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                        <Skeleton className="h-4 w-4 shrink-0 rounded" />
                        <div className="space-y-1 flex-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-36" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}