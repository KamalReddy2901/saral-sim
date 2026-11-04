// Basic-mode preview: the deterministic fallback from Master Doc 9.3 plus the template
// quiz from 9.5, reimplemented in plain TypeScript. This is NOT the AI model.
import type { EasySentence, Question } from "../data/passages";
import { stem, STOP } from "../utils/readability";
import { crudeLemma, matchPictogram, pictogramUrl } from "../utils/pictograms";
import { splitSentences, wordCount, words } from "../utils/wordcount";

const MAX_WORDS = 12;
const TARGET_SENTENCES = 6;

export function cleanText(text: string): string {
  return text
    .replace(/\([^)]*\)|\[[^\]]*\]/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .trim();
}

const contentTokens = (s: string) => words(s).filter((w) => !STOP.has(w.toLowerCase()) && !/^\d+$/.test(w));

export function frequencies(text: string): Map<string, number> {
  const f = new Map<string, number>();
  contentTokens(text).forEach((w) => {
    const k = stem(w.toLowerCase());
    f.set(k, (f.get(k) ?? 0) + 1);
  });
  return f;
}

function scoreOf(s: string, freq: Map<string, number>): number {
  const toks = [...new Set(contentTokens(s).map((w) => stem(w.toLowerCase())))];
  const sum = toks.reduce((a, k) => a + (freq.get(k) ?? 0), 0);
  return sum / Math.max(6, wordCount(s));
}

const KEY_SKIP = new Set(["called", "without", "enough", "again", "some", "more", "much", "many", "every", "other", "just", "often", "finally", "once", "things", "thing", "start", "takes", "take", "heats", "around"]);
const SUBORDINATE = /^(when|if|after|before|without|as|while|although|since)\s/i;
const LEAD = /^(and|but|so|then|which|who|where|because|that|also)\s+/i;

/** Split a long sentence at commas and " and / which / who ..." and keep the best short piece. */
export function shorten(sentence: string, freq: Map<string, number>): string | null {
  const s = cleanText(sentence).replace(/[.!?]+$/, "");
  if (wordCount(s) <= MAX_WORDS && !s.includes(":")) return finish(s);
  const pieces = s
    .split(/,\s+|:\s+|\s+(?:and|which|who|where|because|but)\s+/i)
    .map((p) => p.trim().replace(LEAD, "").trim())
    .filter((p) => wordCount(p) >= 3 && wordCount(p) <= MAX_WORDS);
  if (!pieces.length) return null;
  const rank = (p: string) => scoreOf(p, freq) * (SUBORDINATE.test(p) ? 0.3 : 1);
  pieces.sort((a, b) => rank(b) - rank(a));
  return finish(pieces[0]);
}

function finish(s: string): string {
  const t = s.trim().replace(/[;:,]+$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1) + ".";
}

/** Highest-scoring content word in the sentence (ties: longer word, then earlier). */
export function keyWord(sentence: string, freq: Map<string, number>, used: Set<string> = new Set()): string {
  const all = contentTokens(sentence);
  const fresh = all.filter((w) => !used.has(stem(w.toLowerCase())));
  const toks = fresh.length ? fresh : all;
  if (!toks.length) return words(sentence)[0] ?? "";
  let best = toks[0];
  let bestScore = -1;
  toks.forEach((w) => {
    const lw = w.toLowerCase();
    if (KEY_SKIP.has(lw)) return;
    const sc = (freq.get(stem(lw)) ?? 0) * 100 + w.length + (pictogramUrl(crudeLemma(lw)) ? 100000 : 0);
    if (sc > bestScore) { best = w; bestScore = sc; }
  });
  return best;
}

export interface BasicResult {
  mode: "basic";
  easyRead: EasySentence[];
  quiz: Question[];
}

export function basicMode(text: string): BasicResult {
  const cleaned = cleanText(text);
  const sents = splitSentences(cleaned).filter((s) => wordCount(s) >= 4);
  const freq = frequencies(cleaned);

  const ranked = sents
    .map((s, i) => ({ s, i, score: scoreOf(s, freq) }))
    .sort((a, b) => b.score - a.score);

  const picked: { i: number; text: string }[] = [];
  for (const r of ranked) {
    if (picked.length >= TARGET_SENTENCES) break;
    const short = shorten(r.s, freq);
    if (short && !picked.some((p) => p.text === short)) picked.push({ i: r.i, text: short });
  }
  picked.sort((a, b) => a.i - b.i);

  const usedKeys = new Set<string>();
  const easyRead: EasySentence[] = picked.map((p, idx) => {
    const key = keyWord(p.text, freq, usedKeys);
    usedKeys.add(stem(key.toLowerCase()));
    return { id: idx + 1, text: p.text, key, pictogram: matchPictogram(key, p.text)?.file ?? null };
  });
  return { mode: "basic", easyRead, quiz: templateQuestions(easyRead, 4) };
}

function maskKey(text: string, key: string): string {
  const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return text.replace(re, "___");
}

function swapKey(text: string, key: string, other: string): string {
  const re = new RegExp(`\\b${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return text.replace(re, other);
}

/** Distractor: a key word from a different sentence that is not already in this sentence. */
function distractorFor(sentences: EasySentence[], i: number): string | null {
  const own = sentences[i];
  const ownWords = new Set(words(own.text).map((w) => stem(w.toLowerCase())));
  for (let step = 1; step < sentences.length; step++) {
    const cand = sentences[(i + step) % sentences.length].key;
    if (!ownWords.has(stem(cand.toLowerCase())) && stem(cand.toLowerCase()) !== stem(own.key.toLowerCase())) return cand;
  }
  return null;
}

/** Template questions (Master Doc 9.5): always grounded in the text the learner saw. */
export function templateQuestions(sentences: EasySentence[], count = 4): Question[] {
  const n = sentences.length;
  if (n < 2) return [];
  const slots = Array.from({ length: Math.min(count, n) }, (_, k) => Math.floor((k * n) / Math.min(count, n)));
  const out: Question[] = [];
  slots.forEach((idx, k) => {
    const s = sentences[idx];
    const d = distractorFor(sentences, idx);
    if (!d) return;
    const id = out.length + 1;
    const kind = k % 2 === 0 ? (k % 4 === 0 ? "yes" : "no") : "choice";
    if (kind === "choice") {
      out.push({
        id, type: "choice", source: "template", support: s.id,
        question: `Which word fits? ${maskKey(s.text, s.key)}`,
        options: [s.key, d], correct: 0,
      });
    } else if (kind === "yes") {
      out.push({ id, type: "yesno", source: "template", support: s.id, question: `Is it true? ${s.text}`, answer: true });
    } else {
      out.push({ id, type: "yesno", source: "template", support: s.id, question: `Is it true? ${swapKey(s.text, s.key, d)}`, answer: false });
    }
  });
  return out;
}
