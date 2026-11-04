import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Passage, Question } from "../data/passages";
import { learnerCopy as t } from "../data/copy";
import type { LearnerSettings } from "../store/useStore";
import { highlight } from "../utils/highlight";
import { ARASAAC_CREDIT, ARASAAC_IN_USE } from "../utils/pictograms";
import { contentWordList } from "../utils/readability";
import { ArrowLeft, ArrowRight, CircleIcon, EyeIcon, GearIcon, NoIcon, SquareIcon, TickIcon } from "./icons";
import { Pic } from "./Pic";
import { THEMES, themeVars } from "./themes";
import "./learner.css";

export interface LearnerAppProps {
  passage: Pick<Passage, "title" | "easyRead" | "quiz">;
  settings: LearnerSettings;
  onSettingsChange: (patch: Partial<LearnerSettings>) => void;
  /** Move focus to the main button on each screen change (set after the first user action). */
  manageFocus?: boolean;
  /** Time for each "Preparing" step in ms. */
  prepareStepMs?: number;
}

type Screen =
  | { kind: "start" }
  | { kind: "preparing" }
  | { kind: "read"; i: number }
  | { kind: "quiz"; q: number; phase: "ask" | "right" | "notyet" }
  | { kind: "done" };

interface Actions { primary?: () => void; next?: () => void; back?: () => void }

