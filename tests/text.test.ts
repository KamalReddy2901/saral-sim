import { describe, expect, it } from "vitest";
import { basicMode, cleanText, shorten, frequencies } from "../src/preview/basicMode";
import { PASSAGES } from "../src/data/passages";
import { fkGrade, syllables } from "../src/utils/readability";
import { splitSentences, wordCount, wordCountState } from "../src/utils/wordcount";
import { highlight } from "../src/utils/highlight";
import { contrastRatio } from "../src/utils/contrast";
import { THEMES } from "../src/learner/themes";
import { crudeLemma, matchPictogram } from "../src/utils/pictograms";

describe("word utilities", () => {
  it("counts words like the master doc script", () => {
    expect(wordCount("It's 5 years, isn't it?")).toBe(5);
  });
  it("splits sentences", () => {
    expect(splitSentences("One. Two! Three? Four")).toHaveLength(4);
  });
  it("validity states", () => {
    expect(wordCountState(149)).toBe("short");
    expect(wordCountState(150)).toBe("ok");
    expect(wordCountState(300)).toBe("ok");
    expect(wordCountState(301)).toBe("long");
  });
  it("counts syllables and grade", () => {
    expect(syllables("water")).toBe(2);
    expect(fkGrade("The cat sat. The dog ran.")).toBeLessThan(2);
  });
  it("highlights case-insensitively", () => {
    expect(highlight("The Sun heats.", ["sun"]).filter((s) => s.mark).map((s) => s.text)).toEqual(["Sun"]);
  });
});

describe("basic-mode preview", () => {
  it("drops brackets and shortens long sentences", () => {
    expect(cleanText("Hello (ignore this) world.")).toBe("Hello world.");
    const f = frequencies(PASSAGES[0].text);
    const s = shorten("The cold air cools the vapour, and it turns back into tiny drops of liquid water and then more words follow here", f);
    expect(s === null || wordCount(s) <= 12).toBe(true);
  });
  it.each(PASSAGES.map((p) => [p.id, p.text] as const))("produces a grounded lesson for %s", (_id, text) => {
    const r = basicMode(text);
    expect(r.mode).toBe("basic");
    expect(r.easyRead.length).toBeGreaterThanOrEqual(4);
    expect(r.easyRead.length).toBeLessThanOrEqual(6);
    r.easyRead.forEach((s) => {
      expect(wordCount(s.text)).toBeLessThanOrEqual(12);
      expect(s.text.toLowerCase()).toContain(s.key.toLowerCase());
    });
    expect(r.quiz.length).toBeGreaterThanOrEqual(3);
    r.quiz.forEach((q) => {
      expect(q.source).toBe("template");
      expect(q.support).toBeGreaterThanOrEqual(1);
      expect(q.support).toBeLessThanOrEqual(r.easyRead.length);
    });
  });
  it("is deterministic", () => {
    expect(basicMode(PASSAGES[1].text)).toEqual(basicMode(PASSAGES[1].text));
  });
});

describe("pictogram rule", () => {
  it("uses exact lemmas only", () => {
    expect(crudeLemma("leaves")).toBe("leaf");
    expect(crudeLemma("rivers")).toBe("river");
    expect(matchPictogram("election", "A new election is held every 5 years.")).toBeNull();
    expect(matchPictogram("clouds", "Up high, it is cold, and clouds form.")?.lemma).toBe("cloud");
  });
});

describe("learner contrast", () => {
  const pairs = (t: (typeof THEMES)["normal"]) => [
    [t.fg, t.bg], [t.soft, t.bg], [t.primaryFg, t.primaryBg], [t.secondaryFg, t.secondaryBg],
    [t.keyFg, t.keyBg], [t.goodFg, t.goodBg], [t.lookFg, t.lookBg], [t.fg, t.panel],
  ];
  it.each(["normal", "high"] as const)("%s theme reaches 7:1", (k) => {
    for (const [a, b] of pairs(THEMES[k])) expect(contrastRatio(a, b)).toBeGreaterThanOrEqual(7);
  });
});
