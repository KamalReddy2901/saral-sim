import { useStore, type StageStatus } from "./useStore";

/** Animation length of each stage in ms. These are animation timings, not performance claims. */
export const STAGE_ANIM_MS = [1500, 2400, 1700, 2000, 1500, 1500] as const;
export const STAGE_METRIC_KEYS = ["load", "easyRead", "checkA", "questions", "checkB", "pictograms"] as const;

let timers: number[] = [];
const clear = () => { timers.forEach((id) => window.clearTimeout(id)); timers = []; };

/** P1 shows the scripted retry in Check A; every other passage passes first time. */
function finalStatuses(retry: boolean): StageStatus[] {
  return ["passed", "passed", retry ? "retried" : "passed", "passed", "passed", "passed"];
}

export function finishRun(retry: boolean) {
  clear();
  useStore.getState().setRun({ runStatus: "done", runStage: 6, stageStatus: finalStatuses(retry) });
}

export function startSimulation(opts: { retry: boolean; reduced: boolean }) {
  clear();
  const st = useStore.getState();
  st.startRun();
  if (opts.reduced) { finishRun(opts.retry); return; }

  const runStage = (i: number) => {
    const s = useStore.getState();
    const statuses = s.stageStatus.slice();
    statuses[i] = "running";
    s.setRun({ runStage: i, stageStatus: statuses, stageStart: performance.now() });
    timers.push(window.setTimeout(() => {
      const cur = useStore.getState();
      const after = cur.stageStatus.slice();
      after[i] = finalStatuses(opts.retry)[i];
      cur.setRun({ stageStatus: after });
      if (i + 1 < STAGE_ANIM_MS.length) runStage(i + 1);
      else finishRun(opts.retry);
    }, STAGE_ANIM_MS[i]));
  };
  runStage(0);
}

export function cancelRun() { clear(); }
