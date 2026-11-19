import { describe, expect, test } from "vitest";

import {
  addDays,
  dateInTimeZone,
  formatDayInZone,
  formatTimeInZone,
  minutesInTimeZone,
  minutesToTime,
  timeToMinutes,
  zonedTimeToDate,
} from "@/lib/time";

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

describe("time zone helpers", () => {
  // 2026-07-01 07:30 UTC is 10:30 in Kyiv (UTC+3 in summer).
  const moment = new Date("2026-07-01T07:30:00Z");

  test("minutesInTimeZone reads the clock in the given zone", () => {
    expect(minutesInTimeZone(moment, "Europe/Kyiv")).toBe(630);
    expect(minutesInTimeZone(moment, "UTC")).toBe(450);
  });

  test("dateInTimeZone can differ from the UTC date", () => {
    const lateEvening = new Date("2026-07-01T22:30:00Z"); // 01:30 next day in Kyiv
    expect(dateInTimeZone(lateEvening, "Europe/Kyiv")).toBe("2026-07-02");
    expect(dateInTimeZone(lateEvening, "UTC")).toBe("2026-07-01");
  });
});

describe("addDays", () => {
  test("moves across month and year ends", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  test("is not affected by daylight saving changes", () => {
    expect(addDays("2026-03-28", 2)).toBe("2026-03-30");
    expect(addDays("2026-10-24", 2)).toBe("2026-10-26");
  });
});

describe("zonedTimeToDate", () => {
  test("turns a local time into the exact moment", () => {
    // Kyiv is UTC+3 in summer and UTC+2 in winter.
    expect(
      zonedTimeToDate("2026-07-01", 630, "Europe/Kyiv").toISOString(),
    ).toBe("2026-07-01T07:30:00.000Z");
    expect(
      zonedTimeToDate("2026-12-01", 630, "Europe/Kyiv").toISOString(),
    ).toBe("2026-12-01T08:30:00.000Z");
  });

  test("can land on the previous UTC day", () => {
    expect(zonedTimeToDate("2026-07-02", 60, "Europe/Kyiv").toISOString()).toBe(
      "2026-07-01T22:00:00.000Z",
    );
  });

  test("is the reverse of dateInTimeZone and minutesInTimeZone", () => {
    const moment = zonedTimeToDate("2026-03-29", 600, "Europe/Kyiv");
    expect(dateInTimeZone(moment, "Europe/Kyiv")).toBe("2026-03-29");
    expect(minutesInTimeZone(moment, "Europe/Kyiv")).toBe(600);
  });
});

describe("formatting a moment in a time zone", () => {
  test("formatTimeInZone shows the clock time there", () => {
    const moment = new Date("2026-07-01T07:30:00Z");
    expect(formatTimeInZone(moment, "Europe/Kyiv")).toBe("10:30");
    expect(formatTimeInZone(moment, "UTC")).toBe("07:30");
  });

  test("formatDayInZone uses the day there, not the UTC day", () => {
    const lateEvening = new Date("2026-07-01T22:30:00Z"); // 01:30 on 2 July in Kyiv
    // The comma after the weekday depends on the Node version, so only the day is checked.
    expect(formatDayInZone(lateEvening, "Europe/Kyiv")).toMatch(/Thu,? 2 Jul/);
    expect(formatDayInZone(lateEvening, "UTC")).toMatch(/Wed,? 1 Jul/);
  });
});
