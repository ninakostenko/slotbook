import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, test } from "vitest";

import { en } from "@/lib/i18n/messages/en";
import { uk } from "@/lib/i18n/messages/uk";
import { createTranslate } from "@/lib/i18n/translate";
import { slugify } from "@/lib/slug";

// Every text of a catalog with its dotted key: { "landing.heroTitle": "Your booking page..." }.
function flatten(value: object, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, child] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof child === "string") result[path] = child;
    else Object.assign(result, flatten(child as object, path));
  }
  return result;
}

const english = flatten(en);
const ukrainian = flatten(uk);

// "{name}" and "{count}" in a text.
function placeholders(text: string) {
  return [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
}

describe("the message catalogs", () => {
  test("Ukrainian has exactly the keys of English", () => {
    expect(Object.keys(ukrainian).sort()).toEqual(Object.keys(english).sort());
  });

  test("no text is empty", () => {
    for (const [key, text] of Object.entries(english)) {
      expect(text.trim(), `en ${key}`).not.toBe("");
    }
    for (const [key, text] of Object.entries(ukrainian)) {
      expect(text.trim(), `uk ${key}`).not.toBe("");
    }
  });

  test("both languages insert the same values", () => {
    for (const [key, text] of Object.entries(english)) {
      expect(placeholders(ukrainian[key] ?? ""), key).toEqual(
        placeholders(text),
      );
    }
  });
});

// Every key that the source code mentions must exist, so a typo is caught here and not by a visitor.
function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "generated" || name === ".next") {
      continue;
    }
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) {
      files.push(path);
    }
  }
  return files;
}

describe("the keys used in the code", () => {
  test("all of them exist", () => {
    const sections =
      "meta|common|weekdays|errors|validation|landing|auth|onboarding|dashboard|bookings|services|schedule|settings|book|confirmation|notFound|errorPage";
    const pattern = new RegExp(
      `["'\`]((?:${sections})\\.[A-Za-z0-9_.]+)["'\`]`,
      "g",
    );
    const missing: string[] = [];

    for (const dir of ["app", "components", "lib", "proxy.ts"]) {
      const paths = dir.endsWith(".ts") ? [dir] : sourceFiles(dir);
      for (const path of paths) {
        // The catalogs themselves, and translate.ts (it has example keys in its comments).
        if (path.includes(join("lib", "i18n", "messages"))) continue;
        if (path.endsWith(join("i18n", "translate.ts"))) continue;
        const text = readFileSync(path, "utf8");
        for (const match of text.matchAll(pattern)) {
          const key = match[1] ?? "";
          // "schedule.days" is the name of a form field, not a message.
          if (key.startsWith("schedule.days")) continue;
          if (!(key in english)) missing.push(`${path}: ${key}`);
        }
      }
    }

    expect(missing).toEqual([]);
  });
});

describe("t()", () => {
  const t = createTranslate(uk);

  test("inserts values", () => {
    expect(t("dashboard.welcome", { name: "Ніна" })).toBe("Вітаємо, Ніна");
    expect(t("onboarding.stepOf", { step: 2, total: 3 })).toBe("Крок 2 з 3");
  });

  test("returns a text that is not a key as it is", () => {
    expect(t("Something the server wrote")).toBe("Something the server wrote");
  });
});

describe("Ukrainian links", () => {
  test("a Ukrainian business name gives a usable link", () => {
    expect(slugify("Студія Анни")).toBe("studiia-anny");
  });
});
