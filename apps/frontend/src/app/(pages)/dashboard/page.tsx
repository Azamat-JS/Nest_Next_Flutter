'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"

const DashboardComponent = dynamic(
    () => import('@/components/pageContents/DashboardComponent'),
    { ssr: false }
)

const Dashboard = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <DashboardComponent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default Dashboard
