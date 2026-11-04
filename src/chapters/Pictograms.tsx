import { PASSAGES } from "../data/passages";
import { copy } from "../data/copy";
import { metrics } from "../data/metrics.config";
import { Pic } from "../learner/Pic";
import { useActivePassage } from "../store/selectors";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";
import { lookupTrail } from "../utils/pictograms";

const NO_MATCH = PASSAGES[1].easyRead[5]; // "election": the library has no exact match

function Trail({ keyWord, sentence, label }: { keyWord: string; sentence: string; label?: string }) {
  const trail = lookupTrail(keyWord, sentence);
  const hit = trail.find((t) => t.hit);
  return (
    <div className={`map-row ${hit ? "" : "map-none"}`}>
      <div className="map-word"><span className="map-sentence">{label ?? sentence}</span><strong className="map-key">{keyWord}</strong></div>
      <div className="map-trail" aria-label="Lookup trail">
        {trail.map((t) => (
          <span key={t.word} className={`trail-step ${t.hit ? "hit" : "miss"}`}><span aria-hidden="true">{t.hit ? "✓" : "–"}</span> {t.lemma}</span>
        ))}
      </div>
      <div className="map-pic">
        {hit ? <Pic file={`${hit.lemma}.svg`} label={hit.lemma} className="map-img" /> : <span className="map-empty">{copy.pictograms.noMatch}</span>}
      </div>
    </div>
  );
}

export function Pictograms() {
  const p = useActivePassage();
  const covered = p.easyRead.filter((s) => s.pictogram).length;
  const cov = metrics.quality.pictogramCoveragePct;
  return (
    <Panel title={copy.pictograms.title} variant="wide" lead={<><Badge kind="example" /> <span className="muted">Lookup trail for each key word in this passage.</span></>}>
      <div className="map-grid">
        {p.easyRead.map((s) => <Trail key={s.id} keyWord={s.key} sentence={s.text} />)}
        {p.id !== "p2" && <Trail keyWord={NO_MATCH.key} sentence={NO_MATCH.text} label={`${NO_MATCH.text} (another example)`} />}
      </div>
      <div className="cov">
        <div><strong>{covered} of {p.easyRead.length}</strong> sentences got a picture in this example. <Badge kind="example" /></div>
        <div>{copy.pictograms.coverage}: <strong>{cov === null ? copy.results.notMeasured : `${cov}%`}</strong> <Badge kind="metric" /> <span className="muted">{copy.pictograms.libraryNote}</span></div>
      </div>
      <h3 className="sub-h">Other visual aids</h3>
      <ul className="aids">
        {copy.pictograms.aids.map((a) => (
          <li key={a.name}><strong>{a.name}</strong><span>{a.text}</span></li>
        ))}
      </ul>
    </Panel>
  );
}
