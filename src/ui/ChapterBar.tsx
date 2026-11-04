import { copy } from "../data/copy";
import { CHAPTER_COUNT, useStore } from "../store/useStore";

export function ChapterBar() {
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
      <nav className="rail" aria-label={copy.nav.chapters}>
        <div className="rail-brand">{copy.brand}</div>
        <ol className="rail-list">
          {copy.chapters.map((c, i) => (
            <li key={c.id}>
              <button className="rail-item" aria-current={i === chapter ? "step" : undefined} onClick={() => setChapter(i)}>
                <span className="rail-mark" aria-hidden="true" />
                {c.rail}
              </button>
            </li>
          ))}
        </ol>
        <div className="rail-tools">
          <div className="seg" role="group" aria-label="Mode">
            <button aria-pressed={mode === "guided"} onClick={() => setMode("guided")}>{copy.nav.guided}</button>
            <button aria-pressed={mode === "explore"} onClick={() => setMode("explore")} disabled={view === "2d"}>{copy.nav.explore}</button>
          </div>
          {canUse3d && (
            <button className="link-btn" onClick={() => setView(view === "3d" ? "2d" : "3d")}>
              {view === "3d" ? copy.nav.view2d : copy.nav.view3d}
            </button>
          )}
          <button className="link-btn" onClick={() => setChapter(8)}>{copy.nav.skip}</button>
        </div>
      </nav>

      <nav className="dock" aria-label={copy.nav.chapters}>
        <button className="dock-btn" onClick={back} disabled={chapter === 0}>{copy.nav.back}</button>
        <div className="dock-mid">
          <select className="dock-select" aria-label={copy.nav.chapters} value={chapter} onChange={(e) => setChapter(Number(e.target.value))}>
            {copy.chapters.map((c, i) => (
              <option key={c.id} value={i}>{`${i + 1}. ${c.title}`}</option>
            ))}
          </select>
          <span className="dock-pos" aria-label={`Chapter ${chapter + 1} of ${CHAPTER_COUNT}`}>
            {Array.from({ length: CHAPTER_COUNT }, (_, i) => (
              <i key={i} data-on={i <= chapter ? "1" : "0"} />
            ))}
          </span>
        </div>
        <button className="dock-btn dock-next" onClick={next} disabled={chapter === CHAPTER_COUNT - 1}>{copy.nav.next}</button>
      </nav>
    </>
  );
}
