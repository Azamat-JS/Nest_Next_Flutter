import { RouteLoader } from "@/components/shared/RouteLoader";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen">
            <RouteLoader label="Groups" />
        </div>
    )
}