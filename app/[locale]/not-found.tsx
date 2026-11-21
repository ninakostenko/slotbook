"use client";

import Link from "next/link";

import { useT } from "@/components/i18n/i18n-provider";
import { Button } from "@/components/ui/button";

// Shown for any address that does not exist, and when a page calls notFound().
export default function NotFound() {
  const t = useT();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-medium tracking-[0.25em] text-primary uppercase">
        404
      </p>
      <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight">
        {t("notFound.title")}
      </h1>
      <p className="mt-4 text-muted-foreground">{t("notFound.text")}</p>
      <Button className="mt-8" asChild>
        <Link href="/">{t("notFound.back")}</Link>
      </Button>
    </main>
  );
}
