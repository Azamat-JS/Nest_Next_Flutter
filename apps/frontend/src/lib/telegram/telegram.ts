// Typed access to the Telegram WebApp SDK injected by telegram-web-app.js.
// https://core.telegram.org/bots/webapps

export interface TelegramWebApp {
    initData: string
    colorScheme: 'light' | 'dark'
    ready: () => void
    expand: () => void
    onEvent: (event: string, handler: () => void) => void
    offEvent: (event: string, handler: () => void) => void
}

declare global {
    interface Window {
        Telegram?: { WebApp?: TelegramWebApp }
    }
}

export function getTelegramWebApp(): TelegramWebApp | null {
    if (typeof window === 'undefined') return null
    return window.Telegram?.WebApp ?? null
}

// initData is empty when the page is opened outside Telegram.
export function isInsideTelegram(): boolean {
    return !!getTelegramWebApp()?.initData
}
