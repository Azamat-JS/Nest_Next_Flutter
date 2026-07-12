'use client'

import { useAuthStore } from '@/lib/stores/authStore'
import { usePathname } from 'next/navigation'
import { LoginForm } from '@/components/LoginForm'
import ChangePasswordScreen from '@/components/pageContents/ChangePasswordScreen'
import { GraduationCap } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AuthGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const mustChangePassword = useAuthStore((state) => state.mustChangePassword)
    const t = useTranslations('LoginForm')

    // The Telegram mini app has its own auth flow.
    if (pathname.startsWith('/tg')) return <>{children}</>

    if (isAuthenticated && mustChangePassword) return <ChangePasswordScreen />

    if (isAuthenticated) return <>{children}</>

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <div className="flex flex-col items-center gap-8 w-full max-w-sm px-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                        <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">EduCenter</h1>
                    <p className="text-muted-foreground text-sm">
                        {t('tagline')}
                    </p>
                </div>
                <LoginForm id="auth-form" />
            </div>
        </div>
    )
}
