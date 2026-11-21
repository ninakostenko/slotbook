import { describe, expect, test } from "vitest";

import { slugify } from "@/lib/slug";

describe("slugify", () => {
  test("makes a link from a Latin name", () => {
    expect(slugify("Anna's Studio")).toBe("annas-studio");
    expect(slugify("  Glow  Beauty  Studio ")).toBe("glow-beauty-studio");
  });

  test("writes Ukrainian names in Latin letters", () => {
    expect(slugify("Студія Анни")).toBe("studiia-anny");
    expect(slugify("Салон Краси")).toBe("salon-krasy");
    expect(slugify("Їжак і Щука")).toBe("izhak-i-shchuka");
    expect(slugify("Пʼятниця")).toBe("piatnytsia");
  });

  test("drops anything else and is at most 40 characters", () => {
    expect(slugify("★ Nails ★")).toBe("nails");
    expect(slugify("a".repeat(60))).toHaveLength(40);
  });
});
