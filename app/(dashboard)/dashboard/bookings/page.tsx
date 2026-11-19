import type { Metadata } from "next";
import { Suspense } from "react";

import { CancelBookingButton } from "@/components/bookings/cancel-booking-button";
import { Badge } from "@/components/ui/badge";
import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { dateInTimeZone, formatDayInZone, formatTimeInZone } from "@/lib/time";

export const metadata: Metadata = {
  title: "Bookings · SlotBook",
};

export default function BookingsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Bookings
      </h1>
      <p className="mt-2 text-muted-foreground">
        See and manage your upcoming appointments.
      </p>

      <Suspense fallback={<p className="mt-8">Loading…</p>}>
        <BookingsLists />
      </Suspense>
    </div>
  );
}

async function BookingsLists() {
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
        <h2 className="text-lg font-semibold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed p-10 text-center">
            <p className="font-medium">No upcoming bookings</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your booking page link, and new bookings will appear here.
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
                    {formatDayInZone(first.startsAt, timeZone)}
                  </h3>
                  <ul className="mt-2 divide-y rounded-lg border">
                    {dayBookings.map((booking) => (
                      <BookingRow
                        key={booking.id}
                        booking={booking}
                        timeZone={timeZone}
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
          <h2 className="text-lg font-semibold">Earlier and cancelled</h2>
          <ul className="mt-3 divide-y rounded-lg border">
            {earlier.map((booking) => (
              <BookingRow
                key={booking.id}
                booking={booking}
                timeZone={timeZone}
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
  canCancel?: boolean;
  showDay?: boolean;
};

function BookingRow({
  booking,
  timeZone,
  canCancel,
  showDay,
}: BookingRowProps) {
  const time = `${formatTimeInZone(booking.startsAt, timeZone)}–${formatTimeInZone(booking.endsAt, timeZone)}`;
  const day = formatDayInZone(booking.startsAt, timeZone);
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
          {cancelled && <Badge variant="destructive">Cancelled</Badge>}
          {booking.status === "NO_SHOW" && (
            <Badge variant="secondary">No show</Badge>
          )}
          {booking.status === "COMPLETED" && (
            <Badge variant="secondary">Done</Badge>
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
