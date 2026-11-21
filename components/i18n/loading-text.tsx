"use client";

import { useT } from "@/components/i18n/i18n-provider";

// "Loading…" in the language of the page, for the fallback of a <Suspense> in a page shell
// that cannot read the language itself.
export function LoadingText({ className }: { className?: string }) {
  const t = useT();
  return <p className={className}>{t("common.loading")}</p>;
}