export function LearnerApp({ passage, settings, onSettingsChange, manageFocus = true, prepareStepMs = 650 }: LearnerAppProps) {
  const [screen, setScreen] = useState<Screen>({ kind: "start" });
  const [overlay, setOverlay] = useState<"none" | "settings" | "about">("none");
  const [finished, setFinished] = useState(0);
  const interacted = useRef(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const actions = useRef<Actions>({});

  const { easyRead, quiz } = passage;
  const theme = THEMES[settings.theme];
  const style = useMemo(() => themeVars(theme, settings.textSize) as React.CSSProperties, [theme, settings.textSize]);

  const go = useCallback((s: Screen) => { interacted.current = true; setScreen(s); }, []);

  useEffect(() => {
    if (manageFocus && interacted.current && overlay === "none") primaryRef.current?.focus({ preventScroll: true });
  }, [screen, overlay, manageFocus]);

  // Preparing: truthful stage names, short calm steps
  const [prepStep, setPrepStep] = useState(0);
  useEffect(() => {
    if (screen.kind !== "preparing") return;
    setPrepStep(0);
    const timers = t.steps.map((_, i) => window.setTimeout(() => setPrepStep(i + 1), prepareStepMs * (i + 1)));
    const done = window.setTimeout(() => setScreen({ kind: "read", i: 0 }), prepareStepMs * (t.steps.length + 1));
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, [screen.kind, prepareStepMs]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (overlay !== "none") { if (e.key === "Escape") setOverlay("none"); return; }
    const tag = (e.target as HTMLElement).tagName;
    const onButton = tag === "BUTTON" || tag === "A";
    if (e.key === "ArrowRight") { actions.current.next?.(); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { actions.current.back?.(); e.preventDefault(); }
    else if ((e.key === "Enter" || e.key === " ") && !onButton) { actions.current.primary?.(); e.preventDefault(); }
  };

  let body: ReactNode = null;
  let nextAction: (() => void) | undefined;
  let backAction: (() => void) | undefined;
  let primaryAction: (() => void) | undefined;

  if (screen.kind === "start") {
    primaryAction = () => go({ kind: "preparing" });
    body = (
      <div className="lrn-center">
        <Pic file="book.svg" label="book" className="lrn-pic lrn-pic-hero" />
        <h2 className="lrn-title">{t.startTitle}</h2>
        <p className="lrn-sub">{passage.title}</p>
        <button ref={primaryRef} className="lrn-btn lrn-primary lrn-big" onClick={primaryAction}>{t.start}</button>
      </div>
    );
  } else if (screen.kind === "preparing") {
    body = (
      <div className="lrn-center" role="status" aria-live="polite">
        <h2 className="lrn-title">{t.preparing}</h2>
        <ol className="lrn-steps">
          {t.steps.map((s, i) => (
            <li key={s} data-state={i < prepStep ? "done" : i === prepStep ? "active" : "wait"}>
              <span className="lrn-step-icon" aria-hidden="true">{i < prepStep ? <TickIcon /> : <span className="lrn-dot-spin" />}</span>
              {s}
            </li>
          ))}
        </ol>
      </div>
    );
  } else if (screen.kind === "read") {
    const i = screen.i;
    const s = easyRead[i];
    const last = i === easyRead.length - 1;
    nextAction = () => (last ? go({ kind: "quiz", q: 0, phase: "ask" }) : go({ kind: "read", i: i + 1 }));
    backAction = i > 0 ? () => go({ kind: "read", i: i - 1 }) : () => go({ kind: "start" });
    primaryAction = nextAction;
    body = (
      <>
        <div className="lrn-read">
          {s.pictogram && <Pic file={s.pictogram} label={s.key} />}
          <p className="lrn-sentence">
            <Marked text={s.text} terms={[s.key]} />
          </p>
        </div>
        <Dots total={easyRead.length} index={i} label={t.sentenceOf(i + 1, easyRead.length)} />
        <div className="lrn-nav">
          <button className="lrn-btn lrn-secondary" onClick={backAction}><ArrowLeft /> {t.back}</button>
          <button ref={primaryRef} className="lrn-btn lrn-primary" onClick={nextAction}>
            {last ? t.startQuiz : t.next} <ArrowRight />
          </button>
        </div>
      </>
    );
  } else if (screen.kind === "quiz") {
    const q = quiz[screen.q];
    const support = easyRead[q.support - 1];
    const advance = () => {
      setFinished((n) => Math.max(n, screen.q + 1));
      if (screen.q + 1 >= quiz.length) go({ kind: "done" });
      else go({ kind: "quiz", q: screen.q + 1, phase: "ask" });
    };
    if (screen.phase === "ask") {
      const answer = (ok: boolean) => go({ kind: "quiz", q: screen.q, phase: ok ? "right" : "notyet" });
      body = (
        <>
          <div className="lrn-quiz">
            {support.pictogram && <Pic file={support.pictogram} label={support.key} className="lrn-pic lrn-pic-small" />}
            <p className="lrn-sentence lrn-question">{q.question}</p>
          </div>
          <Dots total={quiz.length} index={screen.q} label={t.questionOf(screen.q + 1, quiz.length)} />
          <Answers q={q} onAnswer={answer} firstRef={primaryRef} />
        </>
      );
    } else {
      const right = screen.phase === "right";
      nextAction = advance;
      primaryAction = right ? advance : () => go({ kind: "quiz", q: screen.q, phase: "ask" });
      body = (
        <>
          <div className={`lrn-feedback ${right ? "is-good" : "is-look"}`} role="status" aria-live="polite">
            <div className="lrn-fb-head">
              {right ? <TickIcon className="lrn-fb-icon" /> : <EyeIcon className="lrn-fb-icon" />}
              <h2>{right ? t.well : t.again}</h2>
            </div>
            <p className="lrn-sentence lrn-fb-sentence">
              <Marked text={support.text} terms={supportTerms(q, support.key)} />
            </p>
          </div>
          <Dots total={quiz.length} index={screen.q} label={t.questionOf(screen.q + 1, quiz.length)} />
          <div className="lrn-nav">
            {!right && (
              <button ref={primaryRef} className="lrn-btn lrn-primary" onClick={primaryAction}>{t.tryAgain}</button>
            )}
            <button ref={right ? primaryRef : undefined} className={`lrn-btn ${right ? "lrn-primary" : "lrn-secondary"}`} onClick={advance}>
              {t.next} <ArrowRight />
            </button>
          </div>
        </>
      );
    }
  } else {
    primaryAction = () => { setFinished(0); go({ kind: "start" }); };
    body = (
      <div className="lrn-center">
        <TickIcon className="lrn-done-icon" />
        <h2 className="lrn-title">{t.done}</h2>
        <p className="lrn-sub">{t.finished(finished)}</p>
        <div className="lrn-nav lrn-nav-center">
          <button className="lrn-btn lrn-secondary" onClick={() => { setFinished(0); go({ kind: "read", i: 0 }); }}>{t.replay}</button>
          <button ref={primaryRef} className="lrn-btn lrn-primary" onClick={primaryAction}>{t.finish}</button>
        </div>
      </div>
    );
  }
  actions.current = { primary: primaryAction, next: nextAction, back: backAction };

  return (
    <div
      ref={rootRef}
      className="lrn"
      style={style}
      tabIndex={0}
      role="region"
      aria-label="Learner screen"
      onKeyDown={onKeyDown}
      onPointerDown={() => { interacted.current = true; }}
    >
      <button className="lrn-gear" aria-label={t.settings} onClick={() => setOverlay("settings")}><GearIcon /></button>
      <div className="lrn-screen" key={screen.kind + ("i" in screen ? screen.i : "") + ("q" in screen ? screen.q + screen.phase : "")}>{body}</div>
      {overlay === "settings" && (
        <Settings settings={settings} onChange={onSettingsChange} onClose={() => setOverlay("none")} onAbout={() => setOverlay("about")} />
      )}
      {overlay === "about" && <About onClose={() => setOverlay("none")} />}
    </div>
  );
}

function Marked({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((seg, i) =>
        seg.mark ? <span key={i} className="lrn-key">{seg.text}</span> : <span key={i}>{seg.text}</span>,
      )}
    </>
  );
}

/** Words to highlight in the supporting sentence: the answer words for a choice, the key word otherwise. */
function supportTerms(q: Question, key: string): string[] {
  if (q.type === "choice") {
    const ans = q.options[q.correct];
    const cw = contentWordList(ans);
    return cw.length ? [ans, ...cw] : [key];
  }
  return [key];
}

function Dots({ total, index, label }: { total: number; index: number; label: string }) {
  return (
    <div className="lrn-dots" role="img" aria-label={label}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="lrn-dotp" data-state={i < index ? "done" : i === index ? "now" : "next"} />
      ))}
    </div>
  );
}

