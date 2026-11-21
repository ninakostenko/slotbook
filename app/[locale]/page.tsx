import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Link2,
  Settings2,
} from "lucide-react";
import Link from "next/link";

import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { DemoButton } from "@/components/landing/demo-button";
import { Button } from "@/components/ui/button";
import { getI18n } from "@/lib/i18n/server";

const steps = [
  { icon: Settings2, key: "setup" },
  { icon: Link2, key: "share" },
  { icon: CalendarCheck, key: "book" },
] as const;

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { t } = await getI18n(params);

  return (
    <div className="flex flex-1 flex-col">
      <main className="flex-1">
        <section className="relative mx-auto flex max-w-3xl flex-col items-center px-4 pt-16 pb-20 text-center sm:pt-24">
          <LocaleSwitcher className="absolute top-4 right-4" />
          <div className="mb-8 flex items-center gap-2 text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <CalendarDays className="size-4" aria-hidden="true" />
            </span>
            SlotBook
          </div>
          <h1 className="font-display text-5xl font-semibold tracking-tight text-balance sm:text-7xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            {t("landing.heroText")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                {t("landing.createPage")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/book/demo-studio">
                {t("landing.seeHowClientsBook")}
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            {t("landing.justLooking")} <DemoButton />{" "}
            {t("landing.withSampleData")}
          </p>
        </section>

        <section className="border-y bg-muted/60 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-display text-center text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("landing.howItWorks")}
            </h2>
            <ol className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  key={step.key}
                  className="rounded-2xl border bg-card p-6 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                      <step.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {t("landing.step", { number: index + 1 })}
                    </span>
                  </div>
                  <h3 className="font-display mt-4 text-2xl font-semibold">
                    {t(`landing.steps.${step.key}.title`)}
                  </h3>
                  <p className="mt-2 text-muted-foreground">
                    {t(`landing.steps.${step.key}.text`)}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {t("landing.closingTitle")}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t("landing.closingText")}
          </p>
          <Button size="lg" className="mt-8" asChild>
            <Link href="/sign-up">
              {t("landing.createPage")}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t px-4 py-6 text-center text-sm text-muted-foreground">
        {t("landing.footer")}{" "}
        <a
          href="https://github.com/ninakostenko/slotbook"
          className="text-primary hover:underline"
        >
          {t("landing.source")}
        </a>
      </footer>
    </div>
  );
}
