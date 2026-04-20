import GroupDetailsComponent from "@/components/pageContents/GroupDetailsComponent";
import Spinner from "@/components/utils/Spinner";
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import ErrorHandler from "@/components/utils/ErrorHandler";

const GroupDetails = async ({ params }: { params: Promise<{ groupId: string }> }) => {
    const groupId = (await params).groupId;
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <GroupDetailsComponent groupId={groupId} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default GroupDetails