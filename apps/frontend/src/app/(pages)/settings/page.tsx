'use client'

import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import Spinner from "@/components/utils/Spinner"

const GeneralSettings = dynamic(() => import("@/components/settings/GeneralSettings"), { ssr: false })

export default function GeneralSettingsPage() {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <GeneralSettings />
            </Suspense>
        </ErrorBoundary>
    )
}
