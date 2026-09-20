import { Suspense, lazy, useRef } from "react";

// three.js is ~200 kB gzipped and the hero reads fine without it, so the
// field loads after first paint; the fallback holds the same slot in the grid.
const Field = lazy(() => import("./Field"));
import { Arrow, delay } from "./bits";
import { RESEARCH } from "../data";

export default function Hero() {
  const field = useRef<{ replay: () => void } | null>(null);
  const f = RESEARCH.flags;

  return (
    <header className="hero" id="top">
      <div className="hero-field">
        <Suspense fallback={<div className="hero-canvas" aria-hidden="true" />}>
          <Field apiRef={field} />
        </Suspense>
        <button className="field-legend" onClick={() => field.current?.replay()} data-r style={delay(440)}>
          <span className="lg"><i className="on" aria-hidden="true" />{f.atLeastOne.n} flagged</span>
          <span className="lg"><i className="off" aria-hidden="true" />{f.noFlag.n} clean</span>
          <span className="lg src">Each dot is one test-set resume · n&nbsp;=&nbsp;{RESEARCH.dataset.test}</span>
          <span className="lg replay" aria-hidden="true">Replay ↻</span>
          <span className="vh">Replay the sorting animation</span>
        </button>
      </div>

      <div className="shell hero-in">
        <p className="hero-eyebrow" data-r style={delay(120)}>
          <i aria-hidden="true" />
          DistilBERT · SHAP · Fairness flags · LLaMA 2
        </p>

        <h1 className="display lines">
          <span><i style={delay(0)}>Can an AI resume</i></span>
          <span><i style={delay(80)}>screener be <span className="q">accurate</span></i></span>
          <span><i style={delay(160)}>— and still be <span className="q">biased?</span></i></span>
        </h1>

        <div className="hero-foot">
          <div>
            <p className="hero-sub" data-r style={delay(260)}>
              An explainable <b>bias-audit pipeline</b> for AI resume classification. It inspects what
              the model relied on, how confident it was, and whether selection is systematically
              imbalanced — <b>before</b> any hiring decision is finalized.
            </p>
            <div className="hero-cta" data-r style={delay(320)}>
              <a className="btn btn-fill" href="#framework">
                Explore the framework <Arrow />
              </a>
              <a className="btn btn-line" href="#evidence">
                See the evidence
              </a>
            </div>
          </div>

          <div className="hero-keys" data-r style={delay(380)}>
            <div className="hero-key">
              <b>0.748</b>
              <span>Accuracy</span>
            </div>
            <div className="hero-key">
              <b>{f.atLeastOne.pct}%</b>
              <span>Flagged</span>
            </div>
            <div className="hero-key">
              <b>386</b>
              <span>Proxy hits</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
