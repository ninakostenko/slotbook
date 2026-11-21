import { Suspense } from "react";

import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { Badge } from "@/components/ui/badge";
import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { dateInTimeZone, formatDayInZone, formatTimeInZone } from "@/lib/time";
import type { Locale } from "@/lib/i18n/config";
import { pageTitle } from "@/lib/i18n/metadata";
import { getI18n } from "@/lib/i18n/server";
import { getT } from "@/lib/i18n/translate";

export const generateMetadata = pageTitle("meta.bookings");

export default async function BookingsPage({
  params,
}: PageProps<"/[locale]/dashboard/bookings">) {
  const { locale, t } = await getI18n(params);

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {t("dashboard.nav.bookings")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("bookings.subtitle")}</p>

      <Suspense fallback={<p className="mt-8">{t("common.loading")}</p>}>
        <BookingsLists locale={locale} />
      </Suspense>
    </div>
  );
}

async function BookingsLists({ locale }: { locale: Locale }) {
  const t = getT(locale);
  const business = await getCurrentBusiness();
  if (!business) return null;

  // Read the clock after the data above, so the page stays valid with Cache Components.
  const now = new Date();

  const [upcoming, earlier] = await Promise.all([
    prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: "CONFIRMED",
        startsAt: { gte: now },
      },
      include: { service: { select: { name: true } } },
      orderBy: { startsAt: "asc" },
    }),
    // Past bookings and cancelled ones, the newest first.
    prisma.booking.findMany({
      where: {
        businessId: business.id,
        OR: [{ startsAt: { lt: now } }, { status: { not: "CONFIRMED" } }],
      },
      include: { service: { select: { name: true } } },
      orderBy: { startsAt: "desc" },
      take: 20,
    }),
  ]);

  const timeZone = business.timezone;

  // Group the upcoming bookings by their day in the business's time zone.
  const days = new Map<string, typeof upcoming>();
  for (const booking of upcoming) {
    const day = dateInTimeZone(booking.startsAt, timeZone);
    days.set(day, [...(days.get(day) ?? []), booking]);
  }

  return (
    <>
      <section className="mt-8">
        <h2 className="text-lg font-semibold">{t("bookings.upcoming")}</h2>
        {upcoming.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed p-10 text-center">
            <p className="font-medium">{t("bookings.none")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("bookings.noneHint")}
            </p>
          </div>
        ) : (
          <div className="mt-3 space-y-6">
            {[...days.entries()].map(([day, dayBookings]) => {
              const first = dayBookings[0];
              if (!first) return null;
              return (
                <div key={day}>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {formatDayInZone(first.startsAt, timeZone, locale)}
                  </h3>
                  <ul className="mt-2 divide-y rounded-lg border">
                    {dayBookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        timeZone={timeZone}
                        locale={locale}
                        canCancel
                      />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {earlier.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">{t("bookings.earlier")}</h2>
          <ul className="mt-3 divide-y rounded-lg border">
            {earlier.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                timeZone={timeZone}
                locale={locale}
                showDay
              />
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

type BookingRowProps = {
  booking: {
    id: string;
    clientName: string;
    clientEmail: string;
    startsAt: Date;
    endsAt: Date;
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    service: { name: string };
  };
  timeZone: string;
  locale: Locale;
  canCancel?: boolean;
  showDay?: boolean;
};

function BookingRow({
  booking,
  timeZone,
  locale,
  canCancel,
  showDay,
}: BookingRowProps) {
  const t = getT(locale);
  const time = `${formatTimeInZone(booking.startsAt, timeZone)}–${formatTimeInZone(booking.endsAt, timeZone)}`;
  const day = formatDayInZone(booking.startsAt, timeZone, locale);
  const cancelled = booking.status === "CANCELLED";

  return (
    <li className="flex items-center justify-between gap-3 p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              cancelled
                ? "font-medium text-muted-foreground line-through"
                : "font-medium"
            }
          >
            {showDay ? `${day}, ${time}` : time}
          </span>
          {cancelled && (
            <Badge variant="destructive">{t("bookings.cancelled")}</Badge>
          )}
          {booking.status === "NO_SHOW" && (
            <Badge variant="secondary">{t("bookings.noShow")}</Badge>
          )}
          {booking.status === "COMPLETED" && (
            <Badge variant="secondary">{t("bookings.done")}</Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {booking.clientName} · {booking.service.name} · {booking.clientEmail}
        </p>
      </div>
      {canCancel && (
        <CancelBookingButton
          bookingId={booking.id}
          summary={`${booking.clientName} · ${booking.service.name} · ${day}, ${time}`}
        />
      )}
    </li>
  );
}
