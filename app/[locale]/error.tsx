"use client";

import Link from "next/link";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";

// Shown when something unexpected fails while a page renders. `reset` tries the page again.
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useT();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        {t("errorPage.title")}
      </h1>
      <p className="mt-4 text-muted-foreground">{t("errorPage.text")}</p>
      <div className="mt-8 flex gap-3">
        <Button onClick={reset}>{t("errorPage.retry")}</Button>
        <Button variant="outline" asChild>
          <Link href="/">{t("errorPage.back")}</Link>
        </Button>
      </div>
    </main>
  );
}
