// Ukrainian (and a few Russian) letters in Latin, as in the official Ukrainian transliteration.
const cyrillic: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
  ы: "y",
  э: "e",
  ъ: "",
  ё: "io",
};

// A business name -> a link: "Anna's Studio" -> "annas-studio", "Студія Анни" -> "studiia-anny".
// Other letters that are not in a-z or 0-9 are dropped, so the owner can still type the link by hand.
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/['’ʼ`]/g, "")
    .replace(/[а-яіїєґёыэъ]/g, (letter) => cyrillic[letter] ?? "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
