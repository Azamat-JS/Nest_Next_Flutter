'use client'

import { usePlatformAuthStore } from '@/lib/stores/platformAuthStore'
import { SuperAdminLoginForm } from '@/components/SuperAdminLoginForm'
import TenantDashboard from '@/components/pageContents/TenantDashboard'
import ErrorHandler from '@/components/utils/ErrorHandler'
import Spinner from '@/components/utils/Spinner'
import { ErrorBoundary } from 'react-error-boundary'
import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'

export default function SuperAdminPage() {
    const isPlatformAuthenticated = usePlatformAuthStore((state) => state.isPlatformAuthenticated)

    if (!isPlatformAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex flex-col items-center gap-8 w-full max-w-sm px-4">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                            <ShieldCheck className="h-7 w-7 text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">SuperAdmin</h1>
                        <p className="text-muted-foreground text-sm">
                            Platform-wide education center management
                        </p>
                    </div>
                    <SuperAdminLoginForm />
                </div>
            </div>
        )
    }

    return (
        <ErrorBoundary fallback={<ErrorHandler />}>
            <Suspense fallback={<Spinner />}>
                <TenantDashboard />
            </Suspense>
        </ErrorBoundary>
    )
}
