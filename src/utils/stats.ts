import type { Passage } from "../data/passages";
import { fkGrade } from "./readability";
import { avgWordsPerSentence, splitSentences, wordCount } from "./wordcount";

/** Real arithmetic on the example text. Never hard-coded. */
export function passageStats(p: Pick<Passage, "text" | "easyRead" | "quiz">) {
  const origSentences = splitSentences(p.text);
  const easy = p.easyRead.map((s) => s.text);
  return {
    origWords: wordCount(p.text),
    origSentenceCount: origSentences.length,
    origAvg: avgWordsPerSentence(origSentences),
    origFk: fkGrade(p.text),
    easyCount: easy.length,
    easyAvg: avgWordsPerSentence(easy),
    easyFk: fkGrade(easy.join(" ")),
    pictures: p.easyRead.filter((s) => s.pictogram).length,
    questions: p.quiz.length,
  };
}
