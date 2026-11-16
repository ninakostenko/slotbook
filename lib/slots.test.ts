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
});
