import type { ReactNode } from "react";
import { copy } from "../data/copy";
import { CHAPTER_COUNT, useStore } from "../store/useStore";
import { iconSrc } from "../utils/pictograms";

/** Per-chapter headline and lead for the reading chapters (the 3D chapters use their title and caption). */
export const PAGE_HEADS: Record<number, { title: string; text: string }> = {
  1: { title: "One idea, two ways to read it", text: "The same sentence from the water cycle passage, before and after Saral. Drag the divider to compare." },
  6: { title: "AI proposes. Code verifies.", text: "Plain code decides what the learner sees. If checks fail twice, a safe template is used." },
  7: { title: "No picture is better than a wrong one", text: "A picture is attached only when the key word matches the local library exactly." },
  9: { title: "Results, with honest labels", text: "The numbers the organisers ask for, plus quality measures. Each one says whether it is simulated or measured." },
  10: { title: "Impact: one sentence from the passage", text: "What Saral did with one real sentence, and what we do not claim." },
  11: { title: "Credits and licences", text: "The team, the links, and everything this simulation is built on." },
};

export function ChapterHead({ trailing }: { trailing?: ReactNode }) {
  const chapter = useStore((s) => s.chapter);
  const hero = chapter === 0;
  const page = PAGE_HEADS[chapter];
  return (
    <header className="vp-head">
      <div className="vp-title">
        <span className="mono vp-kicker"><i className="live" aria-hidden="true" />{hero ? "welcome" : `chapter ${String(chapter + 1).padStart(2, "0")} of ${CHAPTER_COUNT}`}</span>
        <h1 className="vp-h1">{hero ? copy.hero.headline : page?.title ?? copy.chapters[chapter].title}</h1>
        <p className="vp-text">{hero ? copy.hero.sub : page?.text ?? copy.captions[chapter]}</p>
      </div>
      <div className="vp-side">
        <p className="tip" role="note"><img src={iconSrc("light")} alt="" width="20" height="20" /><span>{copy.tips[chapter]}</span></p>
        {trailing}
      </div>
    </header>
  );
}

export function ChapterFoot({ tools }: { tools?: ReactNode }) {
  const chapter = useStore((s) => s.chapter);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const setChapter = useStore((s) => s.setChapter);
  const hero = chapter === 0;
  return (
    <footer className="vp-foot">
      {tools ?? <span />}
      <div className="vp-nav">
        {hero ? (
          <>
            <button className="ghost-btn" onClick={() => setChapter(8)}>{copy.hero.learner}</button>
            <button className="primary-btn" onClick={() => setChapter(1)}><span>{copy.hero.run}</span><kbd>→</kbd></button>
          </>
        ) : (
          <>
            <button className="ghost-btn" onClick={back}>Back</button>
            {chapter < CHAPTER_COUNT - 1
              ? <button className="primary-btn" onClick={next}><span>Continue</span><kbd>→</kbd></button>
              : <button className="primary-btn" onClick={() => setChapter(0)}><span>Start again</span></button>}
          </>
        )}
      </div>
    </footer>
  );
}

/** Frame for the reading chapters: the same header and footer as the 3D chapters, with the content scrolling between. */
export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <section className="page-frame">
      <ChapterHead />
      <div className="page-body">{children}</div>
      <ChapterFoot />
    </section>
  );
}
