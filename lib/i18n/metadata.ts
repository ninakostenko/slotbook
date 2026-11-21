import type { Metadata } from "next";

import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { getT, type MessageKey } from "@/lib/i18n/translate";

// A generateMetadata function that sets the page title in the language of the page:
//   export const generateMetadata = pageTitle("meta.signIn");
// `extra` adds other metadata, for example robots.
export function pageTitle(key: MessageKey, extra: Metadata = {}) {
  return async ({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> => {
    const { locale } = await params;
    const t = getT(isLocale(locale) ? locale : defaultLocale);
    return { ...extra, title: t(key) };
  };
}
