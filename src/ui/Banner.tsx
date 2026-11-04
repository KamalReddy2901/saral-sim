import { copy } from "../data/copy";

export function Banner() {
  return (
    <div className="banner" role="note">
      <i className="live" aria-hidden="true" />
      <span className="mono">simulation</span>
      <span>{copy.banner.replace(/^Simulation of the Saral prototype\.\s*/, "")}</span>
    </div>
  );
}
