/** WebGL and low-power detection. Simple heuristics, no network (no detect-gpu benchmark download). */
export interface Capabilities { webgl: boolean; lowPower: boolean; mobile: boolean }

export function detectCapabilities(): Capabilities {
  let webgl = false;
  try {
    const c = document.createElement("canvas");
    webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    webgl = false;
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const mobile = window.matchMedia?.("(pointer: coarse)").matches === true && Math.min(window.innerWidth, window.innerHeight) < 820;
  const lowPower =
    (nav.hardwareConcurrency !== undefined && nav.hardwareConcurrency <= 2) ||
    (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) ||
    nav.connection?.saveData === true;
  return { webgl, lowPower, mobile };
}

export function modeFromUrl(): "2d" | "3d" | null {
  const m = new URLSearchParams(window.location.search).get("mode");
  return m === "2d" || m === "3d" ? m : null;
}
