'use client'

import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import Spinner from "@/components/utils/Spinner"

const CoursesSettings = dynamic(() => import("@/components/settings/CoursesSettings"), { ssr: false })

export default function CoursesSettingsPage() {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <CoursesSettings />
            </Suspense>
        </ErrorBoundary>
    )
}
