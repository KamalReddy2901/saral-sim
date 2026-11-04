import { splitSentences, words } from "./wordcount";

export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  let n = (w.match(/[aeiouy]+/g) ?? []).length;
  if (w.endsWith("e") && !w.endsWith("le") && !w.endsWith("ee") && n > 1) n -= 1;
  return Math.max(n, 1);
}

/** Flesch-Kincaid grade (informal proxy, Master Doc 9.3 note). */
export function fkGrade(text: string): number {
  const ss = splitSentences(text);
  const ws = words(text);
  if (!ss.length || !ws.length) return 0;
  const syl = ws.reduce((a, w) => a + syllables(w), 0);
  return 0.39 * (ws.length / ss.length) + 11.8 * (syl / ws.length) - 15.59;
}

export const STOP = new Set([
  "the","a","an","and","or","of","to","in","on","at","is","are","it","its","this","that","then","up","down",
  "for","from","with","as","by","be","can","you","your","they","their","them","we","he","she","his","her",
  "do","does","did","has","have","had","will","would","who","which","what","where","how","about","into",
  "than","so","if","each","there","was","were","been","not","no","but","some","also","too","very","when","while",
]);

/** Words we treat as common knowledge when checking faithfulness (Master Doc A7 allowlist). */
export const ALLOWLIST = new Set(["earth", "thing", "things", "make", "made", "people", "new", "big", "small", "first", "next", "back", "up", "high"]);

export function stem(w: string): string {
  for (const suf of ["ing", "ed", "es", "s"]) {
    if (w.endsWith(suf) && w.length > suf.length + 2) return w.slice(0, -suf.length);
  }
  return w;
}

export function contentWords(text: string): Set<string> {
  return new Set(
    words(text)
      .map((w) => w.toLowerCase())
      .filter((w) => !STOP.has(w) && !/^\d+$/.test(w))
      .map(stem),
  );
}

export function contentWordList(text: string): string[] {
  return words(text)
    .map((w) => w.toLowerCase())
    .filter((w) => !STOP.has(w) && !/^\d+$/.test(w));
}
