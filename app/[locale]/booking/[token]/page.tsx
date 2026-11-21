import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CancelMyBookingButton } from "@/components/booking/cancel-my-booking-button";
import { prisma } from "@/lib/db";
import { formatDayInZone, formatTimeInZone } from "@/lib/time";

export const metadata: Metadata = {
  title: "Your booking · SlotBook",
  // The address is private (it holds the cancel token), so search engines must skip it.
  robots: { index: false, follow: false },
};

// The page itself does not await params, so the shell can be prerendered and only
// the part inside <Suspense> waits for data (the same pattern as the booking page).
export default function BookingConfirmationPage({
  params,
}: PageProps<"/[locale]/booking/[token]">) {
  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <Suspense fallback={<p className="text-center">Loading…</p>}>
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
        {cancelled ? "Booking cancelled" : "You are booked"}
      </h1>
      <p className="mt-3 text-muted-foreground">
        {cancelled
          ? "This time is free again. You are welcome to pick another one."
          : "Keep this page: you can cancel here if your plans change."}
      </p>

      <dl className="mt-8 rounded-2xl border bg-card p-6 text-left shadow-sm">
        <Row label="Service" value={booking.service.name} />
        <Row
          label="When"
          value={`${formatDayInZone(booking.startsAt, timezone)}, ${formatTimeInZone(booking.startsAt, timezone)}–${formatTimeInZone(booking.endsAt, timezone)}`}
        />
        <Row label="Name" value={booking.clientName} />
        <Row label="Email" value={booking.clientEmail} />
      </dl>

      <div className="mt-8 flex flex-col items-center gap-3">
        {!cancelled && !hasStarted && <CancelMyBookingButton token={token} />}
        <Link
          href={`/book/${booking.business.slug}`}
          className="text-sm text-primary hover:underline"
        >
          Book another time
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
