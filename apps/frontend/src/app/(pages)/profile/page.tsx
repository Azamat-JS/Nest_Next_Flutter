'use client'

import dynamic from 'next/dynamic'
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react"
import ErrorHandler from "@/components/utils/ErrorHandler"
import { SkeletonDemo } from "@/components/utils/Skeleton"

const Profile = dynamic(
    () => import('@/components/pageContents/Profile'),
    { ssr: false }
)

const ProfilePage = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <Profile />
            </Suspense>
        </ErrorBoundary>
    )
}

export default ProfilePage
