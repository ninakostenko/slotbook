"use client";

import { useLocale, useT } from "@/components/i18n/i18n-provider";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  type Locale,
} from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const options: { locale: Locale; label: string; name: string }[] = [
  { locale: "en", label: "EN", name: "English" },
  { locale: "uk", label: "УКР", name: "Українська" },
];

// Saves the choice in a cookie and reloads the page, so the server renders it all again.
function saveLocaleAndReload(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  window.location.reload();
}

// Two small buttons: EN and УКР. It saves the choice in a cookie and reloads the page,
// so the server renders everything again in the chosen language.
export function LocaleSwitcher({ className }: { className?: string }) {
  const current = useLocale();
  const t = useT();

  function choose(locale: Locale) {
    if (locale === current) return;
    saveLocaleAndReload(locale);
  }

  return (
    <div
      role="group"
      aria-label={t("common.language")}
      className={cn(
        "inline-flex rounded-full border bg-card p-0.5 text-xs font-medium",
        className,
      )}
    >
      {options.map((option) => (
        <button
          key={option.locale}
          type="button"
          lang={option.locale}
          title={option.name}
          aria-pressed={option.locale === current}
          onClick={() => choose(option.locale)}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            option.locale === current
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
