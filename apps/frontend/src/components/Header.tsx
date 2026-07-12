'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { ModeToggle } from "./mode-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { DropdownMenuDemo } from "./DropDownMenu"
import { GraduationCap } from "lucide-react"
import { useAuthStore } from "@/lib/stores/authStore"

const navLinks = [
    { key: 'users', href: '/home' },
    { key: 'groups', href: '/groups' },
    { key: 'payments', href: '/payments' },
    { key: 'leaderboard', href: '/leaderboard' },
    { key: 'profile', href: '/profile' },
] as const

export const Header = () => {
    const pathname = usePathname()
    const t = useTranslations('Header.nav')
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const mustChangePassword = useAuthStore((state) => state.mustChangePassword)
    const role = useAuthStore((state) => state.role)

    // The Telegram mini app has its own bottom navigation.
    if (pathname.startsWith('/tg')) return null
    if (!isAuthenticated) return null
    if (mustChangePassword) return null

    const visibleLinks = role === 'STUDENT'
        ? navLinks.filter((link) => link.key !== 'users' && link.key !== 'payments')
        : navLinks

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
                <Link href="/home" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span>EduCenter</span>
                </Link>

                <nav className="flex items-center gap-1">
                    {visibleLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.key}
                                href={link.href}
                                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {t(link.key)}
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <LanguageSwitcher />
                    <DropdownMenuDemo />
                </div>
            </div>
        </header>
    )
}

export default Header
