# Translations

UI strings live in one JSON file per locale: `en.json` (source of truth), `ru.json`, `uz.json`.

## Adding a new string

1. Add the key to `en.json` under the component's namespace (e.g. `"LoginForm": { "submit": "Sign in" }`).
2. Add the same key with translated values to `ru.json` and `uz.json`.
3. Use it in a component:

```tsx
import { useTranslations } from 'next-intl'

const t = useTranslations('LoginForm')
// ...
<Button>{t('submit')}</Button>
```

Keys are type-checked against `en.json` (see `src/i18n/types.d.ts`), so a typo'd or missing key is a TypeScript error and editors autocomplete available keys.

## Adding a new language

1. Create `messages/<code>.json` (copy `en.json` and translate).
2. Add the code to `locales` and its native name to `localeNames` in `src/i18n/config.ts`.

Nothing else — the switcher dropdown and locale resolution pick it up automatically.

## How it works

The selected locale is stored in the `NEXT_LOCALE` cookie (set by the server action in `src/i18n/actions.ts`, defaults to `en`). `src/i18n/request.ts` reads it per request and loads the matching messages file. There is no locale prefix in URLs.
