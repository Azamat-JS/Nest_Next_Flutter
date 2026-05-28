import Profile from "@/components/pageContents/Profile"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import ErrorHandler from "@/components/utils/ErrorHandler";
import { SkeletonDemo } from "@/components/utils/Skeleton";

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