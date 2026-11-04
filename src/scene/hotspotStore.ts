import { create } from "zustand";
import { createRef } from "react";
import type { Group } from "three";

/** Which device part is highlighted, hovered, or focused. Shared by the chapter panel list, hotspots and the 3D scene. */
export const useHotspot = create<{
  active: string | null; hover: string | null; focus: [number, number, number] | null; explode: number; viewReset: number;
  setActive: (id: string | null) => void; setHover: (id: string | null) => void;
  setFocus: (p: [number, number, number] | null) => void; setExplode: (v: number) => void; resetView: () => void;
}>((set) => ({
  active: null, hover: null, focus: null, explode: 1, viewReset: 0,
  setActive: (active) => set({ active }),
  setHover: (hover) => set({ hover }),
  setFocus: (focus) => set({ focus }),
  setExplode: (explode) => set({ explode }),
  resetView: () => set((s) => ({ viewReset: s.viewReset + 1, focus: null })),
}));

/** Objects that can hide the CSS3D learner display when they are in front of it. */
export const occluders = { pi: createRef<Group>(), usb: createRef<Group>() };
