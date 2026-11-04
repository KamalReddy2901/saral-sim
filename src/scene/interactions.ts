import gsap from "gsap";
import { startSimulation } from "../store/runSimulation";
import { useStore } from "../store/useStore";
import { useHotspot } from "./hotspotStore";
import { S } from "./sceneState";

/** Everything a click on a 3D part does. Kept in one place so each part stays declarative. */
export function partClick(id: string, _point: { x: number; y: number; z: number }) {
  const h = useHotspot.getState();
  const st = useStore.getState();
  h.setActive(id);

  switch (id) {
    case "eth":
      st.setCableOut(!st.cableOut);
      break;
    case "usb":
      gsap.killTweensOf(S, "usb");
      gsap.to(S, { usb: S.usb > 0.5 ? 0 : 1, duration: 1.1, ease: "power3.inOut" });
      break;
    case "display":
      if (st.chapter !== 8) st.setChapter(8);
      break;
    case "soc":
    case "cooler":
      if (st.chapter === 5 && st.runStatus !== "running") {
        startSimulation({ retry: st.passageId === "p1" && !st.custom, reduced: st.reducedMotion });
      } else if (st.runStatus !== "running") {
        // a short fan burst so the click feels physical
        gsap.killTweensOf(S, "fan");
        S.fan = 1;
        gsap.to(S, { fan: 0, duration: 2.4, ease: "power2.out" });
      }
      break;
    default:
      break;
  }
}

/** Pointer handlers for a part. Hover sets a shared id (drives lift, tooltip and cursor). */
export function partHandlers(id: string) {
  return {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      useHotspot.getState().setHover(id);
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      if (useHotspot.getState().hover === id) useHotspot.getState().setHover(null);
      document.body.style.cursor = "";
    },
    onClick: (e: { stopPropagation: () => void; delta?: number; point: { x: number; y: number; z: number } }) => {
      e.stopPropagation();
      if ((e.delta ?? 0) > 5) return; // it was a drag, not a click
      partClick(id, e.point);
    },
  };
}

export const PART_IDS = ["display", "stand", "soc", "cooler", "sd", "power", "usb", "eth"] as const;
