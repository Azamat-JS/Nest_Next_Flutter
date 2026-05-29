import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

const ErrorHandler = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <div>
                <h2 className="text-lg font-semibold">Something went wrong</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {message ?? "An unexpected error occurred. Please try again."}
                </p>
            </div>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>Try again</Button>
            )}
        </div>
    )
}

export default ErrorHandler
