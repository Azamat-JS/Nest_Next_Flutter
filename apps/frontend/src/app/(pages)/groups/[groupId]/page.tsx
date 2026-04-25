import GroupDetailsComponent from "@/components/pageContents/GroupDetailsComponent";
import Spinner from "@/components/utils/Spinner";
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import ErrorHandler from "@/components/utils/ErrorHandler";
import { SkeletonDemo } from "@/components/utils/Skeleton";

const GroupDetails = async ({ params }: { params: Promise<{ groupId: string }> }) => {
    const groupId = (await params).groupId;
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <GroupDetailsComponent groupId={groupId} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default GroupDetails