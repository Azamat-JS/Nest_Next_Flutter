'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"

const GroupComponent = dynamic(
    () => import('@/components/pageContents/Group'),
    { ssr: false }
)

const GroupsPage = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <GroupComponent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default GroupsPage
