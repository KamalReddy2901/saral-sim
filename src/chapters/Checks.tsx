import { useEffect, useMemo, useState, type ReactNode } from "react";
import { copy } from "../data/copy";
import { ATTEMPT_2_S4, RETRY_NOTE, attempts, candidates, templateReplacement } from "../data/retryScenario";
import { CHECK_A, checkA, type CheckAResult } from "../preview/checks";
import { useActivePassage } from "../store/selectors";
import { useStore } from "../store/useStore";
import { Badge } from "../ui/Badge";

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
      <Gauge label={g.faith} value={`${Math.round(r.coverage * 100)}%`} limit="numbers and names kept" ok={r.A6 && r.A7} />
    </div>
  );
}

function Sentences({ sentences, result }: { sentences: string[]; result?: CheckAResult }) {
  return (
    <ol className="check-sents">
      {sentences.map((s, i) => {
        const c = result?.perSentence[i];
        return (
          <li key={i} className={c && !c.ok ? "bad" : ""}>
            <span>{s}</span>
            {c && <span className="chip"><span aria-hidden="true">{c.ok ? "✓" : "✕"}</span> {c.words} words{c.reason ? `, ${c.reason}` : ""}</span>}
          </li>
        );
      })}
    </ol>
  );
}

interface Step { key: string; short: string; tone: "ok" | "fail" | "info"; title: string; text: string; body: ReactNode }

/** The checking pipeline as a walkthrough: press Play, or click any step. */
export function Checks() {
  const p = useActivePassage();
  const reduced = useStore((s) => s.reducedMotion);
  const scripted = p.id === "p1" && p.subject !== "Custom";
  const own = useMemo(() => (scripted ? null : checkA(p.easyRead.map((s) => s.text), p.text)), [scripted, p]);

  const steps: Step[] = useMemo(() => {
    if (scripted) {
      return [
        { key: "write", short: "AI writes", tone: "info", title: "The AI writes the easy-read text", text: "A small model proposes six short sentences. Nothing is shown to the learner yet.", body: <Sentences sentences={attempts[0].sentences} /> },
        { key: "a1", short: "Check A", tone: "fail", title: "Check A finds a problem", text: "Plain code counts words, reading grade and facts. Sentence 4 has 19 words. The limit is 12.", body: <><Sentences sentences={attempts[0].sentences} result={attempts[0].result} /><Gauges r={attempts[0].result} /></> },
        { key: "retry", short: "Retry", tone: "info", title: "It retries with the failed rule", text: "The rule it broke is added to the prompt, and the model tries again. At most twice.", body: (
          <div className="retry">
            <p className="retry-note"><span className="mono">added to the prompt</span><q>{RETRY_NOTE}</q></p>
            <div className="diff"><del>{attempts[0].sentences[3]}</del><ins>{ATTEMPT_2_S4}</ins></div>
          </div>
        ) },
        { key: "a2", short: "Check A", tone: "ok", title: "Check A passes", text: "Every sentence is short, the grade is low, and every fact is in the original passage.", body: <><Sentences sentences={attempts[1].sentences} result={attempts[1].result} /><Gauges r={attempts[1].result} /></> },
        { key: "b", short: "Check B", tone: "fail", title: "Check B checks the questions", text: "One question has a wrong answer that also appears in the text, so it could be right. It is dropped.", body: (
          <ul className="cands">
            {candidates.map(({ q, result }) => (
              <li key={q.id} className={result.passed ? "ok" : "bad"}>
                <span className="cand-q">{q.question}{q.type === "choice" && <em className="cand-opts"> {q.options[0]} / {q.options[1]}</em>}</span>
                <span className="chip"><span aria-hidden="true">{result.passed ? "✓" : "✕"}</span> {result.passed ? copy.checks.keptLabel : `${copy.checks.droppedLabel}: ${result.failed.map((f) => f.why).join("; ")}`}</span>
              </li>
            ))}
          </ul>
        ) },
        { key: "tpl", short: "Template", tone: "ok", title: "A safe template fills the gap", text: copy.checks.templateExplain, body: (
          <ul className="cands">
            <li className="tpl"><span className="cand-q">{templateReplacement.question}{templateReplacement.type === "choice" && <em className="cand-opts"> {templateReplacement.options[0]} / {templateReplacement.options[1]}</em>}</span><span className="chip">{copy.checks.templateLabel}</span></li>
          </ul>
        ) },
      ];
    }
    return [
      { key: "write", short: "AI writes", tone: "info", title: "The AI writes the easy-read text", text: "A small model proposes short sentences. Nothing is shown to the learner yet.", body: <Sentences sentences={p.easyRead.map((s) => s.text)} /> },
      { key: "a1", short: "Check A", tone: own?.passed ? "ok" : "fail", title: own?.passed ? "Check A passes first time" : "Check A finds a problem", text: "Plain code counts words, reading grade and facts. The retry story is scripted for the water cycle passage.", body: own ? <><Sentences sentences={p.easyRead.map((s) => s.text)} result={own} /><Gauges r={own} /></> : null },
      { key: "b", short: "Check B", tone: "ok", title: "Check B checks the questions", text: "Each question must be answerable from one sentence on screen. A safe template question is the fallback.", body: <p className="muted">{copy.checks.learnerQuizNote}</p> },
    ];
  }, [scripted, own, p]);

  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setI(0); setPlaying(!reduced); }, [p.id, reduced]);
  useEffect(() => {
    if (!playing) return;
    if (i >= steps.length - 1) { setPlaying(false); return; }
    const id = window.setTimeout(() => setI((n) => n + 1), 3600);
    return () => window.clearTimeout(id);
  }, [playing, i, steps.length]);

  const step = steps[i];
  return (
    <section className="panel panel-full checks" tabIndex={0} aria-labelledby="checks-title">
      <div className="panel-inner">
        <h2 id="checks-title" className="panel-title">AI proposes. Code verifies.</h2>
        <p className="checks-sub">Plain code decides what the learner sees. If checks fail twice, a safe template is used. <Badge kind="exampleRun" /></p>

        <ol className="flow" aria-label="Checking steps">
          {steps.map((s, n) => (
            <li key={s.key + n}>
              <button className="flow-node" data-tone={s.tone} data-state={n < i ? "done" : n === i ? "now" : "next"} aria-current={n === i ? "step" : undefined} onClick={() => { setPlaying(false); setI(n); }}>
                <span className="flow-dot" aria-hidden="true">{s.tone === "fail" ? "✕" : s.tone === "ok" ? "✓" : n + 1}</span>
                <span className="flow-label">{s.short}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="flow-bar" aria-hidden="true"><i style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>

        <div className="step-card" key={step.key + i} data-tone={step.tone} aria-live="polite">
          <div className="step-copy">
            <span className="mono step-n">step {i + 1} of {steps.length}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
            <div className="step-ctl">
              <button className="ghost-btn" onClick={() => { setPlaying(false); setI((n) => Math.max(0, n - 1)); }} disabled={i === 0}>Previous</button>
              <button className="primary-btn" onClick={() => { if (i >= steps.length - 1) { setI(0); setPlaying(true); } else setPlaying((x) => !x); }}>{playing ? "Pause" : i >= steps.length - 1 ? "Replay" : "Play"}</button>
              <button className="ghost-btn" onClick={() => { setPlaying(false); setI((n) => Math.min(steps.length - 1, n + 1)); }} disabled={i >= steps.length - 1}>Next</button>
            </div>
          </div>
          <div className="step-body">{step.body}</div>
        </div>

        <p className="limit"><span aria-hidden="true">ⓘ</span> {copy.checks.limit}</p>
      </div>
    </section>
  );
}
