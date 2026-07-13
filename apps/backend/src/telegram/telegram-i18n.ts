// Translation strings for the bot's outgoing messages. Locales mirror the
// Mini App's (apps/frontend/src/i18n/config.ts): en/ru/uz, English default.

export type BotLanguage = 'en' | 'ru' | 'uz';

export const BOT_LANGUAGES: BotLanguage[] = ['en', 'ru', 'uz'];

export const BOT_LANGUAGE_LABELS: Record<BotLanguage, string> = {
    en: 'English',
    ru: 'Русский',
    uz: "O'zbekcha",
};

export function isBotLanguage(value: string | undefined): value is BotLanguage {
    return BOT_LANGUAGES.includes(value as BotLanguage);
}

interface Messages {
    sharePhonePrompt: string;
    sharePhoneButton: string;
    almostDone: string;
    connected: (firstName: string) => string;
    appComingSoon: (firstName: string) => string;
    openAppPrompt: string;
    openAppButton: string;
    ownContactOnly: string;
    confirmPhoneBelongsTo: (firstName: string) => string;
    notRegistered: string;
    notAPhoneNumber: string;
    wrongPassword: (attemptsLeft: number) => string;
    tooManyAttempts: string;
    languagePrompt: string;
    languageChanged: (label: string) => string;
}

const messages: Record<BotLanguage, Messages> = {
    en: {
        sharePhonePrompt: 'Welcome! To connect your account, share your phone number with the button below, or type it like +998901234567.',
        sharePhoneButton: '📱 Share my phone number',
        almostDone: 'Almost done! Please type your account password to confirm the phone number, or share your contact with the button instead.',
        connected: (firstName) => `You are connected, ${firstName}! ✅`,
        appComingSoon: (firstName) => `You are connected, ${firstName}! The app will be available here soon.`,
        openAppPrompt: 'Tap the button below to open the app:',
        openAppButton: '🚀 Open App',
        ownContactOnly: 'Please share your own contact using the button below, or type your phone number.',
        confirmPhoneBelongsTo: (firstName) => `This number belongs to ${firstName}. To confirm it is really you, please type your account password (the one used to sign in). Sharing your contact with the button instead confirms instantly.`,
        notRegistered: 'This phone number is not registered in the system. Please contact your learning centre, then try again.',
        notAPhoneNumber: 'That does not look like a phone number. Please type it like +998901234567, or use the share button.',
        wrongPassword: (attemptsLeft) => `Wrong password, please try again (${attemptsLeft} attempts left). You can also share your contact with the button instead.`,
        tooManyAttempts: 'Too many wrong attempts. Please share your contact with the button, or start over with your phone number.',
        languagePrompt: 'Please choose your language:',
        languageChanged: (label) => `Language updated to ${label} ✅`,
    },
    ru: {
        sharePhonePrompt: 'Добро пожаловать! Чтобы привязать аккаунт, поделитесь номером телефона с помощью кнопки ниже, или введите его в формате +998901234567.',
        sharePhoneButton: '📱 Поделиться номером телефона',
        almostDone: 'Почти готово! Введите пароль от вашего аккаунта, чтобы подтвердить номер телефона, или поделитесь контактом с помощью кнопки.',
        connected: (firstName) => `Вы подключены, ${firstName}! ✅`,
        appComingSoon: (firstName) => `Вы подключены, ${firstName}! Приложение скоро будет доступно здесь.`,
        openAppPrompt: 'Нажмите кнопку ниже, чтобы открыть приложение:',
        openAppButton: '🚀 Открыть приложение',
        ownContactOnly: 'Пожалуйста, поделитесь своим собственным контактом с помощью кнопки ниже, или введите номер телефона.',
        confirmPhoneBelongsTo: (firstName) => `Этот номер принадлежит ${firstName}. Чтобы подтвердить, что это действительно вы, введите пароль от аккаунта (тот, что используется для входа). Либо поделитесь контактом с помощью кнопки для мгновенного подтверждения.`,
        notRegistered: 'Этот номер телефона не зарегистрирован в системе. Пожалуйста, обратитесь в ваш учебный центр и попробуйте снова.',
        notAPhoneNumber: 'Это не похоже на номер телефона. Введите его в формате +998901234567, или используйте кнопку "Поделиться".',
        wrongPassword: (attemptsLeft) => `Неверный пароль, попробуйте снова (осталось попыток: ${attemptsLeft}). Вы также можете поделиться контактом с помощью кнопки.`,
        tooManyAttempts: 'Слишком много неверных попыток. Поделитесь контактом с помощью кнопки, или начните заново с номера телефона.',
        languagePrompt: 'Выберите язык:',
        languageChanged: (label) => `Язык изменён на ${label} ✅`,
    },
    uz: {
        sharePhonePrompt: "Xush kelibsiz! Hisobingizni ulash uchun quyidagi tugma orqali telefon raqamingizni ulashing, yoki uni +998901234567 ko'rinishida yozing.",
        sharePhoneButton: '📱 Telefon raqamimni ulashish',
        almostDone: "Deyarli tayyor! Telefon raqamini tasdiqlash uchun hisobingiz parolini yozing, yoki tugma orqali kontaktingizni ulashing.",
        connected: (firstName) => `Siz ulandingiz, ${firstName}! ✅`,
        appComingSoon: (firstName) => `Siz ulandingiz, ${firstName}! Ilova tez orada shu yerda mavjud bo'ladi.`,
        openAppPrompt: "Ilovani ochish uchun quyidagi tugmani bosing:",
        openAppButton: "🚀 Ilovani ochish",
        ownContactOnly: "Iltimos, quyidagi tugma orqali o'zingizning kontaktingizni ulashing, yoki telefon raqamingizni yozing.",
        confirmPhoneBelongsTo: (firstName) => `Bu raqam ${firstName}ga tegishli. Bu haqiqatan ham siz ekanligingizni tasdiqlash uchun hisobingiz parolini yozing (tizimga kirishda ishlatiladigan parol). Tugma orqali kontaktingizni ulashish esa darhol tasdiqlaydi.`,
        notRegistered: "Bu telefon raqami tizimda ro'yxatdan o'tmagan. Iltimos, o'quv markazingizga murojaat qiling va qaytadan urinib ko'ring.",
        notAPhoneNumber: "Bu telefon raqamiga o'xshamaydi. Uni +998901234567 ko'rinishida yozing, yoki ulashish tugmasidan foydalaning.",
        wrongPassword: (attemptsLeft) => `Parol noto'g'ri, qaytadan urinib ko'ring (qolgan urinishlar: ${attemptsLeft}). Shuningdek, tugma orqali kontaktingizni ulashishingiz mumkin.`,
        tooManyAttempts: "Noto'g'ri urinishlar soni ko'p. Tugma orqali kontaktingizni ulashing, yoki telefon raqamidan qaytadan boshlang.",
        languagePrompt: 'Tilni tanlang:',
        languageChanged: (label) => `Til ${label} ga o'zgartirildi ✅`,
    },
};

export function t<K extends keyof Messages>(
    lang: BotLanguage,
    key: K,
    ...args: Messages[K] extends (...a: infer A) => string ? A : []
): string {
    const entry = messages[lang][key] ?? messages.en[key];
    return typeof entry === 'function' ? (entry as (...a: unknown[]) => string)(...args) : (entry as string);
}
