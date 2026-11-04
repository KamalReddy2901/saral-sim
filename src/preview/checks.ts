// Plain-code checks from Master Doc 9.3 (Check A) and 9.5 (Check B).
// These run on the EXAMPLE text in your browser. They are real arithmetic on the example,
// not measurements of the Raspberry Pi.
import { ALLOWLIST, contentWords, fkGrade } from "../utils/readability";
import { avgWordsPerSentence, wordCount, words } from "../utils/wordcount";
import type { EasySentence, Question } from "../data/passages";

/** [CALIB] thresholds, as proposed in the Master Doc. */
export const CHECK_A = {
  minSentences: 5,
  maxSentences: 7,
  maxWords: 12,
  avgTarget: 9,
  fkMax: 5, // Master Doc says "about 4"; informal proxy, calibrate on the Pi test set
  faithfulness: 0.9,
} as const;

const NUMBER_WORDS: Record<string, string> = {
  one: "1", two: "2", three: "3", four: "4", five: "5", six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
};
const normNum = (w: string) => NUMBER_WORDS[w.toLowerCase()] ?? w.toLowerCase();

export interface SentenceCheck { id: number; words: number; ok: boolean; reason?: string }
export interface CheckAResult {
  sentenceCount: number;
  longest: number;
  average: number;
  fk: number;
  invented: string[]; // numbers/names not in the original (A6)
  coverage: number; // share of content words found in the original (A7)
  A1: boolean; A2: boolean; A3: boolean; A6: boolean; A7: boolean;
  passed: boolean;
  perSentence: SentenceCheck[];
  failedRules: string[];
}

export function checkA(sentences: string[], original: string): CheckAResult {
  const counts = sentences.map(wordCount);
  const longest = Math.max(0, ...counts);
  const average = avgWordsPerSentence(sentences);
  const joined = sentences.join(" ");
  const fk = fkGrade(joined);

  const origWords = new Set(words(original).map(normNum));
  const invented: string[] = [];
  sentences.forEach((s) => {
    words(s).forEach((w, i) => {
      const isNumber = /^\d+$/.test(w);
      const isName = i > 0 && /^[A-Z]/.test(w);
      if ((isNumber || isName) && !origWords.has(normNum(w)) && !ALLOWLIST.has(w.toLowerCase())) invented.push(w);
    });
  });

  const src = contentWords(original);
  const got = contentWords(joined);
  let hit = 0;
  got.forEach((w) => { if (src.has(w) || ALLOWLIST.has(w)) hit += 1; });
  const coverage = got.size ? hit / got.size : 1;

  const A1 = sentences.length >= CHECK_A.minSentences && sentences.length <= CHECK_A.maxSentences;
  const A2 = longest <= CHECK_A.maxWords && average <= CHECK_A.avgTarget;
  const A3 = fk <= CHECK_A.fkMax;
  const A6 = invented.length === 0;
  const A7 = coverage >= CHECK_A.faithfulness;

  const failedRules: string[] = [];
  if (!A1) failedRules.push("A1 sentence count");
  if (!A2) failedRules.push(longest > CHECK_A.maxWords ? "A2 longest sentence over 12 words" : "A2 average sentence length");
  if (!A3) failedRules.push("A3 reading grade");
  if (!A6) failedRules.push("A6 invented number or name");
  if (!A7) failedRules.push("A7 words not found in the passage");

  return {
    sentenceCount: sentences.length, longest, average, fk, invented, coverage,
    A1, A2, A3, A6, A7, passed: failedRules.length === 0,
    perSentence: sentences.map((_s, i) => ({
      id: i + 1, words: counts[i], ok: counts[i] <= CHECK_A.maxWords,
      reason: counts[i] > CHECK_A.maxWords ? `${counts[i]} words, limit ${CHECK_A.maxWords}` : undefined,
    })),
    failedRules,
  };
}

// ---------------- Check B ----------------

export interface CheckBResult {
  B2: boolean; B3: boolean; B4: boolean; B5: boolean; B6: boolean; B7: boolean;
  passed: boolean;
  failed: { rule: string; why: string }[];
}

const hasAll = (needle: Set<string>, hay: Set<string>) => [...needle].every((w) => hay.has(w));

export function checkB(q: Question, sentences: Pick<EasySentence, "text">[]): CheckBResult {
  const support = sentences[q.support - 1]?.text ?? "";
  const supportCW = contentWords(support);
  const allCW = new Set<string>();
  sentences.forEach((s) => contentWords(s.text).forEach((w) => allCW.add(w)));
  const qCW = contentWords(q.question);
  const failed: { rule: string; why: string }[] = [];
  const res = { B2: true, B3: true, B4: true, B5: true, B6: true, B7: true };

  if (wordCount(q.question) > 12 || (q.type === "choice" && q.options.some((o) => wordCount(o) > 3))) {
    res.B2 = false; failed.push({ rule: "B2", why: "Question or option too long" });
  }
  let qGrounded = 0;
  qCW.forEach((w) => { if (supportCW.has(w)) qGrounded += 1; });
  if (qCW.size && qGrounded / qCW.size < 0.5) {
    res.B5 = false; failed.push({ rule: "B5", why: "Question is not about the supporting sentence" });
  }

  if (q.type === "choice") {
    const correct = q.options[q.correct];
    const wrong = q.options[q.correct === 0 ? 1 : 0];
    if (!hasAll(contentWords(correct), supportCW)) {
      res.B3 = false; failed.push({ rule: "B3", why: `"${correct}" is not in the supporting sentence` });
    }
    const wrongCW = contentWords(wrong);
    const clash = [...wrongCW].some((w) => allCW.has(w));
    if (clash) {
      res.B4 = false; failed.push({ rule: "B4", why: `Wrong option "${wrong}" also appears in the text` });
    }
  } else if (q.answer) {
    if (!hasAll(qCW, supportCW)) {
      res.B6 = false; failed.push({ rule: "B6", why: "A Yes question must use only words from its sentence" });
    }
  } else {
    const absent = [...qCW].some((w) => !allCW.has(w));
    if (!absent) {
      res.B7 = false; failed.push({ rule: "B7", why: "A No question must contain a word that is not in the lesson" });
    }
  }
  return { ...res, passed: failed.length === 0, failed };
}
