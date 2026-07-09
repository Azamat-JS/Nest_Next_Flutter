'use client'

import dynamic from 'next/dynamic'
import { use } from 'react'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"

const GroupAndLeaderboard = dynamic(
    () => import('@/components/pageContents/GroupAndLeaderboard'),
    { ssr: false }
)

const GroupDetails = ({ params }: { params: Promise<{ groupId: string }> }) => {
    const { groupId } = use(params)
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <GroupAndLeaderboard groupId={groupId} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default GroupDetails
