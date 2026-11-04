import { lazy, Suspense, useEffect, useState } from "react";
import { copy } from "./data/copy";
import { Intro } from "./chapters/Intro";
import { Device } from "./chapters/Device";
import { Load } from "./chapters/Load";
import { Offline } from "./chapters/Offline";
import { AI } from "./chapters/AI";
import { FullscreenLearner, Learner2D, LearnerChapter } from "./chapters/LearnerChapter";
import { Device2D } from "./scene/Device2D";
import { startSimulation } from "./store/runSimulation";
import { prefersReducedMotion, useStore } from "./store/useStore";
import { Briefing } from "./ui/Briefing";
import { Header, Rail, Wordmark } from "./ui/ChapterBar";
import { ExploreHud, HoverTip, PartCard } from "./ui/SceneUi";
import { detectCapabilities, modeFromUrl } from "./utils/capabilities";
import { ARASAAC_CREDIT, ARASAAC_IN_USE, iconSrc } from "./utils/pictograms";

const Scene3D = lazy(() => import("./scene/Scene3D"));
const Barrier = lazy(() => import("./chapters/Barrier").then((m) => ({ default: m.Barrier })));
const Checks = lazy(() => import("./chapters/Checks").then((m) => ({ default: m.Checks })));
const Pictograms = lazy(() => import("./chapters/Pictograms").then((m) => ({ default: m.Pictograms })));
const Results = lazy(() => import("./chapters/Results").then((m) => ({ default: m.Results })));
const Impact = lazy(() => import("./chapters/Impact").then((m) => ({ default: m.Impact })));
const Credits = lazy(() => import("./chapters/Credits").then((m) => ({ default: m.Credits })));

/** Chapters that are reading material: the 3D viewport steps aside and the content takes the centre. */
const SPAN = new Set([1, 6, 7, 9, 10, 11]);

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

function ExploreHudSlot() {
  const mode = useStore((s) => s.mode);
  return mode === "explore" ? <ExploreHud /> : null;
}

export function App() {
  const chapter = useStore((s) => s.chapter);
  const view = useStore((s) => s.view);
  const mode = useStore((s) => s.mode);
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const setChapter = useStore((s) => s.setChapter);
  const reduced = useStore((s) => s.reducedMotion);
  const sceneReady = useStore((s) => s.sceneReady);
  const [forceReady, setForceReady] = useState(false);
  const [max, setMax] = useState(false);

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

  useEffect(() => { const id = window.setTimeout(() => setForceReady(true), 9000); return () => window.clearTimeout(id); }, []);

  // The Ethernet cable is pulled out in chapter 4 (shared by the 3D and 2D views).
  useEffect(() => {
    const st = useStore.getState();
    if (chapter < 4) { st.setCableOut(false); st.setCloudTried(false); return; }
    if (chapter === 4 && !st.cableOut) {
      if (reduced) { st.setCableOut(true); return; }
      const id = window.setTimeout(() => useStore.getState().setCableOut(true), 1400);
      return () => window.clearTimeout(id);
    }
  }, [chapter, reduced]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, .lrn, .fs")) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") back();
      else if (e.key.toLowerCase() === "f") setMax((m) => !m);
      else if (e.key === "Escape") setMax(false);
      else if (e.key.toLowerCase() === "r") {
        const st = useStore.getState();
        st.setChapter(5);
        startSimulation({ retry: st.passageId === "p1" && !st.custom, reduced: st.reducedMotion });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  const span = SPAN.has(chapter);
  const show3d = view === "3d";
  const veilDone = view === "2d" || sceneReady || forceReady;

  return (
    <div className="app" data-chapter={chapter} data-span={span ? "1" : "0"} data-ready={veilDone ? "1" : "0"}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); setChapter(8); document.getElementById("main")?.focus(); }}>{copy.nav.skip}</a>
      <Header />
      <Rail />

      <section className="viewport" data-max={max ? "1" : "0"} aria-label="Device viewport">
        <div className="stage-wrap">
          {chapter === 8 && !show3d ? <Learner2D /> : show3d ? <Suspense fallback={null}><Scene3D /></Suspense> : <Device2D />}
        </div>
        <div className="vp-chrome" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="vp-tag mono">fig.{String(chapter + 1).padStart(2, "0")} / {copy.chapters[chapter].rail.toLowerCase()}</div>
        <button className="vp-full ghost-btn" onClick={() => setMax((m) => !m)} aria-pressed={max}>{max ? "Exit fullscreen" : "Fullscreen"} <kbd>F</kbd></button>
        <div className="vp-read mono" aria-hidden="true">{show3d ? `3d · ${mode}` : "2d · guided"}</div>
        <Briefing />
        {show3d && <ExploreHudSlot />}
        {show3d && <PartCard />}
      </section>

      <main id="main" tabIndex={-1} className="side" aria-label={copy.chapters[chapter].title}>
        {chapter !== 0 && <h1 className="sr-only">{copy.chapters[chapter].title}</h1>}
        <Suspense fallback={null}><ChapterView chapter={chapter} /></Suspense>
        {ARASAAC_IN_USE && <footer className="arasaac-credit">{ARASAAC_CREDIT} Non-commercial use.</footer>}
      </main>

      {show3d && <HoverTip />}
      <FullscreenLearner />
      <div className="veil" aria-hidden={veilDone} data-done={veilDone ? "1" : "0"}>
        <img className="veil-sun" src={iconSrc("sun")} alt="" width="64" height="64" />
        <Wordmark />
        <span className="veil-bar"><i /></span>
      </div>
    </div>
  );
}
