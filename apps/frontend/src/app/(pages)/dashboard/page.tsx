import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import ErrorHandler from "@/components/utils/ErrorHandler";
import { SkeletonDemo } from "@/components/utils/Skeleton";
import DashboardComponent from "@/components/pageContents/DashboardComponent";
const Dashboard = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<SkeletonDemo />}>
                <DashboardComponent />
            </Suspense>
        </ErrorBoundary>
    )
}

export default Dashboard