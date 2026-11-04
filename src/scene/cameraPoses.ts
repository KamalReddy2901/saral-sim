// One pose per chapter. position / target in scene units, fov in degrees.
// offset: shifts the picture sideways (desktop, fraction of width) or up (mobile, fraction of height)
// so the device stays clear of the chapter panel.
export interface CameraPose {
  position: readonly [number, number, number];
  target: readonly [number, number, number];
  fov: number;
  offsetX: number;
  offsetYMobile: number;
}

const HERO: CameraPose = { position: [26, 20, 50], target: [-1, 4, 2.5], fov: 36, offsetX: -0.19, offsetYMobile: -0.22 };
const SIDE = (position: CameraPose["position"], target: CameraPose["target"], fov = 38): CameraPose => ({
  position, target, fov, offsetX: 0.17, offsetYMobile: 0.24,
});

export const CAMERA_POSES: readonly CameraPose[] = [
  HERO, // 0 intro
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 1 barrier (stage hidden)
  SIDE([23, 20, 38], [-2, 5, 4], 38), // 2 device, exploded
  SIDE([13, 14, 34], [-1, 3, 5], 38), // 3 load a passage
  SIDE([30, 7, 22], [-1, 1.8, 6.5], 32), // 4 offline, ports close-up
  SIDE([17, 20, 38], [-2, 7.5, 2], 38), // 5 local AI
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 6 checks (dimmed)
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 7 pictograms (dimmed)
  { position: [0, 12, 34], target: [0, 6.2, -6], fov: 28, offsetX: 0.17, offsetYMobile: 0.3 }, // 8 learner screen
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 9
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 10
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 11
];
