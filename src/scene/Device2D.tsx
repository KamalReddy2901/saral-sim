import { copy } from "../data/copy";
import { useStore } from "../store/useStore";
import { useHotspot } from "./hotspotStore";

const INK = "#13151f";

/**
 * 2D guided fallback: a flat, outlined illustration of the same device, driven by the same chapter state.
 * Used when WebGL is unavailable, the device is low-power, or the visitor picks "2D view".
 */
export function Device2D() {
  const chapter = useStore((s) => s.chapter);
  const cableOut = useStore((s) => s.cableOut);
  const runStatus = useStore((s) => s.runStatus);
  const active = useHotspot((s) => s.active);
  const setActive = useHotspot((s) => s.setActive);
  const exploded = chapter === 2;
  const running = runStatus === "running";
  const usbIn = chapter >= 3;
  const pick = (id: string) => ({ onClick: () => setActive(active === id ? null : id), style: { cursor: "pointer" } as const });
  const hl = (id: string) => (active === id ? "#ffc933" : undefined);
  const lift = (n: number) => (exploded ? n : 0);

  return (
    <div className="dev2d" role="img" aria-label={copy.captions[chapter]}>
      <svg viewBox="0 0 800 520" strokeLinejoin="round" strokeLinecap="round">
        <ellipse cx="400" cy="486" rx="340" ry="20" fill="#ffc933" opacity="0.12" />
        {/* display and stand */}
        <g {...pick("stand")}>
          <path d="M330 472 L470 472 L446 400 L354 400Z" fill={hl("stand") ?? "#c9d3e8"} stroke="#9fb0d8" strokeWidth="6" />
        </g>
        <g {...pick("display")}>
          <rect x="190" y="56" width="420" height="304" rx="26" fill={INK} stroke="#9fb0d8" strokeWidth="6" />
          <rect x="214" y="80" width="372" height="256" rx="10" fill={hl("display") ?? "#fff"} />
          <rect x="250" y="126" width="300" height="24" rx="8" fill="#2f5bea" />
          <rect x="250" y="170" width="240" height="24" rx="8" fill="#ffc933" stroke="#9fb0d8" strokeWidth="3" />
          <rect x="250" y="214" width="270" height="24" rx="8" fill={INK} />
          <rect x="320" y="268" width="160" height="44" rx="12" fill="#1a36a0" stroke="#9fb0d8" strokeWidth="4" />
        </g>
        {/* Raspberry Pi board */}
        <g transform={`translate(0 ${400 - lift(0)})`}>
          <g transform="translate(60 -10)">
            <rect width="300" height="170" rx="16" fill="#23a26d" stroke="#9fb0d8" strokeWidth="6" />
            <rect x="266" y="16" width="44" height="42" rx="4" fill="#e9edf5" stroke="#9fb0d8" strokeWidth="5" />
            <rect x="266" y="70" width="44" height="42" rx="4" fill="#e9edf5" stroke="#9fb0d8" strokeWidth="5" />
            <rect x="266" y="122" width="48" height="36" rx="4" fill={hl("power") ?? "#c9d3e8"} stroke="#9fb0d8" strokeWidth="5" />
            <rect x="40" y="14" width="190" height="14" fill={INK} />
            <rect x="26" y="130" width="60" height="22" rx="4" fill={INK} />
            <rect x="130" y="95" width="60" height="42" rx="5" fill={INK} />
            <g transform={`translate(0 ${-lift(70)})`}>
              <rect x="80" y="52" width="90" height="90" rx="8" fill={hl("soc") ?? "#e9edf5"} stroke="#9fb0d8" strokeWidth="5" />
              <circle cx="125" cy="97" r="28" fill={INK} stroke="#9fb0d8" strokeWidth="4" />
              <g className={running ? "fan-spin" : ""} style={{ transformOrigin: "125px 97px" }}>
                <path d="M125 97 L125 74 M125 97 L148 97 M125 97 L125 120 M125 97 L102 97" stroke="#fff" strokeWidth="6" />
              </g>
              <circle cx="125" cy="97" r="56" fill="#ffc933" opacity={running ? 0.35 : 0} />
            </g>
          </g>
          <rect x={22 - lift(18)} y={38 + lift(20)} width="40" height="30" rx="5" fill={hl("sd") ?? INK} stroke="#9fb0d8" strokeWidth="4" />
          <g transform={`translate(${usbIn ? 372 : 470} 28)`}>
            <rect width="86" height="36" rx="10" fill={hl("usb") ?? "#f0644f"} stroke="#9fb0d8" strokeWidth="5" />
            <rect x="-26" y="8" width="30" height="20" rx="3" fill="#e9edf5" stroke="#9fb0d8" strokeWidth="5" />
          </g>
          <g transform={`translate(${cableOut ? 90 : 0} 0)`}>
            <rect x="372" y="94" width="40" height="22" rx="4" fill="#fff" stroke="#9fb0d8" strokeWidth="5" />
            <path d="M412 105 C460 105 480 120 560 120" fill="none" stroke="#9fb0d8" strokeWidth="14" />
            <path d="M412 105 C460 105 480 120 560 120" fill="none" stroke="#fff" strokeWidth="7" />
          </g>
        </g>
        {chapter === 4 && (
          <g transform="translate(560 330)" fill="none" stroke="#eef1f8" strokeWidth="6">
            <path d="M0 0a40 40 0 0 1 56 0" /><path d="M10 12a26 26 0 0 1 36 0" /><circle cx="28" cy="32" r="3" fill="#eef1f8" />
            <path d="M-6 -8L62 46" stroke="#f0644f" strokeWidth="9" />
          </g>
        )}
      </svg>
    </div>
  );
}
