import { copy } from "../data/copy";
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
          <button className="ghost-btn" onClick={() => setChapter(8)}>{copy.nav.skip}</button>
        </div>
      </header>
      <Banner />
    </>
  );
}

export function Rail() {
  const chapter = useStore((s) => s.chapter);
  const setChapter = useStore((s) => s.setChapter);
  const visited = useStore((s) => s.visited);
  const seen = visited.length;
  return (
    <nav className="rail" aria-label={copy.nav.chapters}>
      <div className="tour-note" role="note">
        <div className="tn-head"><img src={iconSrc("light")} alt="" width="22" height="22" /><strong>Take the tour</strong></div>
        <p>Go through the chapters one by one, from 01 to 12. Each shows one part of how Saral works. You can jump to any chapter at any time.</p>
        <div className="tn-bar" role="progressbar" aria-label="Chapters seen" aria-valuemin={0} aria-valuemax={CHAPTER_COUNT} aria-valuenow={seen}><i style={{ width: `${(seen / CHAPTER_COUNT) * 100}%` }} /></div>
        <span className="mono tn-count">{seen} of {CHAPTER_COUNT} seen</span>
      </div>
      <section className="rail-sec">
        <h2 className="label">Chapters</h2>
        <ol className="chaps">
          {copy.chapters.map((c, i) => (
            <li key={c.id}>
              <button className="chap" aria-current={i === chapter ? "step" : undefined} data-done={visited.includes(i) && i !== chapter ? "1" : "0"} onClick={() => setChapter(i)}>
                <img src={iconSrc(CHAPTER_ICONS[i])} alt="" width="22" height="22" draggable={false} />
                <span>{c.title}</span>
                <i className="chap-dot" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      </section>
      <p className="rail-keys mono">← → chapters · F fullscreen</p>
    </nav>
  );
}
