'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import Spinner from "@/components/utils/Spinner"

const LeaderBoardContent = dynamic(
    () => import('@/components/pageContents/LeaderBoardContent'),
    { ssr: false }
)

const AllStudentsLeaderboard = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <LeaderBoardContent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default AllStudentsLeaderboard;