function Answers({ q, onAnswer, firstRef }: { q: Question; onAnswer: (ok: boolean) => void; firstRef: React.RefObject<HTMLButtonElement> }) {
  if (q.type === "yesno") {
    return (
      <div className="lrn-answers">
        <button ref={firstRef} className="lrn-btn lrn-answer" onClick={() => onAnswer(q.answer === true)}><TickIcon /> {t.yes}</button>
        <button className="lrn-btn lrn-answer" onClick={() => onAnswer(q.answer === false)}><NoIcon /> {t.no}</button>
      </div>
    );
  }
  // Deterministic order so the correct answer is not always first.
  const flip = q.id % 2 === 0;
  const order: (0 | 1)[] = flip ? [1, 0] : [0, 1];
  return (
    <div className="lrn-answers">
      {order.map((idx, pos) => (
        <button key={idx} ref={pos === 0 ? firstRef : undefined} className="lrn-btn lrn-answer" onClick={() => onAnswer(idx === q.correct)}>
          {pos === 0 ? <CircleIcon /> : <SquareIcon />} {q.options[idx]}
        </button>
      ))}
    </div>
  );
}

function Settings({ settings, onChange, onClose, onAbout }: { settings: LearnerSettings; onChange: (p: Partial<LearnerSettings>) => void; onClose: () => void; onAbout: () => void }) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => { first.current?.focus({ preventScroll: true }); }, []);
  const sizes = [t.small, t.medium, t.large];
  return (
    <div className="lrn-overlay" role="dialog" aria-modal="true" aria-label={t.settings}>
      <h2 className="lrn-title lrn-title-s">{t.settings}</h2>
      <fieldset className="lrn-fieldset">
        <legend>{t.textSize}</legend>
        <div className="lrn-seg">
          {sizes.map((s, i) => (
            <button key={s} ref={i === 0 ? first : undefined} className="lrn-btn lrn-seg-btn" aria-pressed={settings.textSize === i} onClick={() => onChange({ textSize: i as 0 | 1 | 2 })}>
              {settings.textSize === i && <TickIcon />} {s}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className="lrn-fieldset">
        <legend>{t.theme}</legend>
        <div className="lrn-seg">
          {(["normal", "high"] as const).map((th) => (
            <button key={th} className="lrn-btn lrn-seg-btn" aria-pressed={settings.theme === th} onClick={() => onChange({ theme: th })}>
              {settings.theme === th && <TickIcon />} {th === "normal" ? t.normal : t.high}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="lrn-nav">
        <button className="lrn-btn lrn-secondary" onClick={onAbout}>{t.about}</button>
        <button className="lrn-btn lrn-primary" onClick={onClose}>{t.closeSettings}</button>
      </div>
    </div>
  );
}

function About({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className="lrn-overlay lrn-about" role="dialog" aria-modal="true" aria-label={t.aboutTitle}>
      <h2 className="lrn-title lrn-title-s">{t.aboutTitle}</h2>
      <div className="lrn-about-text">
        <p>This is a simulation of the Saral prototype. The sentences and questions are example output prepared by the team.</p>
        <p>Saral follows Easy-to-Read principles. It is not certified Easy-to-Read.</p>
        <p>Font: Atkinson Hyperlegible, SIL Open Font License 1.1.</p>
        {ARASAAC_IN_USE ? (
          <p>{ARASAAC_CREDIT} Non-commercial use.</p>
        ) : (
          <p>Pictograms: original icons drawn for this project.</p>
        )}
      </div>
      <div className="lrn-nav">
        <button ref={ref} className="lrn-btn lrn-primary" onClick={onClose}>{t.closeSettings}</button>
      </div>
    </div>
  );
}
