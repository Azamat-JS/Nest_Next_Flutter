"use client"

import { useCallback, useEffect } from "react"
import Script from "next/script"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Users, Wallet, Trophy, Loader2, Sun, Moon } from "lucide-react"
import axios from "axios"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/stores/authStore"
import { useTgStore } from "@/lib/stores/tgStore"
import { getTelegramWebApp } from "@/lib/telegram/telegram"

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
    const { status, error, setStatus, selectedGroupId, selectedStudentId } = useTgStore()
    const setToken = useAuthStore((s) => s.setToken)
    const { theme, setTheme } = useTheme()
    const pathname = usePathname()
    const t = useTranslations('TgLayout')

    const authenticate = useCallback(async () => {
        if (useTgStore.getState().status === 'ready') return // already authed; don't re-sync theme over a manual toggle

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
                ? err.response?.data?.message ?? t('connectionError')
                : t('connectionError')
            setStatus('error', message)
        }
    }, [setStatus, setTheme, setToken, t])

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
                        <p className="text-lg font-semibold">{t('outsideTitle')}</p>
                        <p className="text-sm text-muted-foreground">{t('outsideDescription')}</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <p className="text-lg font-semibold">{t('errorTitle')}</p>
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
        { name: t('tabGroup'), href: groupHref, icon: Users, active: pathname === '/tg' || pathname.startsWith('/tg/groups') },
        { name: t('tabPayments'), href: '/tg/payments', icon: Wallet, active: pathname === '/tg/payments' },
        { name: t('tabLeaderboard'), href: '/tg/leaderboard', icon: Trophy, active: pathname === '/tg/leaderboard' },
    ]

    return (
        <div className="mx-auto w-full max-w-lg pb-20">
            <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={t('toggleTheme')}
                className="fixed right-4 top-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
            >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
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
