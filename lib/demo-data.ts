import { addDays } from "@/lib/time";

// The sample data of the demo business. This file does not touch the database,
// so it is easy to test. lib/demo.ts writes it to the database.

export const demoServices = [
  { name: "Classic manicure", durationMinutes: 60, priceCents: 75000 },
  { name: "Gel polish", durationMinutes: 75, priceCents: 90000 },
  { name: "Relaxing massage", durationMinutes: 60, priceCents: 97000 },
] as const;

// 0 = Sunday. Sunday has no row, so it is closed.
export const demoWorkingHours = [
  { dayOfWeek: 1, startMinute: 540, endMinute: 1080 },
  { dayOfWeek: 2, startMinute: 540, endMinute: 1080 },
  { dayOfWeek: 3, startMinute: 540, endMinute: 1080 },
  { dayOfWeek: 4, startMinute: 540, endMinute: 1080 },
  { dayOfWeek: 5, startMinute: 540, endMinute: 1080 },
  { dayOfWeek: 6, startMinute: 600, endMinute: 960 },
] as const;

const clientNames = [
  "Maria K.",
  "Olena P.",
  "Iryna S.",
  "Sofia B.",
  "Katia M.",
  "Anna T.",
  "Dasha L.",
  "Yulia R.",
];

// 10:00, 12:00 and 14:00. Two hours apart, so two bookings never overlap
// (the longest service takes 75 minutes).
const startMinutes = [600, 720, 840];

function isOpen(date: string) {
  const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
  return demoWorkingHours.some((hours) => hours.dayOfWeek === weekday);
}

// One day off, about a week and a half ahead, so the calendar shows a greyed day.
export function demoDayOff(today: string) {
  let day = addDays(today, 9);
  while (!isOpen(day)) day = addDays(day, 1);
  return day;
}

export type DemoBooking = {
  date: string; // "YYYY-MM-DD", in the business's time zone
  startMinute: number;
  serviceIndex: number; // position in demoServices
  clientName: string;
  clientEmail: string;
  status: "CONFIRMED" | "COMPLETED" | "CANCELLED";
};

// Bookings around `today`: a few finished ones in the last 3 days, and 1–3 per open
// day for the next 10 days, so every dashboard page has something to show.
export function buildDemoBookings(today: string): DemoBooking[] {
  const dayOff = demoDayOff(today);
  const bookings: DemoBooking[] = [];
  let n = 0;

  for (let offset = -3; offset <= 10; offset++) {
    if (offset === 0) continue; // today: leave the free times for the visitor
    const date = addDays(today, offset);
    if (!isOpen(date) || date === dayOff) continue;

    // Day 1 gets two bookings, day 2 gets one, day 3 gets three, and so on.
    const pattern = [[0, 2], [1], [0, 1, 2]][Math.abs(offset) % 3] ?? [1];
    for (const slot of pattern) {
      const clientName = clientNames[n % clientNames.length] ?? "Client";
      bookings.push({
        date,
        startMinute: startMinutes[slot] ?? 600,
        serviceIndex: n % demoServices.length,
        clientName,
        clientEmail: `client${n + 1}@example.com`,
        status: offset < 0 ? "COMPLETED" : "CONFIRMED",
      });
      n++;
    }
  }

  // One cancelled booking, at 16:00 on the second open day ahead, for the "cancelled" list.
  const cancelledDate = bookings
    .filter((b) => b.status === "CONFIRMED")
    .map((b) => b.date)[3];
  if (cancelledDate) {
    bookings.push({
      date: cancelledDate,
      startMinute: 960,
      serviceIndex: 0,
      clientName: "Vika D.",
      clientEmail: "vika@example.com",
      status: "CANCELLED",
    });
  }

  return bookings;
}
