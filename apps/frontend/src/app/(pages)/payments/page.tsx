'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"
import { RequireStaff } from "@/components/RequireStaff"

const PaymentsComponent = dynamic(
    () => import('@/components/pageContents/PaymentsComponent'),
    { ssr: false }
)

const PaymentsPage = () => {
    return (
        <RequireStaff>
            <ErrorBoundary fallback={<ErrorHandler />}>
                <Suspense fallback={<SkeletonDemo />}>
                    <PaymentsComponent />
                </Suspense>
            </ErrorBoundary>
        </RequireStaff>
    )
}

export default PaymentsPage
