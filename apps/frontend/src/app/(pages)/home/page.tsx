import Home from "@/components/pageContents/Home"
import ErrorHandler from "@/components/utils/ErrorHandler";
import Spinner from "@/components/utils/Spinner";
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";

const HomePage = () => {
    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <Home />
            </Suspense>
        </ErrorBoundary >
    )
}

export default HomePage