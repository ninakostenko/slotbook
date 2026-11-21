import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";
import { getT, type Translate } from "@/lib/i18n/translate";

// For Server Components. Every page gets the language in its `params`:
//   const { locale, t } = await getI18n(params);
export async function getI18n(
  params: Promise<{ locale: string }>,
): Promise<{ locale: Locale; t: Translate }> {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : defaultLocale;
  return { locale, t: getT(locale) };
}
