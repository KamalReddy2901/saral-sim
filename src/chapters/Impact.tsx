import { PASSAGES } from "../data/passages";
import { copy } from "../data/copy";
import { metrics } from "../data/metrics.config";
import { Pic } from "../learner/Pic";
import { Badge } from "../ui/Badge";
import { passageStats } from "../utils/stats";
import { splitSentences, wordCount } from "../utils/wordcount";

const p1 = PASSAGES[0];
const ORIGINAL = splitSentences(p1.text).find((s) => s.startsWith("The cold air cools")) ?? "";
const EASY = p1.easyRead[3];

export function Impact() {
  const s = passageStats(p1);
  const total = metrics.timeS.total;
  const mem = metrics.memoryMB.withUI;
  return (
    <section className="panel panel-full" tabIndex={0} data-world="light" aria-labelledby="impact-title">
      <div className="panel-inner impact">
        <h2 id="impact-title" className="sr-only">{copy.impact.title}</h2>
        <p className="impact-lead">
          Saral rewrote <strong>{s.origSentenceCount}</strong> sentences of <strong>{s.origAvg.toFixed(1)}</strong> words on average into <strong>{s.easyCount}</strong> sentences of <strong>{s.easyAvg.toFixed(1)}</strong> words on average, and added pictograms for <strong>{s.pictures}</strong> of them. It also made <strong>{s.questions}</strong> questions the learner can answer from the text on screen.{" "}
          <Badge kind="example" />
        </p>
        <p className="muted">
          {total !== null && mem !== null ? <>On the device, a run takes about {total} seconds and about {mem} MB of memory, with no internet. </> : <>Run time and memory are to be measured. </>}
          <Badge kind="metric" />
        </p>
        <div className="ex">
          <div className="ex-card">
            <h3>Original <span className="muted">{wordCount(ORIGINAL)} words, two ideas, the word “vapour”</span></h3>
            <blockquote>{ORIGINAL}</blockquote>
          </div>
          <div className="ex-card ex-good">
            <h3>Easy-read <span className="muted">{wordCount(EASY.text)} words, one main idea</span> <Badge kind="example" /></h3>
            <div className="barrier-easy"><Pic file={EASY.pictogram} label={EASY.key} className="barrier-pic" /><blockquote>{EASY.text}</blockquote></div>
          </div>
        </div>
        <ul className="three">
          {copy.impact.lines.map((l) => (
            <li key={l.head}><h3>{l.head}</h3><p>{l.text}</p></li>
          ))}
        </ul>
      </div>
    </section>
  );
}
