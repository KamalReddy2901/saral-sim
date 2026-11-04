import { copy } from "../data/copy";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { LearnerApp } from "../learner/LearnerApp";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";

export function LearnerChapter() {
  const p = useActivePassage();
  const setFullscreen = useStore((s) => s.setFullscreen);
  return (
    <>
      <Panel title={copy.learner.title}>
        <p>{copy.learner.hint}</p>
        <p className="muted"><strong>{p.title}</strong> <Badge kind="example" /></p>
        <p className="muted">{copy.learner.passageNote}</p>
        <div className="btn-row">
          <button className="btn btn-primary" onClick={() => setFullscreen(true)}>{copy.learner.fullscreen}</button>
        </div>
      </Panel>
    </>
  );
}

/** Same component, full size. Best experience on phones. */
export function FullscreenLearner() {
  const open = useStore((s) => s.fullscreen);
  const setFullscreen = useStore((s) => s.setFullscreen);
  const p = useActivePassage();
  const settings = useStore((s) => s.learner);
  const setLearner = useStore((s) => s.setLearner);
  if (!open) return null;
  return (
    <div className="fs" role="dialog" aria-modal="true" aria-label={copy.learner.fullscreen} onKeyDown={(e) => { if (e.key === "Escape") setFullscreen(false); }}>
      <div className="fs-bar">
        <span className="fs-tag"><Badge kind="example" /> Simulation of the Saral prototype</span>
        <button className="btn btn-ghost btn-sm" onClick={() => setFullscreen(false)} autoFocus>{copy.learner.close}</button>
      </div>
      <div className="fs-body"><LearnerApp passage={p} settings={settings} onSettingsChange={setLearner} /></div>
    </div>
  );
}
