// The two languages of the interface. English is the default.
export const locales = ["en", "uk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

// The visitor's choice is kept in this cookie. The address never shows the language:
// proxy.ts reads the cookie and quietly rewrites /dashboard to /uk/dashboard.
export const LOCALE_COOKIE = "locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // one year, in seconds

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (locales as readonly string[]).includes(value)
  );
}

// The language for a first-time visitor, from the Accept-Language header of the browser.
// "uk-UA,uk;q=0.9,en;q=0.8" -> "uk". Anything else gets English.
export function detectLocale(
  acceptLanguage: string | null | undefined,
): Locale {
  if (!acceptLanguage) return defaultLocale;
  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("uk") ? "uk" : defaultLocale;
}

// The tag used with Intl (dates) and with react-day-picker.
export const intlLocales: Record<Locale, string> = {
  en: "en-GB",
  uk: "uk-UA",
};
