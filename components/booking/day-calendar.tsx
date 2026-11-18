"use client";

import { useRouter } from "next/navigation";
import { enUS } from "react-day-picker/locale";

import { Calendar } from "@/components/ui/calendar";
import { toDateString } from "@/lib/time";

type DayCalendarProps = {
  // All three are "YYYY-MM-DD", in the business's time zone.
  today: string;
  lastDay: string;
  selected: string;
  // Days in the range that are closed. They are greyed out.
  closedDays: string[];
  // The page address without the date, for example "/book/annas-nails?service=abc".
  linkBase: string;
};

// "2026-11-13" -> a local Date for the calendar (it works in the browser's time zone).
function toLocalDate(date: string) {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

// A month calendar where only the days from today to lastDay can be picked.
// Picking a day changes ?date= in the address; the server then loads that day's times.
export function DayCalendar({
  today,
  lastDay,
  selected,
  closedDays,
  linkBase,
}: DayCalendarProps) {
  const router = useRouter();
  const first = toLocalDate(today);
  const last = toLocalDate(lastDay);

  return (
    <div className="mt-3 w-fit rounded-2xl border bg-card p-3 shadow-sm">
      <Calendar
        mode="single"
        required
        selected={toLocalDate(selected)}
        defaultMonth={toLocalDate(selected)}
        onSelect={(date) => {
          if (!date) return;
          router.push(`${linkBase}&date=${toDateString(date)}`, {
            scroll: false,
          });
        }}
        disabled={[
          { before: first },
          { after: last },
          (date) => closedDays.includes(toDateString(date)),
        ]}
        startMonth={first}
        endMonth={last}
        showOutsideDays={false}
        locale={enUS}
        weekStartsOn={1}
        className="[--cell-size:--spacing(10)]"
      />
    </div>
  );
}
