// One pose per chapter. position / target in scene units, fov in degrees.
// offset: shifts the picture sideways (desktop, fraction of width) or up (mobile, fraction of height)
// so the device stays clear of the chapter panel.
export interface CameraPose {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  fov: number;
  offsetX: number;
  offsetYMobile: number;
  offsetY?: number;
}

const HERO: CameraPose = { position: [17, 12, 31], target: [-1, 3.6, 3], fov: 36, offsetX: 0, offsetY: 0, offsetYMobile: -0.22 };
const SIDE = (position: CameraPose["position"], target: CameraPose["target"], fov = 38): CameraPose => ({
  position, target, fov, offsetX: 0, offsetY: 0, offsetYMobile: 0,
});

export const CAMERA_POSES: readonly CameraPose[] = [
  HERO, // 0 intro
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 1 barrier (stage hidden)
  SIDE([19, 17, 34], [-2, 5, 4], 38), // 2 device, exploded
  SIDE([13, 14, 34], [-1, 3, 5], 38), // 3 load a passage
  SIDE([10, 6, 28], [4.5, 1.8, 9], 33), // 4 offline, ports close-up
  SIDE([18, 22, 48], [-2, 11.5, 2], 40), // 5 local AI
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 6 checks (dimmed)
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 7 pictograms (dimmed)
  { position: [0, 10, 34], target: [0, 7.6, -6], fov: 27, offsetX: 0, offsetY: 0, offsetYMobile: 0 }, // 8 learner screen
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 9
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 10
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 11
];
