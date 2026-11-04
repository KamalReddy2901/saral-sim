import { pictogramUrl } from "../utils/pictograms";

/** A pictogram image for a file name such as "cloud.svg". Renders nothing when there is no match. */
export function Pic({ file, label, className }: { file: string | null; label: string; className?: string }) {
  if (!file) return null;
  const lemma = file.replace(/\.(svg|png)$/i, "");
  const hit = pictogramUrl(lemma);
  if (!hit) return null;
  return <img className={className ?? "lrn-pic"} src={hit.url} alt={`Picture: ${label}`} draggable={false} />;
}
