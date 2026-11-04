import index from "../data/pictogramIndex.json";
import { words } from "./wordcount";
import { STOP } from "./readability";

const LEXICON = index as Record<string, string>;

// Optional ARASAAC PNGs. Drop <lemma>.png files into src/assets/arasaac/ and they are
// picked up automatically (and the exact credit text then appears everywhere).
const arasaacFiles = import.meta.glob("../assets/arasaac/*.png", { query: "?url", import: "default", eager: true }) as Record<string, string>;
const ARASAAC: Record<string, string> = {};
for (const [path, url] of Object.entries(arasaacFiles)) {
  const m = /([^/]+)\.png$/.exec(path);
  if (m) ARASAAC[m[1].toLowerCase()] = url;
}
export const ARASAAC_IN_USE = Object.keys(ARASAAC).length > 0;

const IRREGULAR: Record<string, string> = { leaves: "leaf", "street lights": "streetlight", streetlights: "streetlight" };

/** Conservative lemma: strip plural / -ing / -ed with a few exceptions (Master Doc 12.4). */
export function crudeLemma(word: string): string {
  const w = word.toLowerCase();
  if (IRREGULAR[w]) return IRREGULAR[w];
  if (w in LEXICON || w in ARASAAC) return w;
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) {
    const base = w.slice(0, -1);
    return base;
  }
  return w;
}

export interface PictogramMatch {
  lemma: string;
  file: string; // file name in /pictograms
  url: string; // resolved URL
  source: "saral" | "arasaac";
}

export function pictogramUrl(lemma: string): PictogramMatch | null {
  if (ARASAAC[lemma]) return { lemma, file: `${lemma}.png`, url: ARASAAC[lemma], source: "arasaac" };
  const file = LEXICON[lemma];
  if (!file) return null;
  return { lemma, file, url: `${import.meta.env.BASE_URL}pictograms/${file}`, source: "saral" };
}

/**
 * Exact-lemma matching. Candidates: key word first, then other words of the sentence in order.
 * No fuzzy or semantic guessing: no match means no picture.
 */
export function matchPictogram(key: string, sentence: string): PictogramMatch | null {
  const candidates = [key, ...words(sentence).filter((w) => !STOP.has(w.toLowerCase()))];
  for (const c of candidates) {
    const hit = pictogramUrl(crudeLemma(c));
    if (hit) return hit;
  }
  return null;
}

/** Rows for the mapping animation: the lookup trail for a key word. */
export function lookupTrail(key: string, sentence: string): { word: string; lemma: string; hit: boolean }[] {
  const out: { word: string; lemma: string; hit: boolean }[] = [];
  const candidates = [key, ...words(sentence).filter((w) => !STOP.has(w.toLowerCase()) && w.toLowerCase() !== key.toLowerCase())];
  for (const c of candidates) {
    const lemma = crudeLemma(c);
    const hit = pictogramUrl(lemma) !== null;
    out.push({ word: c, lemma, hit });
    if (hit) break;
  }
  return out;
}

export const LEXICON_SIZE = Object.keys(LEXICON).length;
export const LEXICON_LEMMAS = Object.keys(LEXICON);

export const ARASAAC_CREDIT =
  "Pictograms author: Sergio Palao. Origin: ARASAAC (http://www.arasaac.org). License: CC (BY-NC-SA). Owner: Government of Aragon (Spain).";
