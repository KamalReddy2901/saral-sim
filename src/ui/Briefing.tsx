import { useEffect, useState } from "react";
import { copy } from "../data/copy";
import { CHAPTER_COUNT, useStore } from "../store/useStore";

/** The "briefing" card inside the viewport: what this chapter shows, and how to move on. */
export function Briefing() {
  const chapter = useStore((s) => s.chapter);
  const next = useStore((s) => s.next);
  const setChapter = useStore((s) => s.setChapter);
  const view = useStore((s) => s.view);
  const mode = useStore((s) => s.mode);
  const hero = chapter === 0;
  const [folded, setFolded] = useState(false);
  useEffect(() => setFolded(false), [chapter]);
  return (
    <div className="briefing" data-hero={hero ? "1" : "0"} data-folded={folded ? "1" : "0"}>
      <div className="b-tag mono"><i className="live" aria-hidden="true" />briefing / fig.{String(chapter + 1).padStart(2, "0")}
        {!hero && <button className="b-fold" onClick={() => setFolded((f) => !f)} aria-expanded={!folded}>{folded ? "show" : "hide"}</button>}
      </div>
      <h1 className="b-title">{hero ? copy.hero.headline : copy.chapters[chapter].title}</h1>
      <p className="b-text">{hero ? copy.hero.sub : copy.captions[chapter]}</p>
      {view === "2d" && hero && <p className="b-text b-note">{copy.fallback2d}</p>}
      <ul className="b-keys">
        <li><span>Move between chapters</span><span><kbd>←</kbd><kbd>→</kbd></span></li>
        <li><span>Fullscreen the viewport</span><span><kbd>F</kbd></span></li>
        {view === "3d" && <li><span>{mode === "explore" ? "Orbit and zoom" : "Hover and click parts"}</span><span><kbd>drag</kbd></span></li>}
      </ul>
      <div className="b-actions">
        {hero ? (
          <>
            <button className="primary-btn" onClick={() => setChapter(1)}><span>{copy.hero.run}</span><kbd>↵</kbd></button>
            <button className="ghost-btn" onClick={() => setChapter(8)}>{copy.hero.learner}</button>
          </>
        ) : chapter < CHAPTER_COUNT - 1 ? (
          <button className="primary-btn" onClick={next}><span>Continue</span><kbd>→</kbd></button>
        ) : null}
      </div>
    </div>
  );
}
