import Spinner from "@/components/utils/Spinner"

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center h-screen w-full">
            <Spinner />
            <p className="mt-2 text-lg font-bold text-gray-500">Loading...</p>
        </div>
    )
}