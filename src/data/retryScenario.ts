// Scripted "Example run" for Chapter 6 (P1 only). The sentences come from Master Doc 11.1 and the
// retry brief. The verdicts shown in the UI are computed by the real check functions on this text.
import { PASSAGES, type Question } from "./passages";
import { checkA, checkB, type CheckAResult, type CheckBResult } from "../preview/checks";
import { templateQuestions } from "../preview/basicMode";

const p1 = PASSAGES[0];

export const ATTEMPT_1_S4 = "Up high, the air is cold, so the warm vapour cools and turns into tiny drops that form clouds.";
export const ATTEMPT_2_S4 = p1.easyRead[3].text; // "Up high, it is cold, and clouds form."

const base = p1.easyRead.map((s) => s.text);
export const ATTEMPT_1 = base.map((t, i) => (i === 3 ? ATTEMPT_1_S4 : t));
export const ATTEMPT_2 = base;

export const RETRY_NOTE = "Your last answer had a sentence longer than 12 words. Fix that.";

export interface AttemptView { label: string; sentences: string[]; result: CheckAResult }
export const attempts: AttemptView[] = [
  { label: "Attempt 1", sentences: ATTEMPT_1, result: checkA(ATTEMPT_1, p1.text) },
  { label: "Attempt 2", sentences: ATTEMPT_2, result: checkA(ATTEMPT_2, p1.text) },
];

/** Model's candidate questions in the scripted run. Candidate 3 has a wrong option that is also in the text. */
export const candidateQuestions: Question[] = [
  p1.quiz[0],
  p1.quiz[1],
  { id: 3, type: "choice", question: "Where does the warm water rise?", options: ["The sky", "The sea"], correct: 0, support: 3, source: "model" },
];

export interface CandidateView { q: Question; result: CheckBResult }
export const candidates: CandidateView[] = candidateQuestions.map((q) => ({ q, result: checkB(q, p1.easyRead) }));

/** The template fallback adds a verified question when fewer than 3 survive. */
export const templateReplacement: Question = (() => {
  const t = templateQuestions(p1.easyRead, 4).find((q) => q.type === "choice") ?? templateQuestions(p1.easyRead, 4)[0];
  return { ...t, id: 3 };
})();
