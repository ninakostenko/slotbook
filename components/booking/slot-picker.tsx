import Link from "next/link";

import { BookingForm } from "@/components/booking/booking-form";
import { getDaySlots } from "@/lib/availability";
import {
  addDays,
  formatDayShort,
  minutesToTime,
  todayInTimeZone,
} from "@/lib/time";

const DAYS_AHEAD = 14;

type SlotPickerProps = {
  business: { id: string; slug: string; timezone: string };
  service: { id: string; name: string };
  // Both come from the URL, so they are untrusted: they are checked below.
  dateParam: string | undefined;
  timeParam: string | undefined;
};

// Shows the next 14 days and the start times of the chosen day.
// The choice lives in the URL: ?service=...&date=2026-12-01&time=540
export async function SlotPicker({
  business,
  service,
  dateParam,
  timeParam,
}: SlotPickerProps) {
  // "Today" is the date in the business's time zone, not on the server.
  const today = todayInTimeZone(business.timezone);
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));

  // Only a date from the list is accepted; anything else falls back to today.
  const date = days.find((day) => day === dateParam) ?? today;
  const slots = await getDaySlots(business.id, service.id, date);
  const selectedTime = Number(timeParam);

  const linkBase = `/book/${business.slug}?service=${service.id}`;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">Choose a day</h2>
      <ul className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {days.map((day) => (
          <li key={day} className="shrink-0">
            <Link
              href={`${linkBase}&date=${day}`}
              scroll={false}
              aria-current={day === date ? "date" : undefined}
              className={
                day === date
                  ? "block rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground"
                  : "block rounded-full border px-3 py-2 text-sm hover:bg-muted"
              }
            >
              {formatDayShort(day)}
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="font-display mt-8 text-2xl font-semibold">
        Choose a time
      </h2>
      {slots.length === 0 ? (
        <p className="mt-3 text-muted-foreground">
          Closed on this day. Try another day.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map(({ time, free }) => (
            <li key={time}>
              <Link
                href={`${linkBase}&date=${date}&time=${time}#your-details`}
                aria-current={time === selectedTime ? "true" : undefined}
                title={free ? undefined : "Already taken"}
                className={
                  time === selectedTime
                    ? "block rounded-full bg-primary px-3 py-2 text-center text-sm text-primary-foreground"
                    : free
                      ? "block rounded-full border px-3 py-2 text-center text-sm hover:bg-muted"
                      : "block rounded-full bg-muted px-3 py-2 text-center text-sm text-muted-foreground line-through"
                }
              >
                {minutesToTime(time)}
              </Link>
            </li>
          ))}
        </ul>
      )}
      {/* The form stays on the page after booking, so it can show "Booked!"
          even though the booked time has left the list. */}
      {timeParam !== undefined && /^\d+$/.test(timeParam) && (
        <BookingForm
          available={slots.some(
            (slot) => slot.time === selectedTime && slot.free,
          )}
          summary={`${service.name} · ${formatDayShort(date)} · ${minutesToTime(selectedTime)}`}
          slug={business.slug}
          serviceId={service.id}
          date={date}
          time={selectedTime}
        />
      )}
    </section>
  );
}
