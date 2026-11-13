import type { Metadata } from "next";
import { Suspense } from "react";

import { ScheduleForm } from "@/components/schedule/schedule-form";
import { getCurrentBusiness } from "@/lib/dal";
import { prisma } from "@/lib/db";
import { minutesToTime, weekDays } from "@/lib/time";

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
