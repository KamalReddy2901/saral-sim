import { create } from "zustand";

/** Which device part is highlighted. Shared by the chapter panel list and the 3D / 2D hotspots. */
export const useHotspot = create<{ active: string | null; setActive: (id: string | null) => void }>((set) => ({
  active: null,
  setActive: (active) => set({ active }),
}));

import { createRef } from "react";
import type { Group } from "three";

/** Objects that can hide the CSS3D learner display when they are in front of it. */
export const occluders = { pi: createRef<Group>(), usb: createRef<Group>() };
