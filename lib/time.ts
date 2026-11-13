// Shown Monday first. dayOfWeek follows JavaScript: 0 = Sunday.
export const weekDays = [
  { dayOfWeek: 1, label: "Monday" },
  { dayOfWeek: 2, label: "Tuesday" },
  { dayOfWeek: 3, label: "Wednesday" },
  { dayOfWeek: 4, label: "Thursday" },
  { dayOfWeek: 5, label: "Friday" },
  { dayOfWeek: 6, label: "Saturday" },
  { dayOfWeek: 0, label: "Sunday" },
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
export function formatDay(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
