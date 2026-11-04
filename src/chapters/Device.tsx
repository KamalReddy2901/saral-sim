import { copy } from "../data/copy";
import { Panel } from "../ui/Panel";
import { useStore } from "../store/useStore";
import { useHotspot } from "../scene/hotspotStore";

export function Device() {
  const mode = useStore((s) => s.mode);
  const view = useStore((s) => s.view);
  const active = useHotspot((s) => s.active);
  const setActive = useHotspot((s) => s.setActive);
  return (
    <Panel title={copy.device.title}>
      <p className="muted">{mode === "explore" && view === "3d" ? copy.device.exploreHint : copy.device.hint}</p>
      <ul className="parts">
        {copy.device.parts.map((p) => (
          <li key={p.id}>
            <button className="part" aria-pressed={active === p.id} onClick={() => setActive(active === p.id ? null : p.id)}>
              <strong>{p.name}</strong>
              <span>{p.text}</span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
