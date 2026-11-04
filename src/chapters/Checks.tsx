import { copy } from "../data/copy";
import { ATTEMPT_2_S4, RETRY_NOTE, attempts, candidates, templateReplacement } from "../data/retryScenario";
import { CHECK_A, checkA, type CheckAResult } from "../preview/checks";
import { useActivePassage } from "../store/selectors";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";

function Gauge({ label, value, limit, ok }: { label: string; value: string; limit: string; ok: boolean }) {
  return (
    <div className={`gauge ${ok ? "gauge-ok" : "gauge-bad"}`}>
      <span className="gauge-label">{label}</span>
      <strong className="gauge-value">{value}</strong>
      <span className="gauge-limit">{limit}</span>
      <span className="gauge-flag"><span aria-hidden="true">{ok ? "✓" : "✕"}</span> {ok ? "Pass" : "Look again"}</span>
    </div>
  );
}

function Gauges({ r }: { r: CheckAResult }) {
  const g = copy.checks.gauges;
  return (
    <div className="gauges">
      <Gauge label={g.count} value={String(r.sentenceCount)} limit={`${CHECK_A.minSentences} to ${CHECK_A.maxSentences}`} ok={r.A1} />
      <Gauge label={g.longest} value={`${r.longest} words`} limit={`limit ${CHECK_A.maxWords}`} ok={r.longest <= CHECK_A.maxWords} />
      <Gauge label={g.avg} value={r.average.toFixed(1)} limit={`target ${CHECK_A.avgTarget} or less`} ok={r.average <= CHECK_A.avgTarget} />
      <Gauge label={g.grade} value={r.fk.toFixed(1)} limit={`about ${CHECK_A.fkMax} or less`} ok={r.A3} />
      <Gauge label={g.faith} value={`${Math.round(r.coverage * 100)}%`} limit={`${Math.round(CHECK_A.faithfulness * 100)}% or more, numbers and names kept`} ok={r.A6 && r.A7} />
    </div>
  );
}

function AttemptView({ label, sentences, result }: { label: string; sentences: string[]; result: CheckAResult }) {
  return (
    <div className={`attempt ${result.passed ? "attempt-ok" : "attempt-bad"}`}>
      <h3>{label} <span className="verdict"><span aria-hidden="true">{result.passed ? "✓" : "✕"}</span> {result.passed ? "All checks pass" : result.failedRules.join(", ")}</span></h3>
      <ol className="check-sents">
        {sentences.map((s, i) => {
          const c = result.perSentence[i];
          return (
            <li key={i} className={c.ok ? "" : "bad"}>
              <span>{s}</span>
              <span className="chip"><span aria-hidden="true">{c.ok ? "✓" : "✕"}</span> {c.words} words{c.reason ? `, ${c.reason}` : ""}</span>
            </li>
          );
        })}
      </ol>
      <Gauges r={result} />
    </div>
  );
}

export function Checks() {
  const p = useActivePassage();
  const scripted = p.id === "p1" && p.subject !== "Custom";
  const own = scripted ? null : checkA(p.easyRead.map((s) => s.text), p.text);

  return (
    <Panel title={copy.checks.title} variant="wide" lead={<><Badge kind="exampleRun" /> <span className="muted">{copy.checks.usedUsing}</span></>}>
      <div className="two-lines">
        <p><strong>{copy.checks.lineA}</strong></p>
        <p>{copy.checks.lineB}</p>
      </div>

      {scripted ? (
        <>
          <div className="attempts">
            <AttemptView {...attempts[0]} />
            <div className="retry-arrow" role="note">
              <strong>Retry.</strong> {copy.checks.retryNote}
              <q>{RETRY_NOTE}</q>
              <span className="muted">Sentence 4 becomes: “{ATTEMPT_2_S4}”</span>
            </div>
            <AttemptView {...attempts[1]} />
          </div>

          <h3 className="sub-h">{copy.checks.quizTitle}</h3>
          <ul className="cands">
            {candidates.map(({ q, result }) => (
              <li key={q.id} className={result.passed ? "ok" : "bad"}>
                <span className="cand-q">{q.question}{q.type === "choice" && <em className="cand-opts"> {q.options[0]} / {q.options[1]}</em>}</span>
                <span className="chip"><span aria-hidden="true">{result.passed ? "✓" : "✕"}</span> {result.passed ? copy.checks.keptLabel : `${copy.checks.droppedLabel}: ${result.failed.map((f) => `${f.rule}, ${f.why}`).join("; ")}`}</span>
              </li>
            ))}
            <li className="tpl">
              <span className="cand-q">{templateReplacement.question}{templateReplacement.type === "choice" && <em className="cand-opts"> {templateReplacement.options[0]} / {templateReplacement.options[1]}</em>}</span>
              <span className="chip">{copy.checks.templateLabel}</span>
            </li>
          </ul>
          <p className="muted">{copy.checks.templateExplain}</p>
          <p className="muted">{copy.checks.learnerQuizNote}</p>
        </>
      ) : (
        <>
          <p className="muted">{copy.checks.otherPassage}</p>
          {own && <AttemptView label="Attempt 1" sentences={p.easyRead.map((s) => s.text)} result={own} />}
        </>
      )}
      <p className="limit"><span aria-hidden="true">ⓘ</span> {copy.checks.limit}</p>
    </Panel>
  );
}
