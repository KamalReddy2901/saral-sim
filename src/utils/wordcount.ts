const WORD_RE = /[A-Za-z0-9']+/g;

/** Words as defined in Master Doc 16.3. */
export function words(text: string): string[] {
  return text.match(WORD_RE) ?? [];
}

export function wordCount(text: string): number {
  return words(text).length;
}

/** Split into sentences at . ! ? followed by whitespace. */
export function splitSentences(text: string): string[] {
  return text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const MIN_WORDS = 150;
export const MAX_WORDS = 300;

export type WordCountState = "short" | "ok" | "long";
export function wordCountState(n: number): WordCountState {
  if (n < MIN_WORDS) return "short";
  if (n > MAX_WORDS) return "long";
  return "ok";
}

export function avgWordsPerSentence(sentences: string[]): number {
  if (!sentences.length) return 0;
  return sentences.reduce((a, s) => a + wordCount(s), 0) / sentences.length;
}
