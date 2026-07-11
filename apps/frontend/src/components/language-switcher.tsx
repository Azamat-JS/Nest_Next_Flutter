"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, Languages } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { setLocale } from "@/i18n/actions"
import { localeNames, locales, type Locale } from "@/i18n/config"

export function LanguageSwitcher() {
    const locale = useLocale()
    const t = useTranslations("LanguageSwitcher")
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const selectLocale = (next: Locale) => {
        if (next === locale) return
        startTransition(async () => {
            await setLocale(next)
            router.refresh()
        })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    isPending && "pointer-events-none opacity-50"
                )}
            >
                <Languages className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">{t("changeLanguage")}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
                {locales.map((code) => (
                    <DropdownMenuItem key={code} onClick={() => selectLocale(code)}>
                        <span className="flex-1">{localeNames[code]}</span>
                        {code === locale && <Check className="ml-2 h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
