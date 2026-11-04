import { copy } from "../data/copy";
import { credits, openSource } from "../data/credits.config";
import { ARASAAC_CREDIT, ARASAAC_IN_USE, LEXICON_SIZE } from "../utils/pictograms";

const isPlaceholder = (s: string) => s.startsWith("[") || s.includes("your-org") || s === "";

export function Credits() {
  const c = copy.credits;
  return (
    <section className="panel panel-full" tabIndex={0} data-world="light" aria-labelledby="credits-title">
      <div className="panel-inner credits">
        <h2 id="credits-title" className="sr-only">{c.title}</h2>
        <p className="muted">{credits.hackathon}</p>
        <div className="cred-grid">
          <div>
            <h3>{c.team}</h3>
            <ul>
              <li>{credits.teamName}</li>
              {credits.members.map((m) => <li key={m}>{m}</li>)}
              <li>{credits.college}</li>
              <li>{credits.contact}</li>
            </ul>
            <h3>{c.links}</h3>
            <ul>
              <li><a href={credits.repoUrl} rel="noreferrer">{c.repo}</a> {isPlaceholder(credits.repoUrl) && <span className="muted">({c.placeholder})</span>}</li>
              <li>{credits.pdfUrl ? <a href={credits.pdfUrl} rel="noreferrer">{c.pdf}</a> : <>{c.pdf} <span className="muted">({c.placeholder})</span></>}</li>
            </ul>
          </div>
          <div>
            <h3>{c.libs}</h3>
            <ul className="lic">
              {openSource.map((o) => <li key={o.name}><strong>{o.name}</strong> {o.licence}</li>)}
            </ul>
            <h3>{c.fonts}</h3>
            <p>Geist and Geist Mono (interface), Instrument Serif (titles) and Atkinson Hyperlegible (learner screen), all under the SIL Open Font License 1.1, self-hosted.</p>
            <h3>{c.pictograms}</h3>
            {ARASAAC_IN_USE ? (
              <p>{ARASAAC_CREDIT} Used for a non-commercial prototype.</p>
            ) : (
              <p>{c.ownPictograms} The library has {LEXICON_SIZE} pictograms.</p>
            )}
          </div>
        </div>
        <p className="muted">{c.principles}</p>
        <p className="muted">{c.proportions}</p>
        {ARASAAC_IN_USE && <p className="muted">{ARASAAC_CREDIT}</p>}
      </div>
    </section>
  );
}
