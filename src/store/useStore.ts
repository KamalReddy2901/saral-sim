import { create } from "zustand";
import type { Passage } from "../data/passages";
import { copy } from "../data/copy";

export const CHAPTER_COUNT = copy.chapters.length;

export type RunStatus = "idle" | "running" | "done";
export type StageStatus = "pending" | "running" | "passed" | "retried";

export interface LearnerSettings { textSize: 0 | 1 | 2; theme: "normal" | "high" }

interface State {
  chapter: number;
  mode: "guided" | "explore";
  passageId: Passage["id"];
  /** A basic-mode preview of the visitor's own passage, when active. */
  custom: Passage | null;
  view: "3d" | "2d";
  canUse3d: boolean;
  reducedMotion: boolean;
  fullscreen: boolean;

  runStatus: RunStatus;
  /** Index of the stage currently running (0..5); 6 when finished. */
  runStage: number;
  stageStatus: StageStatus[];
  stageStart: number; // performance.now() when the current stage began
  runToken: number; // bumps when a run starts, to restart particle effects

  cableOut: boolean;
  cloudTried: boolean;

  learner: LearnerSettings;
  learnerKey: number;

  setChapter: (n: number) => void;
  next: () => void;
  back: () => void;
  setMode: (m: State["mode"]) => void;
  setPassage: (id: Passage["id"]) => void;
  setCustom: (p: Passage | null) => void;
  setView: (v: State["view"]) => void;
  setFullscreen: (b: boolean) => void;
  setRun: (patch: Partial<Pick<State, "runStatus" | "runStage" | "stageStatus" | "stageStart">>) => void;
  startRun: () => void;
  setCableOut: (b: boolean) => void;
  setCloudTried: (b: boolean) => void;
  setLearner: (patch: Partial<LearnerSettings>) => void;
}

const idleStages = (): StageStatus[] => Array(6).fill("pending");

export const useStore = create<State>((set, get) => ({
  chapter: 0,
  mode: "guided",
  passageId: "p1",
  custom: null,
  view: "3d",
  canUse3d: true,
  reducedMotion: false,
  fullscreen: false,

  runStatus: "idle",
  runStage: 0,
  stageStatus: idleStages(),
  stageStart: 0,
  runToken: 0,

  cableOut: false,
  cloudTried: false,

  learner: { textSize: 1, theme: "normal" },
  learnerKey: 0,

  setChapter: (n) => set({ chapter: Math.max(0, Math.min(CHAPTER_COUNT - 1, n)), fullscreen: false }),
  next: () => get().setChapter(get().chapter + 1),
  back: () => get().setChapter(get().chapter - 1),
  setMode: (mode) => set({ mode }),
  setPassage: (passageId) =>
    set((s) => ({ passageId, custom: null, learnerKey: s.learnerKey + 1, runStatus: "idle", runStage: 0, stageStatus: idleStages() })),
  setCustom: (custom) => set((s) => ({ custom, learnerKey: s.learnerKey + 1, runStatus: "idle", runStage: 0, stageStatus: idleStages() })),
  setView: (view) => set({ view }),
  setFullscreen: (fullscreen) => set({ fullscreen }),
  setRun: (patch) => set(patch),
  startRun: () => set((s) => ({ runStatus: "running", runStage: 0, stageStatus: idleStages(), runToken: s.runToken + 1 })),
  setCableOut: (cableOut) => set({ cableOut }),
  setCloudTried: (cloudTried) => set({ cloudTried }),
  setLearner: (patch) => set((s) => ({ learner: { ...s.learner, ...patch } })),
}));

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
}
