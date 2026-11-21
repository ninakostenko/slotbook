import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { CopyLinkButton } from "@/components/dashboard/copy-link-button";
import { getCurrentBusiness, getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/db";
import {
  addDays,
  dateInTimeZone,
  formatDayInZone,
  formatTimeInZone,
  todayInTimeZone,
} from "@/lib/time";

export const metadata: Metadata = {
  title: "Overview · SlotBook",
};

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Suspense
        fallback={<div className="h-16 w-72 animate-pulse rounded bg-muted" />}
      >
        <Greeting />
      </Suspense>
      <Suspense
        fallback={<div className="mt-8 h-24 animate-pulse rounded bg-muted" />}
      >
        <Stats />
      </Suspense>
    </div>
  );
}

async function Greeting() {
  const [user, business] = await Promise.all([
    getCurrentUser(),
    getCurrentBusiness(),
  ]);
  const firstName = user.name.split(" ")[0];

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Welcome, {firstName}
      </h1>
      {business && (
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-muted-foreground">
          <span>
            {business.name} · your booking link:{" "}
            <Link
              href={`/book/${business.slug}`}
              className="font-medium text-primary hover:underline"
            >
              /book/{business.slug}
            </Link>
          </span>
          <CopyLinkButton path={`/book/${business.slug}`} />
        </div>
      )}
    </div>
  );
}

async function Stats() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const timeZone = business.timezone;
  // Read the clock after the data above, so the page stays valid with Cache Components.
  const now = new Date();
  const today = todayInTimeZone(timeZone);
  const weekEnd = addDays(today, 6); // today and the next 6 days

  // One wide window (a day before to 8 days after), then sort the bookings into days
  // in the business's time zone. A UTC window alone could cut a day in the wrong place.
  const oneDay = 24 * 60 * 60 * 1000;
  const [windowBookings, upcomingTotal] = await Promise.all([
    prisma.booking.findMany({
      where: {
        businessId: business.id,
        status: "CONFIRMED",
        startsAt: {
          gte: new Date(now.getTime() - oneDay),
          lt: new Date(now.getTime() + 8 * oneDay),
        },
      },
      include: { service: { select: { name: true } } },
      orderBy: { startsAt: "asc" },
    }),
    prisma.booking.count({
      where: {
        businessId: business.id,
        status: "CONFIRMED",
        startsAt: { gte: now },
      },
    }),
  ]);

  const dayOf = (moment: Date) => dateInTimeZone(moment, timeZone);
  const todayCount = windowBookings.filter((b) => dayOf(b.startsAt) === today);
  const weekCount = windowBookings.filter((b) => {
    const day = dayOf(b.startsAt);
    return day >= today && day <= weekEnd && b.startsAt >= now;
  });
  const nextUp = windowBookings.filter((b) => b.startsAt >= now).slice(0, 5);

  return (
    <>
      <dl className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Today" value={todayCount.length} />
        <Stat label="Next 7 days" value={weekCount.length} />
        <Stat label="All upcoming" value={upcomingTotal} />
      </dl>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Next up</h2>
          <Link
            href="/dashboard/bookings"
            className="text-sm text-primary hover:underline"
          >
            See all bookings
          </Link>
        </div>

        {nextUp.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed p-10 text-center">
            <p className="font-medium">No upcoming bookings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Share your booking link, and new bookings will show up here.
            </p>
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {nextUp.map((booking) => (
              <li key={booking.id} className="p-4">
                <p className="font-medium">
                  {formatDayInZone(booking.startsAt, timeZone)},{" "}
                  {formatTimeInZone(booking.startsAt, timeZone)}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {booking.clientName} · {booking.service.name}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-3xl font-semibold tracking-tight">{value}</dd>
    </div>
  );
}
