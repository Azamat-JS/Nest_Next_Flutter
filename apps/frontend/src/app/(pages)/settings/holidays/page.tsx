'use client'

import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import Spinner from "@/components/utils/Spinner"

const HolidaysSettings = dynamic(() => import("@/components/settings/HolidaysSettings"), { ssr: false })

export default function HolidaysSettingsPage() {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <HolidaysSettings />
            </Suspense>
        </ErrorBoundary>
    )
}
