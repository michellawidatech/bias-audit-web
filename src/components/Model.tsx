import { RESEARCH } from "../data";
import { useCountUp, useInView } from "../hooks";
import { Label, Lines, delay } from "./bits";

const SPECS = [
  { b: "2,400", s: "Resumes", d: "Native PDFs · Kaggle 2021" },
  { b: "24", s: "Occupations", d: "Classification targets" },
  { b: "512 / 256", s: "Tokens", d: "Chunk size / stride" },
  { b: "70/15/15", s: "Split", d: "1,737→1,920 train · 372 val · 373 test" },
  { b: "3.71e-5", s: "Learning rate", d: "Batch 16 · 3 epochs · Optuna" },
];

function Metric({ target, label, raw, i }: { target: number; label: string; raw: string; i: number }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const v = useCountUp(target, inView, 1200, 1);
  return (
    <div className="metric" ref={ref} role="group" aria-label={`${label}: ${target.toFixed(2)} percent on the test set (${raw})`}>
      <b aria-hidden="true">
        {v.toFixed(1)}
        <sup>%</sup>
      </b>
      <div className="mring" aria-hidden="true">
        <i style={{ width: inView ? `${target}%` : 0, ["--bd" as string]: `${i * 90}ms` }} />
      </div>
      <span>{label}</span>
      <small>Test set · {raw}</small>
    </div>
  );
}

export default function Model() {
  const p = RESEARCH.performance;
  return (
    <section className="movement" id="model" aria-labelledby="model-h">
      <div className="shell">
        <Label n="04">Inside the model</Label>
        <Lines id="model-h" lines={["What the classifier", <><span className="soft">actually did.</span></>]} />
        <p className="lede" data-r style={delay(120)}>
          A DistilBERT sequence classifier over <strong>24 occupation classes</strong>, tuned with
          Optuna. These are <strong>observed test-set measurements</strong> — reported as
          measurements, not as proof the model is good.
        </p>

        <div className="specs" data-r style={delay(180)}>
          {SPECS.map((x) => (
            <div className="spec" key={x.s}>
              <b>{x.b}</b>
              <span>{x.s}</span>
              <small>{x.d}</small>
            </div>
          ))}
        </div>

        <div className="metrics" data-r style={delay(220)}>
          <Metric target={p.accuracy * 100} label="Accuracy" raw="0.7480" i={0} />
          <Metric target={p.precision * 100} label="Precision" raw="0.7661" i={1} />
          <Metric target={p.recall * 100} label="Recall" raw="0.7480" i={2} />
          <Metric target={p.f1 * 100} label="F1 score" raw="0.7466" i={3} />
        </div>

        <p className="hyper" data-r>
          Optuna hyperparameters: lr <b>3.71e-5</b> · batch <b>16</b> · epochs <b>3</b> · warmup{" "}
          <b>10%</b> · dropout <b>0.2</b>. Preprocessing: pdfplumber / pytesseract · unicode
          normalization · PII removal · lowercasing · hybrid sampling.
        </p>
      </div>
    </section>
  );
}
