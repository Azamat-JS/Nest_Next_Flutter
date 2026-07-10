// Users.phone is stored as +998XXXXXXXXX (see user DTO validation), but
// phones arrive in looser shapes: Telegram contact-share sends "998901234567"
// without the "+", and users type numbers with spaces, dashes or parentheses.
export function normalizePhone(input: string): string | null {
    const digits = input.replace(/[\s\-().]/g, '').replace(/^\+/, '');

    if (/^998\d{9}$/.test(digits)) {
        return `+${digits}`;
    }
    // Local format without country code, e.g. "901234567"
    if (/^\d{9}$/.test(digits)) {
        return `+998${digits}`;
    }
    return null;
}
