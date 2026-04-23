import Spinner from "@/components/utils/Spinner";
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import ErrorHandler from "@/components/utils/ErrorHandler";
import StudentScoresComponent from "@/components/pageContents/StudentScoresComponent";

const StudentScores = async ({ params }: { params: Promise<{ studentId: string, groupId: string }> }) => {
    const studentId = (await params).studentId;
    const groupId = (await params).groupId;
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <StudentScoresComponent studentId={studentId} groupId={groupId} />
            </Suspense>
        </ErrorBoundary>
    )
}

export default StudentScores