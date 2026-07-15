'use client'

import { useTranslations } from "next-intl"

const sections = ['general', 'staff', 'roles', 'courses', 'rooms', 'holidays'] as const

export function SettingsPlaceholder({ section }: { section: (typeof sections)[number] }) {
    const t = useTranslations('Settings')
    const tSidebar = useTranslations('Settings.sidebar')

    return (
        <div className="space-y-2 p-6">
            <h1 className="text-2xl font-semibold">{tSidebar(section)}</h1>
            <p className="text-muted-foreground">{t('comingSoon')}</p>
        </div>
    )
}

export default SettingsPlaceholder
