export const locales = ['en', 'ru', 'uz'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const LOCALE_COOKIE = 'NEXT_LOCALE'

// Native names shown in the language switcher — intentionally not translated.
export const localeNames: Record<Locale, string> = {
    en: 'English',
    ru: 'Русский',
    uz: "O'zbekcha",
}

export function isLocale(value: string | undefined): value is Locale {
    return locales.includes(value as Locale)
}
