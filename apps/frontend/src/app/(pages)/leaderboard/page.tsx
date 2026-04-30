import ErrorHandler from "@/components/utils/ErrorHandler";
import Spinner from "@/components/utils/Spinner";
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import LeaderBoardContent from "@/components/pageContents/LeaderBoardContent";

const AllStudentsLeaderboard = () => {

    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <LeaderBoardContent />
            </Suspense>
        </ErrorBoundary >
    )
}

export default AllStudentsLeaderboard;