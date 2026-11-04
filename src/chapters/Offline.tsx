import { copy } from "../data/copy";
import { useStore } from "../store/useStore";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";

export function WifiIcon({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" aria-hidden="true" className={on ? "wifi on" : "wifi off"}>
      <path d="M6 20a26 26 0 0 1 36 0" /><path d="M13 27a16 16 0 0 1 22 0" /><path d="M20 34a7 7 0 0 1 8 0" /><circle cx="24" cy="40" r="2" fill="currentColor" />
      {!on && <path d="M7 7l34 34" stroke="#f0644f" strokeWidth="5" />}
    </svg>
  );
}

export function Offline() {
  const cableOut = useStore((s) => s.cableOut);
  const setCableOut = useStore((s) => s.setCableOut);
  const cloudTried = useStore((s) => s.cloudTried);
  const setCloudTried = useStore((s) => s.setCloudTried);

  const ethState = cableOut ? "DOWN  (cable unplugged)" : "UP    (cable in, nothing is sent)";
  return (
    <Panel title={copy.offline.title}>
      <div className="net-row">
        <div className="net-item"><WifiIcon on={false} /><span>{copy.offline.wifiOff}</span></div>
        <div className="net-item"><span className={`dot ${cableOut ? "dot-off" : "dot-on"}`} aria-hidden="true" /><span>{copy.offline.cable}: {cableOut ? "out" : "in"}</span></div>
      </div>
      <div className="btn-row">
        <button className="btn btn-ghost btn-sm" onClick={() => setCableOut(!cableOut)}>{cableOut ? copy.offline.plug : copy.offline.pull}</button>
      </div>

      <div className="term-head"><strong>{copy.offline.terminalTitle}</strong> <Badge kind="simulated" /></div>
      <pre className="term" tabIndex={0} aria-label="Simulated network readout">{`$ saral offline-check
eth0                ${ethState}
wlan0               DOWN  (radio off)
interfaces up       ${cableOut ? 0 : 1}   (no route out)
outbound connections  0
cloud inference     none
result              OFFLINE: the pipeline needs no network`}</pre>
      <p className="muted">{copy.offline.simNote}</p>
      {!cableOut && <p className="muted">{copy.offline.online}</p>}

      <div className="btn-row">
        <button className="btn btn-ghost btn-sm" onClick={() => setCloudTried(true)}>{copy.offline.tryCloud}</button>
      </div>
      {cloudTried && (
        <p className="refusal" role="alert"><span aria-hidden="true">✕</span> <strong>{copy.offline.cloudLabel}:</strong> {copy.offline.cloudRefused}</p>
      )}
    </Panel>
  );
}
