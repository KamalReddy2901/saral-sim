import { copy } from "../data/copy";
import { metrics } from "../data/metrics.config";

export type BadgeKind = "simulated" | "measured" | "example" | "exampleRun" | "preview";

/** One badge component for every honesty label. "metric" resolves Simulated vs Measured from the config. */
export function Badge({ kind, title }: { kind: BadgeKind | "metric"; title?: string }) {
  const resolved: BadgeKind = kind === "metric" ? (metrics.source === "measured" ? "measured" : "simulated") : kind;
  const label =
    resolved === "simulated" ? copy.tags.simulated
    : resolved === "measured" ? copy.tags.measured
    : resolved === "example" ? copy.tags.example
    : resolved === "exampleRun" ? copy.tags.exampleRun
    : copy.tags.basicPreview;
  const detail =
    resolved === "measured" && metrics.measuredOn
      ? `${metrics.measuredOn.hardware}, ${metrics.measuredOn.os}, ExecuTorch ${metrics.measuredOn.executorch}, ${metrics.measuredOn.date}`
      : title;
  return (
    <span className={`badge badge-${resolved}`} title={detail}>
      {label}
    </span>
  );
}
