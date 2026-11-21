import { describe, expect, test } from "vitest";

import {
  buildDemoBookings,
  demoDayOff,
  demoServices,
  demoWorkingHours,
} from "@/lib/demo-data";
import { addDays } from "@/lib/time";

// A Wednesday, a Saturday and a Sunday, so the tests cover the closed day too.
const todays = ["2026-11-18", "2026-11-21", "2026-11-22"];

describe.each(todays)("demo bookings for %s", (today) => {
  const bookings = buildDemoBookings(today);

  test("only uses open days and skips today and the day off", () => {
    const openWeekdays = demoWorkingHours.map((hours) => hours.dayOfWeek);
    const dayOff = demoDayOff(today);
    for (const booking of bookings) {
      const weekday = new Date(`${booking.date}T00:00:00Z`).getUTCDay();
      expect(openWeekdays).toContain(weekday);
      expect(booking.date).not.toBe(today);
      expect(booking.date).not.toBe(dayOff);
    }
  });

  test("no two active bookings overlap on the same day", () => {
    const active = bookings.filter((b) => b.status !== "CANCELLED");
    for (const a of active) {
      for (const b of active) {
        if (a === b || a.date !== b.date) continue;
        const aEnd =
          a.startMinute + (demoServices[a.serviceIndex]?.durationMinutes ?? 0);
        const bEnd =
          b.startMinute + (demoServices[b.serviceIndex]?.durationMinutes ?? 0);
        const overlaps = a.startMinute < bEnd && b.startMinute < aEnd;
        expect(overlaps).toBe(false);
      }
    }
  });

  test("every booking fits inside the working hours", () => {
    for (const booking of bookings) {
      const weekday = new Date(`${booking.date}T00:00:00Z`).getUTCDay();
      const hours = demoWorkingHours.find((h) => h.dayOfWeek === weekday);
      const end =
        booking.startMinute +
        (demoServices[booking.serviceIndex]?.durationMinutes ?? 0);
      expect(booking.startMinute).toBeGreaterThanOrEqual(
        hours?.startMinute ?? 0,
      );
      expect(end).toBeLessThanOrEqual(hours?.endMinute ?? 0);
    }
  });

  test("past days are completed, future days are confirmed, one is cancelled", () => {
    for (const booking of bookings) {
      if (booking.status === "CANCELLED") continue;
      expect(booking.status).toBe(
        booking.date < today ? "COMPLETED" : "CONFIRMED",
      );
    }
    expect(bookings.filter((b) => b.status === "CANCELLED")).toHaveLength(1);
    expect(bookings.some((b) => b.status === "CONFIRMED")).toBe(true);
    expect(bookings.some((b) => b.status === "COMPLETED")).toBe(true);
  });
});

test("the day off is an open weekday about nine days ahead", () => {
  expect(demoDayOff("2026-11-18")).toBe("2026-11-27"); // a Friday
  expect(demoDayOff("2026-11-21")).toBe("2026-11-30"); // a Monday
  // 2026-12-01 + 9 days is a Tuesday-or-later open day, never a Sunday.
  const sundayCase = demoDayOff("2026-11-22"); // +9 = 2026-12-01
  expect(new Date(`${sundayCase}T00:00:00Z`).getUTCDay()).not.toBe(0);
  expect(sundayCase >= addDays("2026-11-22", 9)).toBe(true);
});
