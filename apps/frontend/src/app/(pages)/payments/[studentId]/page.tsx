'use client'

import dynamic from 'next/dynamic'
import { use } from 'react'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"

const StudentPaymentHistory = dynamic(
    () => import('@/components/pageContents/StudentPaymentHistory'),
    { ssr: false }
)

const StudentPaymentPage = ({ params }: { params: Promise<{ studentId: string }> }) => {
    const { studentId } = use(params)
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <StudentPaymentHistory studentId={studentId} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default StudentPaymentPage
