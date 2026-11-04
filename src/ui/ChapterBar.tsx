import { copy } from "../data/copy";
import { PASSAGES, passageWordCount } from "../data/passages";
import { startSimulation } from "../store/runSimulation";
import { CHAPTER_COUNT, useStore } from "../store/useStore";
import { iconSrc } from "../utils/pictograms";
import { Banner } from "./Banner";

/** One pictogram per chapter: navigation made of the product's own visual language. */
export const CHAPTER_ICONS = ["sun", "question", "hand", "book", "cross", "light", "tick", "plant", "leader", "up", "seed", "earth"] as const;

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark-tile"><img src={iconSrc("sun")} alt="" width="22" height="22" /></span>
      <span className="wordmark-text">Saral</span>
      <span className="wordmark-sub">simulation</span>
    </span>
  );
}

const Chev = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={dir === "l" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"} /></svg>
);

export function Header() {
  const chapter = useStore((s) => s.chapter);
  const setChapter = useStore((s) => s.setChapter);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const canUse3d = useStore((s) => s.canUse3d);
  return (
    <>
      <header className="head">
        <button className="brand-btn" onClick={() => setChapter(0)}><Wordmark /></button>
        <div className="stepper" role="group" aria-label={copy.nav.chapters}>
          <button className="icon-btn" onClick={back} disabled={chapter === 0} aria-label={copy.nav.back}><Chev dir="l" /></button>
          <span className="step-label" aria-label={`Chapter ${chapter + 1} of ${CHAPTER_COUNT}`}>
            <b className="mono">{String(chapter + 1).padStart(2, "0")}<i>/{CHAPTER_COUNT}</i></b>
            <select className="step-select" aria-label={copy.nav.chapters} value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
              {copy.chapters.map((c, i) => (<option key={c.id} value={i}>{c.title}</option>))}
            </select>
          </span>
          <button className="icon-btn" onClick={next} disabled={chapter === CHAPTER_COUNT - 1} aria-label={copy.nav.next}><Chev dir="r" /></button>
        </div>
        <div className="head-tools">
          <div className="seg" role="group" aria-label="Mode">
            <button aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>{copy.nav.guided}</button>
            <button aria-pressed={mode === "explore"} onClick={() => setMode("explore")} disabled={view === "2d"}>{copy.nav.explore}</button>
          </div>
          {canUse3d && <button className="ghost-btn" onClick={() => setView(view === "3d" ? "2d" : "3d")}>{view === "3d" ? copy.nav.view2d : copy.nav.view3d}</button>}
          <button className="ghost-btn tool-skip" onClick={() => setChapter(8)}>{copy.nav.skip}</button>
        </div>
      </header>
      <Banner />
    </>
  );
}

export function Rail() {
  const chapter = useStore((s) => s.chapter);
  const setChapter = useStore((s) => s.setChapter);
  const passageId = useStore((s) => s.passageId);
  const custom = useStore((s) => s.custom);
  const setPassage = useStore((s) => s.setPassage);
  const learner = useStore((s) => s.learner);
  const setLearner = useStore((s) => s.setLearner);

  const run = () => {
    const st = useStore.getState();
    st.setChapter(5);
    startSimulation({ retry: st.passageId === "p1" && !st.custom, reduced: st.reducedMotion });
  };

  return (
    <aside className="rail" aria-label="Chapters and settings">
      <section className="rail-sec">
        <h2 className="label"><b>01</b> Chapters</h2>
        <ol className="chaps">
          {copy.chapters.map((c, i) => (
            <li key={c.id}>
              <button className="chap" aria-current={i === chapter ? "step" : undefined} data-done={i < chapter ? "1" : "0"} onClick={() => setChapter(i)}>
                <img src={iconSrc(CHAPTER_ICONS[i])} alt="" width="22" height="22" draggable={false} />
                <span>{c.title}</span>
                <i className="chap-dot" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="rail-sec">
        <h2 className="label"><b>02</b> Passage</h2>
        <div className="opts" role="radiogroup" aria-label="Sample passage">
          {PASSAGES.map((p) => (
            <button key={p.id} role="radio" aria-checked={!custom && passageId === p.id} className="opt" onClick={() => setPassage(p.id)}>
              <strong>{p.title}</strong>
              <span>{p.subject} · {passageWordCount(p)} words</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rail-sec">
        <h2 className="label"><b>03</b> Learner screen</h2>
        <div className="field">
          <span className="field-name" id="lbl-size">Text size</span>
          <div className="seg seg-fill" role="group" aria-labelledby="lbl-size">
            {(["Small", "Medium", "Large"] as const).map((s, i) => (
              <button key={s} aria-pressed={learner.textSize === i} onClick={() => setLearner({ textSize: i as 0 | 1 | 2 })}>{s}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <span className="field-name" id="lbl-theme">Colours</span>
          <div className="seg seg-fill" role="group" aria-labelledby="lbl-theme">
            <button aria-pressed={learner.theme === "normal"} onClick={() => setLearner({ theme: "normal" })}>Normal</button>
            <button aria-pressed={learner.theme === "high"} onClick={() => setLearner({ theme: "high" })}>High contrast</button>
          </div>
        </div>
      </section>

      <div className="rail-foot">
        <button className="primary-btn" onClick={run}><span>Run the simulation</span><kbd>R</kbd></button>
        <p className="note">The checks catch many mistakes, not all. Example outputs only.</p>
      </div>
    </aside>
  );
}
