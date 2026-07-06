'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"

const PaymentsComponent = dynamic(
    () => import('@/components/pageContents/PaymentsComponent'),
    { ssr: false }
)

const PaymentsPage = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <PaymentsComponent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default PaymentsPage
