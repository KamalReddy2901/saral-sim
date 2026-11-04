import type { ReactNode } from "react";
import { copy } from "../data/copy";
import { useStore } from "../store/useStore";
import { iconSrc } from "../utils/pictograms";
import { CHAPTER_ICONS } from "./ChapterBar";

export type PanelVariant = "side" | "wide" | "full";

export function Panel({ title, variant = "side", world = "dark", children, id, lead }: {
  title: string; variant?: PanelVariant; world?: "dark" | "light"; children: ReactNode; id?: string; lead?: ReactNode;
}) {
  const chapter = useStore((s) => s.chapter);
  const view = useStore((s) => s.view);
  const open = useStore((s) => s.panelOpen);
  const setOpen = useStore((s) => s.setPanelOpen);
  const foldable = variant === "side" && view === "3d";
  const folded = foldable && !open;
  return (
    <>
      <section className={`panel panel-${variant}`} tabIndex={folded ? -1 : 0} data-world={world} data-folded={folded ? "1" : "0"} aria-labelledby={id ?? "panel-title"} aria-hidden={folded}>
        <div className="panel-inner">
          <div className="panel-tag">
            <span className="mono"><img src={iconSrc(CHAPTER_ICONS[chapter])} alt="" width="34" height="34" />fig.{String(chapter + 1).padStart(2, "0")} / {copy.chapters[chapter].rail.toLowerCase()}</span>
            {foldable && <button className="panel-fold" onClick={() => setOpen(false)}>hide panel</button>}
          </div>
          <h2 id={id ?? "panel-title"} className="panel-title">{title}</h2>
          {lead && <div className="panel-lead">{lead}</div>}
          {children}
        </div>
      </section>
      {folded && <button className="panel-tab" onClick={() => setOpen(true)}>show panel</button>}
    </>
  );
}
