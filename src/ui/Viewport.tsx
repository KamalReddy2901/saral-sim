import { lazy, Suspense } from "react";
import { copy } from "../data/copy";
import { CHAPTER_COUNT, useStore } from "../store/useStore";
import { iconSrc } from "../utils/pictograms";
import { PartCard, Toolbar } from "./SceneUi";

const Scene3D = lazy(() => import("../scene/Scene3D"));

/**
 * The 3D viewport as a header / canvas / footer stack. Nothing sits on top of the model:
 * the header explains the chapter, the footer holds the tools and the way forward.
 */
export function Viewport({ max, onToggleMax }: { max: boolean; onToggleMax: () => void }) {
  const chapter = useStore((s) => s.chapter);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const setChapter = useStore((s) => s.setChapter);
  const webgl = useStore((s) => s.canUse3d);
  const hero = chapter === 0;
  return (
    <section className="viewport" data-max={max ? "1" : "0"} data-hero={hero ? "1" : "0"} aria-label="3D device viewport">
      <header className="vp-head">
        <div className="vp-title">
          <span className="mono vp-kicker"><i className="live" aria-hidden="true" />{hero ? "welcome" : `chapter ${String(chapter + 1).padStart(2, "0")} of ${CHAPTER_COUNT}`}</span>
          <h1 className="vp-h1">{hero ? copy.hero.headline : copy.chapters[chapter].title}</h1>
          <p className="vp-text">{hero ? copy.hero.sub : copy.captions[chapter]}</p>
        </div>
        <div className="vp-side">
          <p className="tip" role="note"><img src={iconSrc("light")} alt="" width="20" height="20" /><span>{copy.tips[chapter]}</span></p>
          <button className="ghost-btn vp-full" onClick={onToggleMax} aria-pressed={max}>{max ? "Exit fullscreen" : "Fullscreen"} <kbd>F</kbd></button>
        </div>
      </header>

      <div className="vp-canvas">
        <div className="stage-wrap">
          {webgl ? (
            <Suspense fallback={null}><Scene3D /></Suspense>
          ) : (
            <p className="no-webgl">This browser cannot show the 3D model (WebGL is off). Every chapter still works from the list on the left, and the learner screen opens full screen.</p>
          )}
        </div>
        <div className="vp-chrome" aria-hidden="true"><i /><i /><i /><i /></div>
        <PartCard />
      </div>

      <footer className="vp-foot">
        {webgl ? <Toolbar /> : <span />}
        <div className="vp-nav">
          {hero ? (
            <>
              <button className="ghost-btn" onClick={() => setChapter(8)}>{copy.hero.learner}</button>
              <button className="primary-btn" onClick={() => setChapter(1)}><span>{copy.hero.run}</span><kbd>→</kbd></button>
            </>
          ) : (
            <>
              <button className="ghost-btn" onClick={back}>Back</button>
              {chapter < CHAPTER_COUNT - 1 && <button className="primary-btn" onClick={next}><span>Continue</span><kbd>→</kbd></button>}
            </>
          )}
        </div>
      </footer>
    </section>
  );
}
