import { describe, expect, it } from "vitest";
import { PASSAGES, passageWordCount } from "../src/data/passages";
import { attempts, candidates, templateReplacement } from "../src/data/retryScenario";
import { checkA, checkB } from "../src/preview/checks";
import { wordCount } from "../src/utils/wordcount";

describe("sample data", () => {
  it("passages are within 150-300 words", () => {
    for (const p of PASSAGES) {
      const n = passageWordCount(p);
      console.log(p.id, n);
      expect(n).toBeGreaterThanOrEqual(150);
      expect(n).toBeLessThanOrEqual(300);
    }
  });
  it("example easy-read passes Check A (computed)", () => {
    for (const p of PASSAGES) {
      const r = checkA(p.easyRead.map((s) => s.text), p.text);
      console.log(p.id, r.sentenceCount, r.longest, r.average.toFixed(2), r.fk.toFixed(2), r.coverage.toFixed(2), r.invented);
      expect(r.failedRules).toEqual([]);
    }
  });
  it("key word is in its own sentence (A8)", () => {
    for (const p of PASSAGES) for (const s of p.easyRead) expect(s.text.toLowerCase()).toContain(s.key.toLowerCase());
  });
  it("pictogram rule: election has none, rest are matched", () => {
    expect(PASSAGES[1].easyRead[5].pictogram).toBeNull();
    expect(PASSAGES[0].easyRead.every((s) => s.pictogram)).toBe(true);
  });
  it("scripted retry: attempt 1 fails A2 (19 words), attempt 2 passes", () => {
    expect(wordCount(attempts[0].sentences[3])).toBe(19);
    expect(attempts[0].result.A2).toBe(false);
    expect(attempts[1].result.passed).toBe(true);
  });
  it("scripted Check B: candidate 3 dropped, others kept, template valid", () => {
    expect(candidates.map((c) => c.result.passed)).toEqual([true, true, false]);
    expect(candidates[2].result.B4).toBe(false);
    expect(templateReplacement.source).toBe("template");
    expect(checkB(templateReplacement, PASSAGES[0].easyRead).B3).toBe(true);
  });
});
