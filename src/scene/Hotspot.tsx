import { Html } from "@react-three/drei";
import { copy } from "../data/copy";
import { useHotspot } from "./hotspotStore";

/** Keyboard-focusable 3D hotspot. Shown in chapter 2 and in Explore mode. */
export function Hotspot({ id, position, visible }: { id: string; position: readonly [number, number, number]; visible: boolean }) {
  const active = useHotspot((s) => s.active);
  const setActive = useHotspot((s) => s.setActive);
  const part = copy.device.parts.find((p) => p.id === id);
  if (!part || !visible) return null;
  const idx = copy.device.parts.indexOf(part) + 1;
  return (
    <Html position={[position[0], position[1], position[2]]} center zIndexRange={[30, 10]} style={{ pointerEvents: "auto" }}>
      <div style={{ position: "relative" }}>
        <button
          className="hotspot"
          aria-label={`${part.name}. ${part.text}`}
          aria-pressed={active === id}
          onClick={() => setActive(active === id ? null : id)}
          onFocus={() => setActive(id)}
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
