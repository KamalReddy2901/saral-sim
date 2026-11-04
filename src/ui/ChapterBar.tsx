import { copy } from "../data/copy";
import { CHAPTER_COUNT, useStore } from "../store/useStore";
import { Banner } from "./Banner";

export function Wordmark() {
  return (
    <span className="wordmark">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <rect width="32" height="32" rx="10" fill="url(#wm)" /><defs><linearGradient id="wm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9d2ff" /><stop offset="1" stopColor="#ffc9a8" /></linearGradient></defs>
        <path d="M9 21c0-6 4-10 14-11-1 9-5 13-11 13-1.2 0-2.200-.5-3-1.500z" fill="#0a0a0b" />
        <path d="M9 23c3-4 6-7 10-9" stroke="#e6dcff" strokeWidth="1.600" strokeLinecap="round" fill="none" />
      </svg>
      <span>{copy.brand}</span>
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
            <button className="tool-btn" onClick={() => setView(view === "3d" ? "2d" : "3d")}>
              {view === "3d" ? copy.nav.view2d : copy.nav.view3d}
            </button>
          )}
          <button className="tool-btn tool-accent" onClick={() => setChapter(8)}>{copy.nav.skip}</button>
        </div>
      </div>
      <Banner />
    </header>
  );
}

const Chevron = ({ dir }: { dir: "l" | "r" }) => (
  <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={dir === "l" ? "M12 4l-6 6 6 6" : "M8 4l6 6-6 6"} />
  </svg>
);

export function Dock() {
  const chapter = useStore((s) => s.chapter);
  const setChapter = useStore((s) => s.setChapter);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  return (
    <nav className="dock" aria-label={copy.nav.chapters}>
      <button className="dock-btn" onClick={back} disabled={chapter === 0} aria-label={copy.nav.back}><Chevron dir="l" /></button>
      <div className="dock-center">
        <div className="dock-label">
          <span className="dock-num" aria-label={`Chapter ${chapter + 1} of ${CHAPTER_COUNT}`}>{String(chapter + 1).padStart(2, "0")}<small>/{CHAPTER_COUNT}</small></span>
          <strong>{copy.chapters[chapter].title}</strong>
        </div>
        <ol className="dock-ticks">
          {copy.chapters.map((c, i) => (
            <li key={c.id}>
              <button className="tick" data-state={i < chapter ? "done" : i === chapter ? "now" : "next"} aria-label={c.title} aria-current={i === chapter ? "step" : undefined} onClick={() => setChapter(i)}>
                <span className="tick-tip" aria-hidden="true">{c.rail}</span>
              </button>
            </li>
          ))}
        </ol>
        <select className="dock-select" aria-label={copy.nav.chapters} value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
          {copy.chapters.map((c, i) => (<option key={c.id} value={i}>{`${i + 1}. ${c.title}`}</option>))}
        </select>
      </div>
      <button className="dock-btn dock-next" onClick={next} disabled={chapter === CHAPTER_COUNT - 1} aria-label={copy.nav.next}><Chevron dir="r" /></button>
    </nav>
  );
}
