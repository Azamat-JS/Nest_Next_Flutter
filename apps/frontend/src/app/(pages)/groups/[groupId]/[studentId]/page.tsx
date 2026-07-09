'use client'

import dynamic from 'next/dynamic'
import { use } from 'react'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import Spinner from "@/components/utils/Spinner"

const StudentScoresComponent = dynamic(
    () => import('@/components/pageContents/StudentScoresComponent'),
    { ssr: false }
)

const StudentScores = ({ params }: { params: Promise<{ studentId: string, groupId: string }> }) => {
    const { studentId, groupId } = use(params)
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <StudentScoresComponent studentId={studentId} groupId={groupId} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default StudentScores
