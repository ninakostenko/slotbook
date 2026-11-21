import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CancelMyBookingButton } from "@/components/booking/cancel-my-booking-button";
import { LocaleSwitcher } from "@/components/i18n/locale-switcher";
import { LoadingText } from "@/components/i18n/loading-text";
import { prisma } from "@/lib/db";
import { formatDayInZone, formatTimeInZone } from "@/lib/time";
import { pageTitle } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";

// The address is private (it holds the cancel token), so search engines must skip it.
export const generateMetadata = pageTitle("meta.confirmation", {
  robots: { index: false, follow: false },
});

// The page itself does not await params, so the shell can be prerendered and only
// the part inside <Suspense> waits for data (the same pattern as the booking page).
export default function BookingConfirmationPage({
  params,
}: PageProps<"/[locale]/booking/[token]">) {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <div className="flex justify-end">
        <LocaleSwitcher />
      </div>
      <Suspense fallback={<LoadingText className="text-center" />}>
        <Confirmation params={params} />
      </Suspense>
    </main>
  );
}

async function Confirmation({
  params,
}: {
  params: PageProps<"/[locale]/booking/[token]">["params"];
}) {
  const { token } = await params;
  const { locale, t } = await getI18n(params);

  const booking = await prisma.booking.findUnique({
    where: { cancelToken: token },
    include: {
      service: { select: { name: true } },
      business: { select: { name: true, slug: true, timezone: true } },
    },
  });
  if (!booking) return notFound();

  // Read the clock after the data above, so the page stays valid with Cache Components.
  const hasStarted = booking.startsAt <= new Date();
  const { timezone } = booking.business;
  const cancelled = booking.status === "CANCELLED";

  return (
    <div className="text-center">
      <p className="text-xs font-medium tracking-[0.25em] text-primary uppercase">
        {booking.business.name}
      </p>
      <h1 className="font-display mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        {cancelled
          ? t("confirmation.cancelledTitle")
          : t("confirmation.booked")}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {cancelled ? t("confirmation.freeAgain") : t("confirmation.keepPage")}
      </p>

      <dl className="mt-8 rounded-2xl border bg-card p-6 text-left shadow-sm">
        <Row label={t("confirmation.service")} value={booking.service.name} />
        <Row
          label={t("confirmation.when")}
          value={`${formatDayInZone(booking.startsAt, timezone, locale)}, ${formatTimeInZone(booking.startsAt, timezone)}–${formatTimeInZone(booking.endsAt, timezone)}`}
        />
        <Row label={t("confirmation.name")} value={booking.clientName} />
        <Row label={t("confirmation.email")} value={booking.clientEmail} />
      </dl>

      <div className="mt-8 flex flex-col items-center gap-3">
        {!cancelled && !hasStarted && <CancelMyBookingButton token={token} />}
        <Link
          href={`/book/${booking.business.slug}`}
          className="text-sm text-primary hover:underline"
        >
          {t("confirmation.another")}
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 first:pt-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
