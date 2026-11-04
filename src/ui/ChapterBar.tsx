import { copy } from "../data/copy";
import { CHAPTER_COUNT, useStore } from "../store/useStore";
import { iconSrc } from "../utils/pictograms";
import { Banner } from "./Banner";

/** One pictogram per chapter: the navigation is made of the product's own visual language. */
export const CHAPTER_ICONS = ["sun", "question", "hand", "book", "cross", "light", "tick", "plant", "leader", "up", "seed", "earth"] as const;

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark-tile"><img src={iconSrc("sun")} alt="" width="30" height="30" /></span>
      <span className="wordmark-text">saral</span>
    </span>
  );
}

export function TopBar() {
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const view = useStore((s) => s.view);
  const setView = useStore((s) => s.setView);
  const canUse3d = useStore((s) => s.canUse3d);
  const setChapter = useStore((s) => s.setChapter);
  return (
    <header className="topbar">
      <div className="topbar-row">
        <button className="brand-btn" onClick={() => setChapter(0)} aria-label="Saral, back to the start"><Wordmark /></button>
        <div className="topbar-tools">
          <div className="seg" role="group" aria-label="Mode">
            <button aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>{copy.nav.guided}</button>
            <button aria-pressed={mode === "explore"} onClick={() => setMode("explore")} disabled={view === "2d"}>{copy.nav.explore}</button>
          </div>
          {canUse3d && (
            <button className="chip-btn" onClick={() => setView(view === "3d" ? "2d" : "3d")}>
              {view === "3d" ? copy.nav.view2d : copy.nav.view3d}
            </button>
          )}
          <button className="chip-btn chip-accent" onClick={() => setChapter(8)}>{copy.nav.skip}</button>
        </div>
      </div>
      <Banner />
    </header>
  );
}

const Arrow = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "l" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
  </svg>
);

export function Dock() {
  const chapter = useStore((s) => s.chapter);
  const setChapter = useStore((s) => s.setChapter);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  return (
    <nav className="dock" aria-label={copy.nav.chapters}>
      <div className="dock-label">
        <b className="dock-num" aria-label={`Chapter ${chapter + 1} of ${CHAPTER_COUNT}`}>{String(chapter + 1).padStart(2, "0")}</b>
        <strong>{copy.chapters[chapter].title}</strong>
      </div>
      <div className="dock-row">
        <button className="key-btn" onClick={back} disabled={chapter === 0} aria-label={copy.nav.back}><Arrow dir="l" /></button>
        <ol className="tiles">
          {copy.chapters.map((c, i) => (
            <li key={c.id}>
              <button className="tile" data-state={i < chapter ? "done" : i === chapter ? "now" : "next"} aria-label={c.title} aria-current={i === chapter ? "step" : undefined} onClick={() => setChapter(i)}>
                <img src={iconSrc(CHAPTER_ICONS[i])} alt="" width="32" height="32" draggable={false} />
                <span className="tile-tip" aria-hidden="true">{c.rail}</span>
              </button>
            </li>
          ))}
        </ol>
        <select className="dock-select" aria-label={copy.nav.chapters} value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
          {copy.chapters.map((c, i) => (<option key={c.id} value={i}>{`${i + 1}. ${c.title}`}</option>))}
        </select>
        <button className="key-btn key-go" onClick={next} disabled={chapter === CHAPTER_COUNT - 1} aria-label={copy.nav.next}><Arrow dir="r" /></button>
      </div>
    </nav>
  );
}
