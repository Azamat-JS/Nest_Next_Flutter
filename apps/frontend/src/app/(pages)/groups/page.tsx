import GroupComponent from "@/components/pageContents/Group"
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import ErrorHandler from "@/components/utils/ErrorHandler";
import Spinner from "@/components/utils/Spinner";
const GroupsPage = async () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <GroupComponent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default GroupsPage