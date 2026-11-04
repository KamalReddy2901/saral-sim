import { copy } from "../data/copy";
import { useStore } from "../store/useStore";

export function Intro() {
  const setChapter = useStore((s) => s.setChapter);
  const view = useStore((s) => s.view);
  return (
    <section className="hero" aria-labelledby="hero-title">
      <h1 id="hero-title" className="hero-title">{copy.hero.headline.split(copy.hero.accent)[0]}<mark>{copy.hero.accent}</mark>{copy.hero.headline.split(copy.hero.accent)[1]}</h1>
      <p className="hero-sub">{copy.hero.sub}</p>
      <div className="hero-actions">
        <button className="btn btn-primary" onClick={() => setChapter(1)}>{copy.hero.run}</button>
        <button className="btn btn-ghost" onClick={() => setChapter(8)}>{copy.hero.learner}</button>
      </div>
      <ul className="hero-facts" aria-label="Key facts">
        <li>Offline</li><li>On-device AI</li><li>Easy-read with pictograms</li>
      </ul>
      {view === "2d" && <p className="hero-note">{copy.fallback2d}</p>}
    </section>
  );
}
