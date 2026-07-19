'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"
import { RequireStaff } from "@/components/RequireStaff"

const DashboardComponent = dynamic(
    () => import('@/components/pageContents/DashboardComponent'),
    { ssr: false }
)

const Dashboard = () => {
    return (
        <RequireStaff>
            <ErrorBoundary fallback={<ErrorHandler />}>
                <Suspense fallback={<SkeletonDemo />}>
                    <DashboardComponent />
                </Suspense>
            </ErrorBoundary>
        </RequireStaff>
    )
}

export default Dashboard
