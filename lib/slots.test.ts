import { describe, expect, test } from "vitest";

import { getAvailableSlots } from "@/lib/slots";

describe("getAvailableSlots", () => {
  test("returns no slots on a closed day", () => {
    const slots = getAvailableSlots({
      workingHours: null, // closed day
      durationMinutes: 60,
      bookings: [],
      stepMinutes: 15,
    });

    expect(slots).toEqual([]);
  });

  test("offers every start time that fits before closing", () => {
    const slots = getAvailableSlots({
      workingHours: { start: 540, end: 660 }, // 09:00–11:00
      durationMinutes: 60,
      bookings: [],
      stepMinutes: 15,
    });

    expect(slots).toEqual([540, 555, 570, 585, 600]);
  });

  test("skips start times that overlap a booking", () => {
    const slots = getAvailableSlots({
      workingHours: { start: 540, end: 720 }, // 09:00–12:00
      durationMinutes: 60,
      bookings: [{ start: 600, end: 660 }], // booked 10:00–11:00
      stepMinutes: 30,
    });

    expect(slots).toEqual([540, 660]);
  });
  test("skips start times before the earliest allowed start", () => {
    const slots = getAvailableSlots({
      workingHours: { start: 540, end: 720 }, // 09:00–12:00
      durationMinutes: 60,
      bookings: [],
      stepMinutes: 30,
      earliestStart: 615, // 10:15, so 09:00, 09:30 and 10:00 are in the past
    });

    expect(slots).toEqual([630, 660]); // 10:30 and 11:00
  });

  test("allows a slot that starts exactly when a booking ends", () => {
    const slots = getAvailableSlots({
      workingHours: { start: 540, end: 720 },
      durationMinutes: 60,
      bookings: [{ start: 600, end: 660 }],
      stepMinutes: 60,
    });

    expect(slots).toEqual([540, 660]);
  });

  test("returns no slots when the service is longer than the working day", () => {
    const slots = getAvailableSlots({
      workingHours: { start: 540, end: 600 },
      durationMinutes: 90,
      bookings: [],
      stepMinutes: 15,
    });

    expect(slots).toEqual([]);
  });
});
