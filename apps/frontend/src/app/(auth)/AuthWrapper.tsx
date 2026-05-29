'use client'

import { useAuthStore } from '@/lib/stores/authStore'
import { useState } from 'react'
import { CardDemo } from '@/components/AuthForm'
import { GraduationCap } from 'lucide-react'
import dynamic from 'next/dynamic'

const HomePage = dynamic(() => import('../(pages)/home/page'), { ssr: false })

export default function AuthWrapper() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const [isLogin, setIsLogin] = useState(true)

    if (isAuthenticated) return <HomePage />

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
            <div className="flex flex-col items-center gap-8 w-full max-w-sm px-4">
                <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-primary/10">
                        <GraduationCap className="h-7 w-7 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">EduCenter</h1>
                    <p className="text-muted-foreground text-sm">
                        Student score tracking and management platform
                    </p>
                </div>
                <CardDemo
                    isLogin={isLogin}
                    id="auth-form"
                    toggle={() => setIsLogin(prev => !prev)}
                />
            </div>
        </div>
    )
}
