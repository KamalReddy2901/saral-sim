import { useMemo, useState } from "react";
import { copy } from "../data/copy";
import { PASSAGES, type Passage } from "../data/passages";
import { basicMode } from "../preview/basicMode";
import { useStore } from "../store/useStore";
import { Badge } from "../ui/Badge";
import { Panel } from "../ui/Panel";
import { Pic } from "../learner/Pic";
import { wordCount, wordCountState } from "../utils/wordcount";

export function Load() {
  const passageId = useStore((s) => s.passageId);
  const setPassage = useStore((s) => s.setPassage);
  const custom = useStore((s) => s.custom);
  const setCustom = useStore((s) => s.setCustom);
  const setChapter = useStore((s) => s.setChapter);
  const [own, setOwn] = useState(false);
  const [text, setText] = useState("");

  const sample = PASSAGES.find((p) => p.id === passageId) ?? PASSAGES[0];
  const shown = own ? text : sample.text;
  const n = wordCount(shown);
  const state = wordCountState(n);
  const stateText = state === "ok" ? copy.load.valid : state === "short" ? copy.load.tooShort : copy.load.tooLong;

  const preview = useMemo(() => (own && state === "ok" ? basicMode(text) : null), [own, state, text]);

  const useOwn = () => {
    if (!preview) return;
    const p: Passage = { id: "p1", title: "Your passage (basic mode)", subject: "Custom", text, easyRead: preview.easyRead, quiz: preview.quiz };
    setCustom(p);
  };

  return (
    <Panel title={copy.load.title} variant="side">
      <p className="muted">{copy.load.sub}</p>
      <div className="seg seg-wrap" role="group" aria-label={copy.load.selectLabel}>
        {PASSAGES.map((p) => (
          <button key={p.id} aria-pressed={!own && !custom && passageId === p.id} onClick={() => { setOwn(false); setPassage(p.id); }}>
            {p.title}
          </button>
        ))}
      </div>

      <div className="paper">
        <label className="sr-only" htmlFor="passage-text">Passage text</label>
        <textarea
          id="passage-text" className="paper-text" value={shown} readOnly={!own}
          placeholder={copy.load.ownPlaceholder} onChange={(e) => setText(e.target.value)} rows={9}
        />
        <div className="paper-foot">
          <span className={`count count-${state}`}>
            <span aria-hidden="true">{state === "ok" ? "✓" : "!"}</span> <strong>{n}</strong> {copy.load.counter}. {stateText}
          </span>
          {!own && <span className="muted">{copy.load.readonly}</span>}
        </div>
      </div>

      <label className="toggle">
        <input type="checkbox" checked={own} onChange={(e) => { setOwn(e.target.checked); if (!e.target.checked) { setCustom(null); } }} />
        <span>{copy.load.tryOwn}</span>
      </label>

      {own && (
        <div className="preview">
          <p className="muted">{copy.load.ownNote}</p>
          {preview ? (
            <>
              <div className="preview-head"><strong>{copy.load.ownResult}</strong> <Badge kind="preview" /></div>
              <ol className="preview-list">
                {preview.easyRead.map((s) => (
                  <li key={s.id}>{s.pictogram && <Pic file={s.pictogram} label={s.key} className="preview-pic" />}<span>{s.text}</span></li>
                ))}
              </ol>
              <p className="muted">{preview.quiz.length} template questions.</p>
              <button className="btn btn-primary btn-sm" onClick={useOwn}>Use it on the learner screen</button>
              {custom && <button className="btn btn-ghost btn-sm" onClick={() => setChapter(8)}>Open the learner screen</button>}
            </>
          ) : (
            <p className="muted">{stateText}.</p>
          )}
        </div>
      )}
    </Panel>
  );
}
