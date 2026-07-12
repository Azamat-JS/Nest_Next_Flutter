'use client'

import dynamic from "next/dynamic"
import ErrorHandler from "@/components/utils/ErrorHandler";
import Spinner from "@/components/utils/Spinner";
import { ErrorBoundary } from "react-error-boundary"
import { Suspense } from "react";
import { RequireStaff } from "@/components/RequireStaff";

const Home = dynamic(() => import("@/components/pageContents/Home"), { ssr: false })

const HomePage = () => {
    return (
        <RequireStaff>
            <ErrorBoundary fallback={<ErrorHandler />}>
                <Suspense fallback={<Spinner />}>
                    <Home />
                </Suspense>
            </ErrorBoundary >
        </RequireStaff>
    )
}

export default HomePage