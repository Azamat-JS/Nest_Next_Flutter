"use client"

import { useCallback, useEffect } from "react"
import Script from "next/script"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Users, Wallet, Trophy, Loader2 } from "lucide-react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/authStore"
import { useTgStore } from "@/lib/stores/tgStore"
import { getTelegramWebApp } from "@/lib/telegram/telegram"

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
    const { status, error, setStatus, selectedGroupId, selectedStudentId } = useTgStore()
    const setToken = useAuthStore((s) => s.setToken)
    const { setTheme } = useTheme()
    const pathname = usePathname()

    const authenticate = useCallback(async () => {
        const webApp = getTelegramWebApp()
        if (!webApp) return // script not loaded yet

        if (!webApp.initData) {
            setStatus('outside-telegram')
            return
        }

        webApp.ready()
        webApp.expand()
        setTheme(webApp.colorScheme)

        try {
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/telegram/auth`, {
                initData: webApp.initData,
            })
            setToken(res.data.accessToken, res.data.refreshToken)
            setStatus('ready')
        } catch (err) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message ?? 'Could not connect to the server'
                : 'Could not connect to the server'
            setStatus('error', message)
        }
    }, [setStatus, setTheme, setToken])

    // The SDK script may finish loading before or after this effect runs, so
    // authenticate is triggered from both places.
    useEffect(() => {
        authenticate()
    }, [authenticate])

    if (status !== 'ready') {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-center">
                <Script src="https://telegram.org/js/telegram-web-app.js" onLoad={authenticate} />
                {status === 'loading' && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
                {status === 'outside-telegram' && (
                    <>
                        <p className="text-lg font-semibold">This page only works inside Telegram</p>
                        <p className="text-sm text-muted-foreground">Open your learning centre&apos;s bot and tap the app button.</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p className="text-lg font-semibold">Could not sign you in</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                    </>
                )}
            </div>
        )
    }

    const groupHref = selectedGroupId
        ? `/tg/groups/${selectedGroupId}${selectedStudentId ? `?student=${selectedStudentId}` : ''}`
        : '/tg'
    const tabs = [
        { name: 'Group', href: groupHref, icon: Users, active: pathname === '/tg' || pathname.startsWith('/tg/groups') },
        { name: 'Payments', href: '/tg/payments', icon: Wallet, active: pathname === '/tg/payments' },
        { name: 'Leaderboard', href: '/tg/leaderboard', icon: Trophy, active: pathname === '/tg/leaderboard' },
    ]

    return (
        <div className="mx-auto w-full max-w-lg pb-20">
            {children}
            <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                <div className="mx-auto flex max-w-lg items-stretch justify-around">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors',
                                tab.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                            )}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.name}
                        </Link>
                    ))}
                </div>
            </nav>
        </div>
    )
}
