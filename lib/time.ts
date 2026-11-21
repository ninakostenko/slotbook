import { defaultLocale, intlLocales, type Locale } from "@/lib/i18n/config";

// Shown Monday first. dayOfWeek follows JavaScript: 0 = Sunday.
// The names of the days are in the messages: t(`weekdays.${dayOfWeek}`).
export const weekDays = [
  { dayOfWeek: 1 },
  { dayOfWeek: 2 },
  { dayOfWeek: 3 },
  { dayOfWeek: 4 },
  { dayOfWeek: 5 },
  { dayOfWeek: 6 },
  { dayOfWeek: 0 },
];

export function timeToMinutes(time: string) {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

// Every time of day in steps: ["00:00", "00:30", ..., "23:30"] for a 30-minute step.
export function timeOptions(stepMinutes = 30) {
  const options: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    options.push(minutesToTime(minutes));
  }
  return options;
}

// A calendar Date (local midnight) -> "2026-12-31".
// Uses the local date parts on purpose: toISOString() converts to UTC first
// and can return the previous day for time zones east of UTC.
export function toDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Today's date in the business's time zone, as "2026-12-31".
// The "en-CA" locale happens to format dates as YYYY-MM-DD.
export function todayInTimeZone(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(new Date());
}

// A day stored at midnight UTC -> "Thu, 31 Dec 2026". Formatted in UTC so it never shifts a day.
export function formatDay(date: Date, locale: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

// A moment in time -> the calendar date there, as "2026-12-31".
// Bookings are stored as exact moments (UTC); this tells which day a moment is on
// in the business's time zone.
export function dateInTimeZone(moment: Date, timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone }).format(moment);
}

// A moment in time -> minutes from midnight in the business's time zone.
// Example: 07:30 UTC is 10:30 in Europe/Kyiv in summer, so this returns 630.
export function minutesInTimeZone(moment: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(moment);
  const hours = Number(parts.find((part) => part.type === "hour")?.value);
  const minutes = Number(parts.find((part) => part.type === "minute")?.value);
  return hours * 60 + minutes;
}

// A calendar date plus some days, as "YYYY-MM-DD": addDays("2026-12-31", 1) is "2027-01-01".
// It works on UTC midnight, so no time zone or daylight saving change can shift the day.
export function addDays(date: string, days: number) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result.toISOString().slice(0, 10);
}

// "2026-12-31" -> "Thu, 31 Dec". Formatted in UTC for the same reason.
export function formatDayShort(date: string, locale: Locale = defaultLocale) {
  return new Intl.DateTimeFormat(intlLocales[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

// The opposite of dateInTimeZone + minutesInTimeZone: a calendar date and minutes
// from midnight in the business's time zone -> the exact moment in time.
// Example: ("2026-07-01", 630, "Europe/Kyiv") is 07:30 UTC, because Kyiv is UTC+3 in summer.
export function zonedTimeToDate(
  date: string,
  minutes: number,
  timeZone: string,
) {
  // The wall clock we want, written as if it were UTC. It is only a starting guess.
  const wanted = Date.parse(`${date}T00:00:00Z`) + minutes * 60_000;
  let guess = wanted;
  // Read the clock back in the zone and fix the guess by the difference.
  // Twice, because the first fix can cross a daylight saving change.
  for (let i = 0; i < 2; i++) {
    const moment = new Date(guess);
    const shown =
      Date.parse(`${dateInTimeZone(moment, timeZone)}T00:00:00Z`) +
      minutesInTimeZone(moment, timeZone) * 60_000;
    guess += wanted - shown;
  }
  return new Date(guess);
}

// A moment in time -> the clock time there, as "10:30" (24 hours, in the business's time zone).
export function formatTimeInZone(moment: Date, timeZone: string) {
  return minutesToTime(minutesInTimeZone(moment, timeZone));
}

// A moment in time -> the day there, as "Thu, 3 Dec". The weekday depends on the time zone too.
export function formatDayInZone(
  moment: Date,
  timeZone: string,
  locale: Locale = defaultLocale,
) {
  return formatDayShort(dateInTimeZone(moment, timeZone), locale);
}
