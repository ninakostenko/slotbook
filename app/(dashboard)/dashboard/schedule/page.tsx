import type { Metadata } from "next";
import { Suspense } from "react";

import { AddTimeOff } from "@/components/schedule/add-time-off";
import { RemoveTimeOffButton } from "@/components/schedule/remove-time-off-button";
import { ScheduleForm } from "@/components/schedule/schedule-form";
import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import {
  formatDay,
  minutesToTime,
  todayInTimeZone,
  weekDays,
} from "@/lib/time";

export const metadata: Metadata = {
  title: "Schedule · SlotBook",
};

export default function SchedulePage() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        Schedule
      </h1>
      <p className="mt-2 text-muted-foreground">
        Set the days and hours clients can book.
      </p>

      <Suspense fallback={<p className="mt-8">Loading…</p>}>
        <ScheduleEditor />
      </Suspense>

      <section className="mt-12 max-w-xl" aria-labelledby="days-off-heading">
        <h2
          id="days-off-heading"
          className="text-lg font-semibold tracking-tight"
        >
          Days off
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Holidays or vacation: clients cannot book on these dates.
        </p>
        <Suspense fallback={<p className="mt-4">Loading…</p>}>
          <DaysOff />
        </Suspense>
      </section>
    </div>
  );
}

async function DaysOff() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  // Past days off no longer matter, so only today and later are listed.
  const today = todayInTimeZone(business.timezone);
  const daysOff = await prisma.timeOff.findMany({
    where: {
      businessId: business.id,
      date: { gte: new Date(`${today}T00:00:00Z`) },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="mt-4 flex flex-col gap-4">
      <AddTimeOff today={today} />

      {daysOff.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No days off planned
        </p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {daysOff.map((dayOff) => {
            const label = formatDay(dayOff.date);
            return (
              <li
                key={dayOff.id}
                className="flex items-center justify-between gap-3 py-2 pr-2 pl-4"
              >
                <span className="text-sm font-medium">{label}</span>
                <RemoveTimeOffButton timeOffId={dayOff.id} label={label} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

async function ScheduleEditor() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const hours = await prisma.workingHours.findMany({
    where: { businessId: business.id },
  });

  const days = weekDays.map(({ dayOfWeek }) => {
    const saved = hours.find((row) => row.dayOfWeek === dayOfWeek);

    if (!saved) {
      return { dayOfWeek, enabled: false, start: "09:00", end: "18:00" };
    }

    return {
      dayOfWeek,
      enabled: true,
      start: minutesToTime(saved.startMinute),
      end: minutesToTime(saved.endMinute),
    };
  });

  return <ScheduleForm days={days} />;
}
