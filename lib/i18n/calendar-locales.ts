import { enUS, uk } from "react-day-picker/locale";

import type { Locale } from "@/lib/i18n/config";

// The language of the calendar (month and day names). It must be the same on the server and
// in the browser, so it comes from the page language and not from the browser.
export const calendarLocales = { en: enUS, uk } satisfies Record<
  Locale,
  object
>;
