import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { copy } from "./data/copy";
import { SPAN_CHAPTERS } from "./data/chapterMeta";
import { Intro } from "./chapters/Intro";
import { Device } from "./chapters/Device";
import { Load } from "./chapters/Load";
import { Offline } from "./chapters/Offline";
import { AI } from "./chapters/AI";
import { FullscreenLearner, LearnerChapter } from "./chapters/LearnerChapter";
import { prefersReducedMotion, useStore } from "./store/useStore";
import { Header, Rail, Wordmark } from "./ui/ChapterBar";
import { HoverTip } from "./ui/SceneUi";
import { Viewport } from "./ui/Viewport";
import { detectCapabilities } from "./utils/capabilities";
import { ARASAAC_CREDIT, ARASAAC_IN_USE, iconSrc } from "./utils/pictograms";

const chunks = {
  Barrier: () => import("./chapters/Barrier").then((m) => ({ default: m.Barrier })),
  Checks: () => import("./chapters/Checks").then((m) => ({ default: m.Checks })),
  Pictograms: () => import("./chapters/Pictograms").then((m) => ({ default: m.Pictograms })),
  Results: () => import("./chapters/Results").then((m) => ({ default: m.Results })),
  Impact: () => import("./chapters/Impact").then((m) => ({ default: m.Impact })),
  Credits: () => import("./chapters/Credits").then((m) => ({ default: m.Credits })),
};
const Barrier = lazy(chunks.Barrier);
const Checks = lazy(chunks.Checks);
const Pictograms = lazy(chunks.Pictograms);
const Results = lazy(chunks.Results);
const Impact = lazy(chunks.Impact);
const Credits = lazy(chunks.Credits);

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
  const next = useStore((s) => s.next);
  const back = useStore((s) => s.back);
  const setChapter = useStore((s) => s.setChapter);
  const reduced = useStore((s) => s.reducedMotion);
  const sceneReady = useStore((s) => s.sceneReady);
  const webgl = useStore((s) => s.canUse3d);
  const [forceReady, setForceReady] = useState(false);
  const [max, setMax] = useState(false);
  const side = useRef<HTMLElement>(null);

  useEffect(() => {
    const caps = detectCapabilities();
    useStore.setState({ canUse3d: caps.webgl, reducedMotion: prefersReducedMotion() });
    const ch = Number(new URLSearchParams(window.location.search).get("chapter"));
    if (Number.isInteger(ch) && ch > 0) useStore.getState().setChapter(ch);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => useStore.setState({ reducedMotion: mq.matches });
    mq.addEventListener("change", onChange);
    // Warm every chapter chunk once the page is idle, so chapter changes never show a loading gap.
    const warm = window.setTimeout(() => { Object.values(chunks).forEach((load) => void load()); }, 1500);
    return () => { mq.removeEventListener("change", onChange); window.clearTimeout(warm); };
  }, []);

  useEffect(() => { const id = window.setTimeout(() => setForceReady(true), 9000); return () => window.clearTimeout(id); }, []);
  useEffect(() => { side.current?.scrollTo({ top: 0 }); }, [chapter]);

  // The Ethernet cable is pulled out in chapter 5.
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, back]);

  const span = SPAN_CHAPTERS.has(chapter);
  const veilDone = !webgl || sceneReady || forceReady;

  return (
    <div className="app" data-chapter={chapter} data-span={span ? "1" : "0"} data-ready={veilDone ? "1" : "0"}>
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); setChapter(8); document.getElementById("main")?.focus(); }}>{copy.nav.skip}</a>
      <Header />
      <Rail />
      <Viewport max={max} onToggleMax={() => setMax((m) => !m)} />
      <main id="main" ref={side} tabIndex={-1} className="side" aria-label={copy.chapters[chapter].title}>
        {chapter !== 0 && span && <h1 className="sr-only">{copy.chapters[chapter].title}</h1>}
        <div className="side-fade" key={chapter}>
          <Suspense fallback={null}><ChapterView chapter={chapter} /></Suspense>
        </div>
        {ARASAAC_IN_USE && <footer className="arasaac-credit">{ARASAAC_CREDIT} Non-commercial use.</footer>}
      </main>
      <HoverTip />
      <FullscreenLearner />
      <div className="veil" aria-hidden={veilDone} data-done={veilDone ? "1" : "0"}>
        <img className="veil-sun" src={iconSrc("sun")} alt="" width="64" height="64" />
        <Wordmark />
        <span className="veil-bar"><i /></span>
      </div>
    </div>
  );
}
