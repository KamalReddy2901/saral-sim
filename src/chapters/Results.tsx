import { PASSAGES } from "../data/passages";
import { copy } from "../data/copy";
import { metrics } from "../data/metrics.config";
import { Badge } from "../ui/Badge";
import { passageStats } from "../utils/stats";

const TBM = copy.results.notMeasured;
const num = (v: number | null, unit = "", d = 1) => (v === null ? TBM : `${Number.isInteger(v) ? v : v.toFixed(d)}${unit}`);

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td className={value === TBM ? "tbm" : ""}>{value}</td>
      <td><Badge kind="metric" /></td>
    </tr>
  );
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="ba-row">
      <span className="ba-label">{label}</span>
      <div className="ba-track"><i style={{ width: `${Math.min(100, (value / max) * 100)}%` }} /></div>
      <strong>{value.toFixed(1)}</strong>
    </div>
  );
}

export function Results() {
  const t = metrics.timeS;
  const q = metrics.quality;
  const stats = PASSAGES.map((p) => ({ p, s: passageStats(p) }));
  const max = Math.max(...stats.map((x) => x.s.origAvg));
  return (
    <section className="panel panel-full" tabIndex={0} data-world="light" aria-labelledby="results-title">
      <div className="panel-inner results">
        <h2 id="results-title" className="panel-title">{copy.results.title}</h2>
        <p className="muted">{copy.results.sub} {metrics.source === "measured" && metrics.measuredOn ? <>Measured on {metrics.measuredOn.hardware}, {metrics.measuredOn.date}.</> : <>These are placeholder values, clearly labelled.</>}</p>
        <div className="res-grid">
          <table className="res-table">
            <caption>Performance</caption>
            <tbody>
              <Row label="Model" value={metrics.model.name} />
              <Row label="Quantization and backend" value={`${metrics.model.quant}, ${metrics.model.backend}`} />
              <Row label="Model size" value={num(metrics.model.fileMB, " MB", 0)} />
              <Row label="Peak memory, model only" value={num(metrics.memoryMB.modelOnly, " MB", 0)} />
              <Row label="Peak memory, with UI" value={num(metrics.memoryMB.withUI, " MB", 0)} />
              <Row label="Load model" value={num(t.load, " s")} />
              <Row label="Easy-read" value={num(t.easyRead, " s")} />
              <Row label="Check A" value={num(t.checkA, " s")} />
              <Row label="Questions" value={num(t.questions, " s")} />
              <Row label="Check B" value={num(t.checkB, " s")} />
              <Row label="Pictograms" value={num(t.pictograms, " s")} />
              <Row label="Total time" value={num(t.total, " s")} />
              <Row label="Tokens per second" value={num(metrics.tokensPerS, "", 0)} />
            </tbody>
          </table>
          <div>
            <table className="res-table">
              <caption>Quality</caption>
              <tbody>
                <Row label="First-attempt pass rate, Check A" value={num(q.firstAttemptPassA, "%", 0)} />
                <Row label="First-attempt pass rate, Check B" value={num(q.firstAttemptPassB, "%", 0)} />
                <Row label="Lessons using a fallback" value={num(q.fallbackUsedPct, "%", 0)} />
                <Row label="Pictogram coverage" value={num(q.pictogramCoveragePct, "%", 0)} />
              </tbody>
            </table>
            <div className="ba">
              <h3>{copy.results.beforeAfter} <Badge kind="example" /></h3>
              <p className="muted">{copy.results.beforeAfterNote}</p>
              {stats.map(({ p, s }) => (
                <div key={p.id} className="ba-block">
                  <strong>{p.title}</strong>
                  <Bar label="Original, words per sentence" value={s.origAvg} max={max} />
                  <Bar label="Easy-read, words per sentence" value={s.easyAvg} max={max} />
                  <p className="muted">Reading grade (informal): {s.origFk.toFixed(1)} before, {s.easyFk.toFixed(1)} after.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <aside className="how">
          <h3>{copy.results.howTitle}</h3>
          <p>{copy.results.how}</p>
        </aside>
      </div>
    </section>
  );
}
