import type { Locale } from "@/lib/i18n/config";
import { en } from "@/lib/i18n/messages/en";
import { uk } from "@/lib/i18n/messages/uk";

// The shape of the messages: nested objects with text at the end.
export type Messages = typeof en;

// Every key of the messages as a dotted path: "landing.hero.title".
type Paths<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${Paths<T[K]>}`;
}[keyof T & string];

export type MessageKey = Paths<Messages>;

export type TranslateParams = Record<string, string | number>;

// t("bookings.cancel.title"), or t("dashboard.welcome", { name: "Nina" }) for the text
// "Welcome, {name}". A text that is not a key (for example an error message that the
// server sent as plain text) is returned as it is.
export type Translate = (
  key: MessageKey | (string & {}),
  params?: TranslateParams,
) => string;

const catalogs: Record<Locale, Messages> = { en, uk };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? en;
}

function lookup(messages: Messages, key: string): string | undefined {
  let value: unknown = messages;
  for (const part of key.split(".")) {
    if (typeof value !== "object" || value === null) return undefined;
    value = (value as Record<string, unknown>)[part];
  }
  return typeof value === "string" ? value : undefined;
}

// Builds a t() function for one language.
export function createTranslate(messages: Messages): Translate {
  return (key, params) => {
    const text = lookup(messages, key);
    if (text === undefined) return key;
    if (!params) return text;
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in params ? String(params[name]) : match,
    );
  };
}

// For Server Components: const t = getT(locale).
export function getT(locale: Locale): Translate {
  return createTranslate(getMessages(locale));
}
