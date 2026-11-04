import { lazy, Suspense } from "react";
import { useStore } from "../store/useStore";
import { ChapterFoot, ChapterHead } from "./ChapterFrame";
import { PartCard, Toolbar } from "./SceneUi";

const Scene3D = lazy(() => import("../scene/Scene3D"));

/**
 * The 3D viewport as a header / canvas / footer stack. Nothing sits on top of the model:
 * the header explains the chapter, the footer holds the tools and the way forward.
 */
export function Viewport({ max, onToggleMax }: { max: boolean; onToggleMax: () => void }) {
  const chapter = useStore((s) => s.chapter);
  const webgl = useStore((s) => s.canUse3d);
  return (
    <section className="viewport" data-max={max ? "1" : "0"} data-hero={chapter === 0 ? "1" : "0"} aria-label="3D device viewport">
      <ChapterHead trailing={<button className="ghost-btn vp-full" onClick={onToggleMax} aria-pressed={max}>{max ? "Exit fullscreen" : "Fullscreen"} <kbd>F</kbd></button>} />
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
      <ChapterFoot tools={webgl ? <Toolbar /> : undefined} />
    </section>
  );
}
