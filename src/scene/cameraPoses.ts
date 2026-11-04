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

const HERO: CameraPose = { position: [19, 14, 36], target: [-1, 4, 3], fov: 36, offsetX: -0.3, offsetYMobile: -0.22 };
const SIDE = (position: CameraPose["position"], target: CameraPose["target"], fov = 38): CameraPose => ({
  position, target, fov, offsetX: 0.13, offsetYMobile: 0.17,
});

export const CAMERA_POSES: readonly CameraPose[] = [
  HERO, // 0 intro
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 1 barrier (stage hidden)
  { ...SIDE([24, 21, 42], [-2, 5, 4], 38), offsetX: 0.16 }, // 2 device, exploded
  SIDE([13, 14, 34], [-1, 3, 5], 38), // 3 load a passage
  { ...SIDE([9, 5.5, 28], [4.5, 1.8, 9], 32), offsetX: 0.2 }, // 4 offline, ports close-up
  SIDE([17, 21, 42], [-2, 10.5, 2], 40), // 5 local AI
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 6 checks (dimmed)
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 7 pictograms (dimmed)
  { position: [0, 10, 34], target: [0, 7.6, -6], fov: 27, offsetX: 0.17, offsetYMobile: 0.3 }, // 8 learner screen
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 9
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 10
  { ...HERO, offsetX: 0, offsetYMobile: 0 }, // 11
];
