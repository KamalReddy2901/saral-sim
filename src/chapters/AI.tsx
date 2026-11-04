import { useEffect, useState } from "react";
import { copy } from "../data/copy";
import { metrics } from "../data/metrics.config";
import { cancelRun, finishRun, startSimulation, STAGE_ANIM_MS, STAGE_METRIC_KEYS } from "../store/runSimulation";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";

function fmt(v: number | null, d = 1): string {
  return v === null ? copy.results.notMeasured : `${v.toFixed(d)} s`;
}

export function AI() {
  const passage = useActivePassage();
  const runStatus = useStore((s) => s.runStatus);
  const runStage = useStore((s) => s.runStage);
  const stageStatus = useStore((s) => s.stageStatus);
  const stageStart = useStore((s) => s.stageStart);
  const reduced = useStore((s) => s.reducedMotion);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (runStatus !== "running") return;
    const id = window.setInterval(() => setNow(performance.now()), 100);
    return () => window.clearInterval(id);
  }, [runStatus]);
  useEffect(() => () => cancelRun(), []);

  const retry = passage.id === "p1" && passage.subject !== "Custom";
  const frac = (i: number): number => {
    if (stageStatus[i] === "pending") return 0;
    if (stageStatus[i] !== "running") return 1;
    return Math.min(1, Math.max(0, (now - stageStart) / STAGE_ANIM_MS[i]));
  };
  const shown = (i: number): string => {
    const v = metrics.timeS[STAGE_METRIC_KEYS[i]];
    if (v === null) return stageStatus[i] === "pending" ? "—" : copy.results.notMeasured;
    return stageStatus[i] === "pending" ? "—" : `${(v * frac(i)).toFixed(1)} s`;
  };
  const ram = runStatus === "idle" ? 0 : runStage === 0 && stageStatus[0] === "running" ? frac(0) * 0.8 : runStage >= 1 ? 1 : 0.8;
  const mem = metrics.memoryMB;

  return (
    <Panel title={copy.ai.title}>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => startSimulation({ retry, reduced })} disabled={runStatus === "running"}>
          {runStatus === "done" ? copy.ai.rerun : copy.ai.run}
        </button>
        {runStatus === "running" && <button className="btn btn-ghost" onClick={() => finishRun(retry)}>{copy.ai.skip}</button>}
      </div>

      <div className="modelcard">
        <div className="term-head"><strong>{copy.ai.model}</strong> <Badge kind="metric" /></div>
        <dl className="kv">
          <dt>Model</dt><dd>{metrics.model.name}</dd>
          <dt>Quantization</dt><dd>{metrics.model.quant}</dd>
          <dt>Backend</dt><dd>{metrics.model.backend}</dd>
          <dt>File size</dt><dd>{metrics.model.fileMB === null ? copy.results.notMeasured : `${metrics.model.fileMB} MB`}</dd>
        </dl>
        <div className="ram">
          <span id="ram-label">{copy.ai.ramLabel}</span>
          <div className="bar" role="progressbar" aria-labelledby="ram-label" aria-valuemin={0} aria-valuemax={mem.withUI ?? 100} aria-valuenow={Math.round((mem.withUI ?? 0) * ram)}>
            <i style={{ width: `${ram * 100}%` }} />
          </div>
          <span className="muted">{mem.withUI === null ? copy.results.notMeasured : `${Math.round(mem.withUI * ram)} MB`}</span>
        </div>
      </div>

      <ol className="stages" aria-live="polite">
        {copy.ai.stages.map((s, i) => (
          <li key={s.id} data-state={stageStatus[i]}>
            <span className="stage-n" aria-hidden="true">{i + 1}</span>
            <span className="stage-name">{s.label}</span>
            <span className="stage-status">{copy.ai.status[stageStatus[i]]}</span>
            <span className="stage-time">{shown(i)}</span>
          </li>
        ))}
      </ol>
      <p className="muted stage-foot">
        <Badge kind="metric" /> Stage times follow the placeholder values in the metrics config.
        {metrics.timeS.total !== null && runStatus === "done" && <> Total {fmt(metrics.timeS.total)}.</>}
      </p>
      {runStatus === "idle" && <p className="muted">{copy.ai.idle}</p>}
      {runStatus === "done" && (
        <p className="ready"><strong>{copy.ai.ready}</strong> <Badge kind="example" /> {copy.ai.exampleNote}</p>
      )}
    </Panel>
  );
}
