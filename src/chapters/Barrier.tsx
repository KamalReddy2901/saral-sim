import { PASSAGES } from "../data/passages";
import { copy } from "../data/copy";
import { Pic } from "../learner/Pic";
import { Badge } from "../ui/Badge";
import { splitSentences, wordCount } from "../utils/wordcount";

const p1 = PASSAGES[0];
const ORIGINAL = splitSentences(p1.text).find((s) => s.startsWith("The cold air cools")) ?? "";
const EASY = p1.easyRead[3];

export function Barrier() {
  return (
    <section className="panel panel-full" tabIndex={0} data-world="light" aria-labelledby="barrier-title">
      <div className="panel-inner barrier">
        <h2 id="barrier-title" className="sr-only">{copy.barrier.title}</h2>
        <div className="barrier-split">
          <figure className="barrier-card barrier-before">
            <figcaption>{copy.barrier.before}</figcaption>
            <blockquote>{ORIGINAL}</blockquote>
            <p className="barrier-count"><strong>{wordCount(ORIGINAL)}</strong> {copy.barrier.words}</p>
          </figure>
          <figure className="barrier-card barrier-after">
            <figcaption>{copy.barrier.after} <Badge kind="example" /></figcaption>
            <div className="barrier-easy">
              <Pic file={EASY.pictogram} label={EASY.key} className="barrier-pic" />
              <blockquote>{EASY.text}</blockquote>
            </div>
            <p className="barrier-count"><strong>{wordCount(EASY.text)}</strong> {copy.barrier.words}</p>
          </figure>
        </div>
        <p className="barrier-statement">{copy.barrier.statement}</p>
      </div>
    </section>
  );
}
