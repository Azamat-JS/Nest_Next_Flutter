'use client'

import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import Spinner from "@/components/utils/Spinner"

const RoomsSettings = dynamic(() => import("@/components/settings/RoomsSettings"), { ssr: false })

export default function RoomsSettingsPage() {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <RoomsSettings />
            </Suspense>
        </ErrorBoundary>
    )
}
