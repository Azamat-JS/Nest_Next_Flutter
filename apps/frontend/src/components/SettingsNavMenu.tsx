'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const settingsGroups = [
    {
        key: 'office',
        items: [
            { key: 'courses', href: '/settings/courses' },
            { key: 'rooms', href: '/settings/rooms' },
            { key: 'holidays', href: '/settings/holidays' },
        ],
    },
    {
        key: 'general',
        items: [
            { key: 'general', href: '/settings' },
            { key: 'staff', href: '/settings/staff' },
            { key: 'roles', href: '/settings/roles' },
        ],
    },
] as const

export function SettingsNavMenu() {
    const pathname = usePathname()
    const t = useTranslations('Header.nav')
    const tGroups = useTranslations('Settings.groups')
    const tSidebar = useTranslations('Settings.sidebar')
    const isActive = pathname.startsWith('/settings')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={`group relative flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                >
                    {t('settings')}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {settingsGroups.map((group) => (
                    <DropdownMenuSub key={group.key}>
                        <DropdownMenuSubTrigger>{tGroups(group.key)}</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            {group.items.map((item) => (
                                <DropdownMenuItem
                                    key={item.key}
                                    asChild
                                    className={pathname === item.href ? 'bg-accent text-accent-foreground' : undefined}
                                >
                                    <Link href={item.href}>{tSidebar(item.key)}</Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SettingsNavMenu
