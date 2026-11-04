import { copy } from "../data/copy";
import { useStore } from "../store/useStore";
import { useHotspot } from "./hotspotStore";

/**
 * 2D guided fallback: a flat illustration of the same device, driven by the same chapter state.
 * Used when WebGL is unavailable, the device is low-power, or the visitor picks "2D view".
 */
export function Device2D() {
  const chapter = useStore((s) => s.chapter);
  const cableOut = useStore((s) => s.cableOut);
  const runStatus = useStore((s) => s.runStatus);
  const active = useHotspot((s) => s.active);
  const exploded = chapter === 2;
  const running = runStatus === "running";
  const usbIn = chapter >= 3;
  const hot = (id: string) => (active === id ? "var(--sun)" : "none");
  const lift = (n: number) => (exploded ? n : 0);

  return (
    <div className="dev2d" role="img" aria-label={copy.captions[chapter]}>
      <svg viewBox="0 0 800 520">
        <ellipse cx="400" cy="480" rx="340" ry="22" fill="#0a1422" />
        {/* display + stand */}
        <g>
          <path d="M330 470 L470 470 L440 400 L360 400Z" fill="#1d3657" stroke={hot("stand")} strokeWidth="5" />
          <rect x="190" y="60" width="420" height="300" rx="22" fill="#0a1422" stroke={hot("display")} strokeWidth="5" />
          <rect x="212" y="82" width="376" height="256" rx="8" fill="#ffffff" />
          <rect x="250" y="130" width="300" height="22" rx="6" fill="#2f5bea" />
          <rect x="250" y="172" width="240" height="22" rx="6" fill="#ffc933" />
          <rect x="250" y="214" width="270" height="22" rx="6" fill="#0e1a2b" opacity=".85" />
          <rect x="320" y="270" width="160" height="40" rx="12" fill="#1f3fb8" />
        </g>
        {/* Raspberry Pi board */}
        <g transform={`translate(0 ${400 - lift(0)})`}>
          <g transform="translate(60 -10)">
            <rect x="0" y="0" width="300" height="170" rx="14" fill="#1d7a46" stroke="#0e1a2b" strokeWidth="5" />
            <rect x="268" y="18" width="40" height="40" rx="3" fill="#c9d3e3" stroke="#0e1a2b" strokeWidth="4" />
            <rect x="268" y="72" width="40" height="40" rx="3" fill="#c9d3e3" stroke="#0e1a2b" strokeWidth="4" />
            <rect x="268" y="124" width="46" height="34" rx="3" fill="#aab6c9" stroke={hot("power")} strokeWidth="4" />
            <rect x="40" y="14" width="190" height="14" fill="#0e1a2b" />
            <rect x="26" y="130" width="60" height="22" rx="3" fill="#0e1a2b" />
            <rect x="130" y="95" width="60" height="42" rx="4" fill="#0e1a2b" />
            <g transform={`translate(0 ${-lift(70)})`}>
              <rect x="80" y="52" width="90" height="90" rx="6" fill="#c9d3e3" stroke={active === "soc" ? "var(--sun)" : "#0e1a2b"} strokeWidth="5" />
              <circle cx="125" cy="97" r="26" fill="#0e1a2b" stroke={hot("cooler")} strokeWidth="4" />
              <g className={running ? "fan-spin" : ""} style={{ transformOrigin: "125px 97px" }}>
                <path d="M125 97 L125 74 M125 97 L148 97 M125 97 L125 120 M125 97 L102 97" stroke="#e8eef7" strokeWidth="5" strokeLinecap="round" />
              </g>
              <circle cx="125" cy="97" r="52" fill="#ffc933" opacity={running || chapter === 2 ? 0.22 : 0} />
            </g>
          </g>
          {/* microSD */}
          <rect x={22 - lift(18)} y={38 + lift(20)} width="40" height="30" rx="4" fill="#0e1a2b" stroke={hot("sd")} strokeWidth="4" />
          {/* USB stick */}
          <g transform={`translate(${usbIn ? 372 : 470} 28)`}>
            <rect x="0" y="0" width="86" height="36" rx="8" fill="#2f5bea" stroke={hot("usb")} strokeWidth="4" />
            <rect x="-26" y="8" width="30" height="20" rx="3" fill="#c9d3e3" stroke="#0e1a2b" strokeWidth="4" />
          </g>
          {/* Ethernet cable */}
          <g transform={`translate(${cableOut ? 90 : 0} 0)`}>
            <rect x="372" y="94" width="40" height="22" rx="3" fill="#2f5bea" stroke="#0e1a2b" strokeWidth="4" />
            <path d="M412 105 C460 105 480 120 560 120" fill="none" stroke="#2f5bea" strokeWidth="8" strokeLinecap="round" />
          </g>
          {/* power lead */}
          <path d="M80 160 C70 190 30 200 10 210" fill="none" stroke={hot("power")} strokeWidth="1" />
        </g>
        {chapter === 4 && (
          <g transform="translate(560 330)" fill="none" stroke="#e8eef7" strokeWidth="5" strokeLinecap="round">
            <path d="M0 0a40 40 0 0 1 56 0" opacity=".5" /><path d="M10 12a26 26 0 0 1 36 0" opacity=".5" /><circle cx="28" cy="32" r="3" fill="#e8eef7" />
            <path d="M-6 -8L62 46" stroke="#f0644f" strokeWidth="7" />
          </g>
        )}
      </svg>
    </div>
  );
}
