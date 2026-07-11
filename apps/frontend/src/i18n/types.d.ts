import type { locales } from './config'
import type messages from '../../messages/en.json'

// English is the source of truth: every key added to messages/en.json
// becomes available (and type-checked) in useTranslations/getTranslations.
declare module 'next-intl' {
    interface AppConfig {
        Locale: (typeof locales)[number]
        Messages: typeof messages
    }
}
