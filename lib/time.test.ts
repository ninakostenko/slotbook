import { describe, expect, test } from "vitest";

import { minutesToTime, timeToMinutes } from "@/lib/time";

// Your minutesToTime, checked automatically.
describe("minutesToTime", () => {
  test("formats whole hours", () => {
    expect(minutesToTime(540)).toBe("09:00");
    expect(minutesToTime(1080)).toBe("18:00");
  });

  test("pads hours and minutes to two digits", () => {
    expect(minutesToTime(0)).toBe("00:00");
    expect(minutesToTime(65)).toBe("01:05");
  });

  test("is the reverse of timeToMinutes", () => {
    expect(timeToMinutes(minutesToTime(1439))).toBe(1439);
  });
});
