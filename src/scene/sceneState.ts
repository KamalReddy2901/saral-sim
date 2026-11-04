import gsap from "gsap";

/**
 * Mutable animation state for the 3D scene. Read inside useFrame (no React re-renders, no allocations).
 * Written by GSAP tweens from the scene driver.
 */
export const S = {
  ex: { board: 0, soc: 0, cooler: 0, sd: 0, power: 0 },
  usb: 0, // 0 = resting beside the Pi, 1 = plugged in
  cable: 0, // 0 = plugged in, 1 = pulled out
  fan: 0, // fan speed 0..1
  glow: 0, // chip glow 0..1
  stream: 0, // token stream strength 0..1
  pulse: 0, // board pulse 0..1
  cards: 0, // sentence cards rising 0..1
  slot: 0, // cards slotting onto the display 0..1
  screen: 1, // display brightness
  away: 0, // 1 = Pi and USB stick slid out of frame (learner chapter)
  bg: { r: 0.0018, g: 0.0021, b: 0.004 }, // backdrop colour, tweened per chapter (linear RGB)
  glowCol: { r: 1, g: 0.58, b: 0.03 }, // accent light colour (linear RGB)
  scan: 0, // 0..1 sweep of the scan wall
  hov: {} as Record<string, number>, // per-part hover amount 0..1
};

export function tween(
  target: object,
  props: Record<string, number>,
  instant: boolean,
  opts: { duration?: number; delay?: number; ease?: string } = {},
) {
  gsap.killTweensOf(target, Object.keys(props).join(","));
  if (instant) gsap.set(target, props);
  else gsap.to(target, { ...props, duration: opts.duration ?? 1.4, delay: opts.delay ?? 0, ease: opts.ease ?? "power3.inOut" });
}
