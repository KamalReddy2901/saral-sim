import type { ReactNode } from "react";

export type PanelVariant = "side" | "wide" | "full";

export function Panel({ title, variant = "side", world = "dark", children, id, lead }: {
  title: string; variant?: PanelVariant; world?: "dark" | "light"; children: ReactNode; id?: string; lead?: ReactNode;
}) {
  return (
    <section className={`panel panel-${variant}`} tabIndex={0} data-world={world} aria-labelledby={id ?? "panel-title"}>
      <div className="panel-inner">
        <h2 id={id ?? "panel-title"} className="panel-title">{title}</h2>
        {lead && <div className="panel-lead">{lead}</div>}
        {children}
      </div>
    </section>
  );
}
