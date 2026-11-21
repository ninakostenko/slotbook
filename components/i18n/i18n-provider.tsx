"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import type { Locale } from "@/lib/i18n/config";
import {
  createTranslate,
  type Messages,
  type Translate,
} from "@/lib/i18n/translate";

type I18nValue = { locale: Locale; t: Translate };

const I18nContext = createContext<I18nValue | null>(null);

// Gives the language and the t() function to every Client Component below it.
// The layout puts it around the whole app.
export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, t: createTranslate(messages) }),
    [locale, messages],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

function useI18n() {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useT must be used inside <I18nProvider>");
  return value;
}

export function useT(): Translate {
  return useI18n().t;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
