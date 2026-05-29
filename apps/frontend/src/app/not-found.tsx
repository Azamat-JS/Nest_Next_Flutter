import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <p className="text-6xl font-bold text-muted-foreground/30">404</p>
            <h2 className="text-xl font-semibold">Page not found</h2>
            <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
            <Button asChild variant="outline">
                <Link href="/home">Go home</Link>
            </Button>
        </div>
    )
}