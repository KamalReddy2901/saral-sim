import { lazy, Suspense, useEffect } from "react";
import { copy } from "./data/copy";
import { Intro } from "./chapters/Intro";
import { Device } from "./chapters/Device";
import { Load } from "./chapters/Load";
import { Offline } from "./chapters/Offline";
import { AI } from "./chapters/AI";
import { FullscreenLearner, LearnerChapter } from "./chapters/LearnerChapter";
import { CHAPTER_COUNT, prefersReducedMotion, useStore } from "./store/useStore";
import { Banner } from "./ui/Banner";
import { ChapterBar } from "./ui/ChapterBar";
import { detectCapabilities, modeFromUrl } from "./utils/capabilities";
import { ARASAAC_CREDIT, ARASAAC_IN_USE } from "./utils/pictograms";
import { Device2D } from "./scene/Device2D";

const Scene3D = lazy(() => import("./scene/Scene3D"));
const Barrier = lazy(() => import("./chapters/Barrier").then((m) => ({ default: m.Barrier })));
const Checks = lazy(() => import("./chapters/Checks").then((m) => ({ default: m.Checks })));
const Pictograms = lazy(() => import("./chapters/Pictograms").then((m) => ({ default: m.Pictograms })));
const Results = lazy(() => import("./chapters/Results").then((m) => ({ default: m.Results })));
const Impact = lazy(() => import("./chapters/Impact").then((m) => ({ default: m.Impact })));
const Credits = lazy(() => import("./chapters/Credits").then((m) => ({ default: m.Credits })));

/** Light-world chapters hide the stage entirely. */
const LIGHT = new Set([1, 9, 10, 11]);
/** Chapters whose wide panel dims the 3D scene behind it. */
const DIM = new Set([6, 7]);

function ChapterView({ chapter }: { chapter: number }) {
  switch (chapter) {
    case 0: return <Intro />;
    case 1: return <Barrier />;
    case 2: return <Device />;
    case 3: return <Load />;
    case 4: return <Offline />;
    case 5: return <AI />;
    case 6: return <Checks />;
    case 7: return <Pictograms />;
    case 8: return <LearnerChapter />;
    case 9: return <Results />;
    case 10: return <Impact />;
    default: return <Credits />;
  }
}

export function App() {
  const chapter = useStore((s) => s.chapter);
  const view = useStore((s) => s.view);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const setChapter = useStore((s) => s.setChapter);

  // Capability detection, once.
  useEffect(() => {
    const caps = detectCapabilities();
    const forced = modeFromUrl();
    const use3d = forced ? forced === "3d" && caps.webgl : caps.webgl && !caps.lowPower;
    useStore.setState({ canUse3d: caps.webgl, view: use3d ? "3d" : "2d", reducedMotion: prefersReducedMotion() });
    const ch = Number(new URLSearchParams(window.location.search).get("chapter"));
    if (Number.isInteger(ch) && ch > 0) useStore.getState().setChapter(ch);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => useStore.setState({ reducedMotion: mq.matches });
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Chapter side effects shared by the 3D and 2D views: the Ethernet cable is pulled out in chapter 4.
  const reduced = useStore((s) => s.reducedMotion);
  useEffect(() => {
    const st = useStore.getState();
    if (chapter < 4) { st.setCableOut(false); st.setCloudTried(false); return; }
    if (chapter === 4 && !st.cableOut) {
      if (reduced) { st.setCableOut(true); return; }
      const id = window.setTimeout(() => useStore.getState().setCableOut(true), 1400);
      return () => window.clearTimeout(id);
    }
  }, [chapter, reduced]);

  // Keyboard: arrows move between chapters unless the user is typing or inside the learner screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, .lrn, .fs")) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  const light = LIGHT.has(chapter);
  const show3d = view === "3d";

  return (
    <div className="app" data-world="dark" data-chapter={chapter}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); setChapter(8); document.getElementById("main")?.focus(); }}>
        {copy.nav.skip}
      </a>
      <ChapterBar />
      <div className="main">
        <Banner />
        <div className="stage-area">
          <div className="stage-wrap" data-hidden={light ? "1" : "0"} data-dim={DIM.has(chapter) ? "1" : "0"}>
            {show3d ? (
              <Suspense fallback={null}>
                <Scene3D />
              </Suspense>
            ) : (
              <Device2D />
            )}
          </div>
          <main id="main" tabIndex={-1} className="overlay" aria-label={copy.chapters[chapter].title}>
            {chapter !== 0 && <h1 className="sr-only">{copy.chapters[chapter].title}</h1>}
            <Suspense fallback={null}>
              <ChapterView chapter={chapter} />
            </Suspense>
            {!light && chapter !== 0 && !DIM.has(chapter) && <p className="caption">{copy.captions[chapter]}</p>}
            {light || chapter === 0 ? <p className="sr-only">{copy.captions[chapter]}</p> : null}
            {DIM.has(chapter) && <p className="sr-only">{copy.captions[chapter]}</p>}
            {chapter !== 0 && (
              <div className="stepper">
                <button className="btn btn-sm" onClick={back}>{copy.nav.back}</button>
                {chapter < CHAPTER_COUNT - 1 && <button className="btn btn-sm btn-next" onClick={next}>{copy.nav.next}</button>}
              </div>
            )}
          </main>
        </div>
        {ARASAAC_IN_USE && <footer className="arasaac-credit">{ARASAAC_CREDIT} Non-commercial use.</footer>}
      </div>
      <FullscreenLearner />
    </div>
  );
}
