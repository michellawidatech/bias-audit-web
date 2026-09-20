import { RESEARCH } from "../data";
import { delay } from "./bits";

export default function Finale() {
  return (
    <>
      <section className="movement finale" aria-labelledby="fin-h">
        <div className="shell">
          <h2 id="fin-h" className="closing lines">
            <span><i style={delay(0)}>“AI should not only tell us</i></span>
            <span><i style={delay(80)}>what decision it made.</i></span>
            <span><i style={delay(160)}><em>It should help us understand why.”</em></i></span>
          </h2>

          <div className="paper-card" data-r style={delay(220)}>
            <h3>{RESEARCH.title}</h3>
            <dl className="paper-meta">
              <div>
                <dt>Authors</dt>
                <dd>{RESEARCH.authors.map((a) => <b key={a}>{a}</b>)}</dd>
              </div>
              <div>
                <dt>Affiliation</dt>
                <dd><b>{RESEARCH.affiliation}</b>{RESEARCH.venue}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>DistilBERT · SHAP · Fairness flags · LLaMA 2</dd>
              </div>
              <div>
                <dt>Corpus</dt>
                <dd>{RESEARCH.dataset.resumes.toLocaleString()} resumes · {RESEARCH.dataset.classes} occupations · {RESEARCH.dataset.source} {RESEARCH.dataset.year}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <footer>
        <div className="shell foot-in">
          <span>Bias Audit Framework · BINUS · ICISS 2026 · all metrics as reported in research context</span>
          <span>Acc 0.7480 · F1 0.7466 · 75.9% flagged for review ≠ 75.9% biased</span>
        </div>
      </footer>
    </>
  );
}
