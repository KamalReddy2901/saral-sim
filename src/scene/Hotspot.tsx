import { Html } from "@react-three/drei";
import { copy } from "../data/copy";
import { useHotspot } from "./hotspotStore";

/** Where each label sits relative to its marker, in screen pixels, so leader lines never cross. */
const OFFSETS: Record<string, [number, number]> = {
  display: [110, -50], stand: [100, 56], soc: [-120, -46], cooler: [120, -62], sd: [-110, 52],
  power: [-120, 40], usb: [100, -52], eth: [110, 54],
};

/** Teardown-style callout: a marker, a thin leader line and a name chip. Keyboard focusable. */
export function Hotspot({ id, position, visible }: { id: string; position: readonly [number, number, number]; visible: boolean }) {
  const active = useHotspot((s) => s.active);
  const setActive = useHotspot((s) => s.setActive);
  const setHover = useHotspot((s) => s.setHover);
  const hover = useHotspot((s) => s.hover);
  const part = copy.device.parts.find((p) => p.id === id);
  if (!part || !visible) return null;
  const idx = copy.device.parts.indexOf(part) + 1;
  const [ox, oy] = OFFSETS[id] ?? [90, -50];
  const len = Math.hypot(ox, oy);
  const ang = (Math.atan2(oy, ox) * 180) / Math.PI;
  return (
    <Html position={[position[0], position[1], position[2]]} center zIndexRange={[30, 10]} style={{ pointerEvents: "none" }}>
      <div className="hs" data-on={active === id || hover === id ? "1" : "0"} style={{ pointerEvents: "none" }}>
        <span className="hs-line" style={{ width: len - 22, transform: `rotate(${ang}deg) translateX(18px)` }} />
        <span className="hs-chip" style={{ left: 17 + ox, top: 17 + oy }}>{part.name}</span>
        <button
          className="hotspot"
          style={{ pointerEvents: "auto" }}
          aria-label={`${idx}. ${part.name}. ${part.text}`}
          aria-pressed={active === id}
          onClick={() => setActive(active === id ? null : id)}
          onFocus={() => setActive(id)}
          onPointerEnter={() => setHover(id)}
          onPointerLeave={() => setHover(null)}
        >
          {idx}
        </button>
        {active === id && (
          <div className="hot-label" role="note">
            <strong>{part.name}</strong>
            {part.text}
          </div>
        )}
      </div>
    </Html>
  );
}
