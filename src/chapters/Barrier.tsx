import { useState } from "react";
import { PASSAGES } from "../data/passages";
import { copy } from "../data/copy";
import { Pic } from "../learner/Pic";
import { Badge } from "../ui/Badge";
import { fkGrade } from "../utils/readability";
import { iconSrc } from "../utils/pictograms";
import { splitSentences, wordCount } from "../utils/wordcount";

const p1 = PASSAGES[0];
const ORIGINAL = splitSentences(p1.text).find((s) => s.startsWith("The cold air cools")) ?? "";
const EASY = p1.easyRead[3];

const CAUSES = [
  { icon: "book", text: "Long, abstract sentences" },
  { icon: "question", text: "No visual support" },
  { icon: "cross", text: "Easy-read versions are rarely available, least of all offline" },
] as const;

/** Before / after of the same idea. Drag the divider (or use the arrow keys) to wipe between them. */
export function Barrier() {
  const [pos, setPos] = useState(50);
  const wb = wordCount(ORIGINAL), wa = wordCount(EASY.text);
  const gb = Math.max(0, fkGrade(ORIGINAL)), ga = Math.max(0, fkGrade(EASY.text));
  return (
    <section className="panel panel-full barrier" tabIndex={0} aria-labelledby="barrier-title">
      <div className="panel-inner">
        <h2 id="barrier-title" className="panel-title">One idea, two ways to read it</h2>

        <div className="ba-stage">
          <div className="wipe" style={{ ["--pos" as string]: `${pos}%` }}>
            <div className="wipe-layer wipe-before">
              <div className="wipe-body">
                <span className="mono wipe-tag">{copy.barrier.before}</span>
                <p className="wipe-dense">{ORIGINAL}</p>
              </div>
            </div>
            <div className="wipe-layer wipe-after">
              <div className="wipe-body">
                <span className="mono wipe-tag">{copy.barrier.after} <Badge kind="example" /></span>
                <div className="wipe-easy">
                  <Pic file={EASY.pictogram} label={EASY.key} className="wipe-pic" />
                  <p>{EASY.text}</p>
                </div>
              </div>
            </div>
            <span className="wipe-handle" aria-hidden="true"><i /></span>
            <input
              className="wipe-range" type="range" min={0} max={100} value={pos}
              aria-label="Compare the original sentence with the easy-read version" onChange={(e) => setPos(Number(e.target.value))}
            />
            <span className="wipe-hint mono" aria-hidden="true">drag the divider</span>
          </div>

          <dl className="deltas">
            <div><dt>Words</dt><dd><b>{wb}</b><i>→</i><b>{wa}</b></dd></div>
            <div><dt>Reading grade (informal)</dt><dd><b>{gb.toFixed(1)}</b><i>→</i><b>{ga.toFixed(1)}</b></dd></div>
            <div><dt>Pictures</dt><dd><b>0</b><i>→</i><b>{EASY.pictogram ? 1 : 0}</b></dd></div>
          </dl>
        </div>

        <div className="why">
          <ul className="causes">
            {CAUSES.map((c) => (
              <li key={c.text}><img src={iconSrc(c.icon)} alt="" width="34" height="34" /><span>{c.text}</span></li>
            ))}
          </ul>
          <p className="why-statement"><span className="mono">the barrier</span>{copy.barrier.statement}</p>
        </div>
      </div>
    </section>
  );
}
