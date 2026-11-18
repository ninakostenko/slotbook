import { describe, expect, test } from "vitest";

import { isOverlapError } from "@/lib/booking-errors";

describe("isOverlapError", () => {
  test("recognises the PostgreSQL exclusion violation", () => {
    // The shape Prisma 7 gives for code 23P01, taken from a real failed insert.
    const error = {
      code: "P2039",
      meta: { driverAdapterError: { cause: { originalCode: "23P01" } } },
    };
    expect(isOverlapError(error)).toBe(true);
  });

  test("ignores other errors", () => {
    expect(isOverlapError(new Error("boom"))).toBe(false);
    expect(isOverlapError(null)).toBe(false);
    expect(isOverlapError({ code: "P2002", meta: { target: ["x"] } })).toBe(
      false,
    );
    expect(
      isOverlapError({
        meta: { driverAdapterError: { cause: { originalCode: "23505" } } },
      }),
    ).toBe(false);
  });
});
