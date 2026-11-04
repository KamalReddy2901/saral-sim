import type { ReactNode } from "react";
import { copy } from "../data/copy";
import { useStore } from "../store/useStore";
import { iconSrc } from "../utils/pictograms";
import { CHAPTER_ICONS } from "./ChapterBar";

export type PanelVariant = "side" | "wide" | "full";

export function Panel({ title, variant = "side", children, id, lead }: {
  title: string; variant?: PanelVariant; world?: "dark" | "light"; children: ReactNode; id?: string; lead?: ReactNode;
}) {
  const chapter = useStore((s) => s.chapter);
  return (
    <section className={`panel panel-${variant}`} tabIndex={0} aria-labelledby={id ?? "panel-title"}>
      <div className="panel-inner">
        <div className="panel-tag mono"><img src={iconSrc(CHAPTER_ICONS[chapter])} alt="" width="20" height="20" />details / {copy.chapters[chapter].rail.toLowerCase()}</div>
        <h2 id={id ?? "panel-title"} className="panel-title">{title}</h2>
        {lead && <div className="panel-lead">{lead}</div>}
        {children}
      </div>
    </section>
  );
}
