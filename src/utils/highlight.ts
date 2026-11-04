export interface Segment { text: string; mark: boolean }

/** Split a sentence into plain and highlighted segments for the given terms (case-insensitive). */
export function highlight(sentence: string, terms: string[]): Segment[] {
  const clean = terms.map((t) => t.trim()).filter(Boolean).sort((a, b) => b.length - a.length);
  if (!clean.length) return [{ text: sentence, mark: false }];
  const re = new RegExp(`(${clean.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  return sentence
    .split(re)
    .filter((p) => p !== "")
    .map((p) => ({ text: p, mark: clean.some((t) => t.toLowerCase() === p.toLowerCase()) }));
}
