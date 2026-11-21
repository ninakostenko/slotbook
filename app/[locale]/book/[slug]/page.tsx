import { SlotPicker } from "@/components/booking/slot-picker";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { LoadingText } from "@/components/i18n/loading-text";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { pageTitle } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

export const generateMetadata = pageTitle("meta.book");

// The page itself does NOT await params. It passes the promise down, so the page
// shell can be prerendered and only the part inside <Suspense> waits for data.
export default function BookingPage({
  params,
  searchParams,
}: PageProps<"/[locale]/book/[slug]">) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex justify-end">
        <LocaleSwitcher />
      </div>
      <Suspense fallback={<LoadingText className="text-center" />}>
        <BusinessServices params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function BusinessServices({
  params,
  searchParams,
}: {
  params: PageProps<"/[locale]/book/[slug]">["params"];
  searchParams: PageProps<"/[locale]/book/[slug]">["searchParams"];
}) {
  const { slug } = await params;
  const { locale, t } = await getI18n(params);
  const query = await searchParams;

  const business = await prisma.business.findUnique({
    where: { slug },
  });
  if (!business) return notFound();

  const services = await prisma.service.findMany({
    where: { businessId: business.id, isActive: true },
    orderBy: [{ name: "asc" }],
  });

  // The ?service= value comes from the URL, so check it is one of the active services.
  const selectedService = services.find((s) => s.id === query.service);

  return (
    <div>
      <header className="text-center">
        <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">
          {t("book.onlineBooking")}
        </p>
        <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight text-balance sm:text-6xl">
          {business.name}
        </h1>
        {business.description && (
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            {business.description}
          </p>
        )}
        <div className="mx-auto mt-6 h-px w-16 bg-primary/40" />
      </header>
      {services.length === 0 ? (
        <p className="mt-10 text-center text-muted-foreground">
          {t("book.noServices")}
        </p>
      ) : selectedService ? (
        <div className="mt-10 flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm">
          <div>
            <p className="text-sm text-muted-foreground">
              {t("book.yourService")}
            </p>
            <p className="font-display text-2xl font-semibold">
              {selectedService.name}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("common.minutes", { count: selectedService.durationMinutes })}{" "}
              · {t("common.uah", { amount: selectedService.priceCents / 100 })}
            </p>
          </div>
          <Link
            href={`/book/${business.slug}`}
            className="text-sm text-primary hover:underline"
          >
            {t("common.change")}
          </Link>
        </div>
      ) : (
        <>
          <h2 className="font-display mt-10 text-center text-2xl font-semibold">
            {t("book.chooseService")}
          </h2>
          <ul className="mt-4 grid gap-3">
            {services.map((service) => (
              <li key={service.id}>
                <Link
                  href={`/book/${business.slug}?service=${service.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md"
                >
                  <div>
                    <p className="font-display text-2xl font-semibold">
                      {service.name}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {t("common.minutes", { count: service.durationMinutes })}
                    </p>
                  </div>
                  <p className="font-medium text-primary">
                    {t("common.uah", { amount: service.priceCents / 100 })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedService && (
        <SlotPicker
          locale={locale}
          business={business}
          service={selectedService}
          dateParam={typeof query.date === "string" ? query.date : undefined}
          timeParam={typeof query.time === "string" ? query.time : undefined}
        />
      )}
    </div>
  );
}
