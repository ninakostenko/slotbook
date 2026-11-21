import Link from "next/link";

import { BookingForm } from "@/components/booking/booking-form";
import { DayCalendar } from "@/components/booking/day-calendar";
import { getClosedDays, getDaySlots } from "@/lib/availability";
import type { Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/translate";
import {
  addDays,
  formatDayShort,
  minutesToTime,
  todayInTimeZone,
} from "@/lib/time";

const DAYS_AHEAD = 14;

type SlotPickerProps = {
  locale: Locale;
  business: { id: string; slug: string; timezone: string };
  service: { id: string; name: string };
  // Both come from the URL, so they are untrusted: they are checked below.
  dateParam: string | undefined;
  timeParam: string | undefined;
};

// Shows the next 14 days and the start times of the chosen day.
// The choice lives in the URL: ?service=...&date=2026-12-01&time=540
export async function SlotPicker({
  locale,
  business,
  service,
  dateParam,
  timeParam,
}: SlotPickerProps) {
  const t = getT(locale);
  // "Today" is the date in the business's time zone, not on the server.
  const today = todayInTimeZone(business.timezone);
  const days = Array.from({ length: DAYS_AHEAD }, (_, i) => addDays(today, i));

  // Closed days (no working hours, or a day off) cannot be picked.
  const closedDays = await getClosedDays(business.id, days);
  const openDays = days.filter((day) => !closedDays.includes(day));

  // Only an open date from the list is accepted. Anything else falls back to the
  // first open day (or today, when every day is closed).
  const date =
    openDays.find((day) => day === dateParam) ?? openDays[0] ?? today;
  const slots = await getDaySlots(business.id, service.id, date);
  const selectedTime = Number(timeParam);

  const linkBase = `/book/${business.slug}?service=${service.id}`;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-semibold">
        {t("book.chooseDay")}
      </h2>
      <DayCalendar
        today={today}
        lastDay={days[days.length - 1] ?? today}
        selected={date}
        closedDays={closedDays}
        linkBase={linkBase}
      />

      <h2 className="font-display mt-8 text-2xl font-semibold">
        {t("book.chooseTime")}
      </h2>
      {slots.length === 0 ? (
        <p className="mt-3 text-muted-foreground">{t("book.closedDay")}</p>
      ) : (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {slots.map(({ time, free }) => (
            <li key={time}>
              <Link
                href={`${linkBase}&date=${date}&time=${time}#your-details`}
                aria-current={time === selectedTime ? "true" : undefined}
                title={free ? undefined : t("book.taken")}
                className={
                  !free
                    ? "block rounded-full bg-muted px-3 py-2 text-center text-sm text-muted-foreground line-through"
                    : time === selectedTime
                      ? "block rounded-full bg-primary px-3 py-2 text-center text-sm text-primary-foreground"
                      : "block rounded-full border px-3 py-2 text-center text-sm hover:bg-muted"
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
          summary={t("book.summary", {
            service: service.name,
            day: formatDayShort(date, locale),
            time: minutesToTime(selectedTime),
          })}
          slug={business.slug}
          serviceId={service.id}
          date={date}
          time={selectedTime}
        />
      )}
    </section>
  );
}
