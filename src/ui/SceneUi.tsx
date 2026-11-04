import gsap from "gsap";
import { useEffect, useState } from "react";
import { copy } from "../data/copy";
import { useHotspot } from "../scene/hotspotStore";
import { S } from "../scene/sceneState";
import { useStore } from "../store/useStore";

const EX_KEYS = ["board", "soc", "cooler", "sd", "power"] as const;

/** Compact 3D tools in the viewport footer: reset view, pull apart, fan, cable. */
export function Toolbar() {
  const explode = useHotspot((s) => s.explode);
  const setExplode = useHotspot((s) => s.setExplode);
  const resetView = useHotspot((s) => s.resetView);
  const cableOut = useStore((s) => s.cableOut);
  const setCableOut = useStore((s) => s.setCableOut);
  const [fan, setFan] = useState(false);

  const scrub = (v: number) => {
    setExplode(v);
    gsap.killTweensOf(S.ex);
    EX_KEYS.forEach((k, i) => { S.ex[k] = Math.max(0, Math.min(1, v * 1.5 - i * 0.12)); });
  };
  const toggleFan = () => {
    const next = !fan;
    setFan(next);
    gsap.killTweensOf(S, "fan");
    gsap.to(S, { fan: next ? 1 : 0, duration: 1.2, ease: "power2.out" });
  };

  return (
    <div className="toolbar" role="group" aria-label="3D tools">
      <button className="tool" onClick={resetView}>Reset view</button>
      <label className="tool tool-range">
        <span>Pull apart</span>
        <input aria-label="Pull apart" type="range" min={0} max={1} step={0.01} value={explode} style={{ ["--fill" as string]: `${explode * 100}%` }} onChange={(e) => scrub(Number(e.target.value))} />
      </label>
      <button className="tool" aria-pressed={fan} onClick={toggleFan}>Fan</button>
      <button className="tool" aria-pressed={cableOut} onClick={() => setCableOut(!cableOut)}>{cableOut ? "Plug in cable" : "Unplug cable"}</button>
    </div>
  );
}

/** Card for the last clicked part, floating over the canvas corner. */
export function PartCard() {
  const active = useHotspot((s) => s.active);
  const setActive = useHotspot((s) => s.setActive);
  const chapter = useStore((s) => s.chapter);
  const part = copy.device.parts.find((p) => p.id === active);
  useEffect(() => { if (chapter === 2) return; const id = window.setTimeout(() => setActive(null), 6000); return () => window.clearTimeout(id); }, [active, chapter, setActive]);
  if (!part || chapter === 2) return null;
  return (
    <div className="part-card" role="status">
      <strong>{part.name}</strong>
      <span>{part.text}</span>
      <button className="ghost-btn" onClick={() => setActive(null)} aria-label="Close part card">Close</button>
    </div>
  );
}

/** Follows the pointer while a 3D part is hovered. */
export function HoverTip() {
  const hover = useHotspot((s) => s.hover);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const move = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);
  const part = copy.device.parts.find((p) => p.id === hover);
  if (!part) return null;
  return <div className="hover-tip" style={{ left: pos.x + 16, top: pos.y + 18 }} aria-hidden="true">{part.name}<small>Click to open</small></div>;
}
