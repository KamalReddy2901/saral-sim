import type { ReactNode } from "react";

export type PanelVariant = "side" | "wide" | "full";

export function Panel({ title, variant = "side", children, id, lead }: {
  title: string; variant?: PanelVariant; world?: "dark" | "light"; children: ReactNode; id?: string; lead?: ReactNode;
}) {
  return (
    <section className={`panel panel-${variant}`} tabIndex={0} aria-labelledby={id ?? "panel-title"}>
      <div className="panel-inner">
        {variant === "side" && <span className="mono panel-kicker">details</span>}
        <h2 id={id ?? "panel-title"} className={variant === "side" ? "panel-title" : "sr-only"}>{title}</h2>
        {lead && <div className="panel-lead">{lead}</div>}
        {children}
      </div>
    </section>
  );
}
