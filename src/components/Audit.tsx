import { useInView } from "../hooks";
import { Label, Lines, delay } from "./bits";

const ATTRIB = [
  { t: "female", v: 0.014535, w: 100 },
  { t: "experienced", v: 0.014253, w: 98 },
];

export default function Audit() {
  const { ref, inView } = useInView<HTMLDivElement>(0.2);

  return (
    <section className="movement" id="case" aria-labelledby="case-h">
      <div className="shell">
        <Label n="08">Case study · one audit report</Label>
        <Lines id="case-h" lines={["Right answer.", <><span className="soft">Still flagged.</span></>]} />
        <p className="lede" data-r style={delay(120)}>
          Resume <strong>10332998</strong> was classified correctly — and the framework still found
          three reasons to review it. <strong>Accuracy alone does not answer whether the process
          was fair.</strong>
        </p>

        <div className="audit" ref={ref} data-r style={delay(180)}>
          <div className="audit-bar">
            <span className="t">Audit report · test set</span>
            <span className="v">Generated after classification, before any hiring decision</span>
          </div>

          <div className="audit-grid">
            <div>
              <div className="facts">
                <div className="fact"><span>Resume ID</span><b>10332998</b></div>
                <div className="fact"><span>Suitability</span><b className="warn">0.50</b></div>
                <div className="fact"><span>Predicted</span><b>Consultant</b></div>
                <div className="fact"><span>Ground truth</span><b className="ok">Consultant ✓</b></div>
              </div>

              <div className="meter">
                <div className="mh">
                  <span>Suitability score</span>
                  <span>0.50 vs. 0.627</span>
                </div>
                <div className="meter-track">
                  <span className="meter-thresh" style={{ left: "62.7%" }} />
                  <span className="meter-fill" style={{ width: inView ? "calc(50% - 6px)" : 0 }} />
                </div>
                <div className="meter-scale"><span>0.00</span><span>0.50</span><span>1.00</span></div>
              </div>

              <div className="aflags">
                <div className="aflag a-uncertain">
                  <span className="dot" aria-hidden="true" />
                  <div><b>UNCERTAIN_DECISION</b>0.50 &lt; 0.627 — confidence below the threshold.</div>
                </div>
                <div className="aflag a-bias">
                  <span className="dot" aria-hidden="true" />
                  <div><b>POTENTIAL_BIAS</b>“female” and “experienced” exceed |SHAP| 0.005.</div>
                </div>
                <div className="aflag a-risk">
                  <span className="dot" aria-hidden="true" />
                  <div><b>FAIRNESS_RISK</b>Consultant class disparate impact below 0.8.</div>
                </div>
              </div>
            </div>

            <div className="attrib">
              <h4>Token attribution (SHAP)</h4>
              {ATTRIB.map((r, i) => (
                <div className="arow" key={r.t}>
                  <span className="at">“{r.t}”</span>
                  <span className="ab" aria-hidden="true">
                    <i style={{ width: inView ? `${r.w}%` : 0, ["--bd" as string]: `${i * 140}ms` }} />
                  </span>
                  <span className="av">+{r.v.toFixed(6)}</span>
                </div>
              ))}

              <div className="llm">
                <p className="llm-h">LLaMA 2 explanation — written for HR</p>
                <p>
                  “Prediction <b>Consultant (0.50)</b> is <b>unreliable</b> — below the 0.627
                  suitability threshold. Tokens <b>‘female’</b> and <b>‘experienced’</b> carried
                  above-threshold influence and read as <b>potential demographic signals rather
                  than purely merit-based signals</b>. Class-level fairness risk also applies.”
                </p>
                <p className="action">
                  Intended outcome → HR reviews these concerns rather than blindly accepting the
                  prediction.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="moral" data-r>
          The model got the occupation right.{" "}
          <span>But the framework still identified reasons to review.</span>
        </p>
      </div>
    </section>
  );
}
