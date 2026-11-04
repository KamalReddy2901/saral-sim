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
