'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "./mode-toggle"
import { DropdownMenuDemo } from "./DropDownMenu"
import { GraduationCap } from "lucide-react"
import { useAuthStore } from "@/lib/stores/authStore"

const navLinks = [
    { name: 'Users', href: '/home' },
    { name: 'Groups', href: '/groups' },
    { name: 'Leaderboard', href: '/leaderboard' },
    { name: 'Profile', href: '/profile' },
]

export const Header = () => {
    const pathname = usePathname()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

    if (!isAuthenticated) return null

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
                <Link href="/home" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
                    <GraduationCap className="h-6 w-6 text-primary" />
                    <span>EduCenter</span>
                </Link>

                <nav className="flex items-center gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`relative px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                            >
                                {link.name}
                                {isActive && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-primary" />
                                )}
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <DropdownMenuDemo />
                </div>
            </div>
        </header>
    )
}

export default Header
