import { useState } from "react";
import { RESEARCH } from "../data";
import { useCountUp, useInView } from "../hooks";
import { Label, Lines, delay } from "./bits";

const f = RESEARCH.flags;
const BARS = [
  { id: "uncertain", cls: "b-uncertain", label: "Uncertain", ...f.uncertain },
  { id: "bias", cls: "b-bias", label: "Potential bias", ...f.potentialBias },
  { id: "risk", cls: "b-risk", label: "Fairness risk", ...f.fairnessRisk },
  { id: "clean", cls: "b-clean", label: "No flag", ...f.noFlag },
];

export default function Findings() {
  const { ref, inView } = useInView<HTMLDivElement>(0.25);
  const big = useCountUp(f.atLeastOne.pct, inView, 1500, 1);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="movement" id="findings" aria-labelledby="find-h">
      <div className="shell">
        <Label n="07">What the framework found</Label>
        <Lines id="find-h" lines={["Most resumes deserved", <><span className="soft">a second look.</span></>]} />
        <p className="lede" data-r style={delay(120)}>
          Test set: <strong>373 resumes</strong>, from a 1,737 → 1,920 balanced train split and 372
          validation. Mean occupation accuracy <strong>0.75</strong>, mean suitability{" "}
          <strong>0.661</strong>, FPR range <strong>{RESEARCH.fairness.fprRange}</strong>.
        </p>

        <div className="finding" ref={ref} data-r style={delay(180)}>
          <div>
            <p className="big-number" aria-label={`${f.atLeastOne.pct} percent triggered at least one flag`}>
              {big.toFixed(1)}<sup>%</sup>
            </p>
            <p className="bn-cap">of test resumes triggered at least one flag</p>
            <p className="bn-sub">{f.atLeastOne.n} of {RESEARCH.dataset.test} test resumes</p>
            <p className="caveat">
              <b>This is a review signal — not a finding that 75.9% of resumes were biased.</b>{" "}
              Each flag means one thing: uncertainty, proxy-token influence, or a fairness-risk
              threshold met → route to human review.
            </p>
          </div>

          <div className="breakdown">
            {BARS.map((b, i) => (
              <button
                key={b.id}
                className={`brow ${b.cls}`}
                aria-pressed={open === b.id}
                onClick={() => setOpen(open === b.id ? null : b.id)}
              >
                <span className="bl">{b.label}</span>
                <span className="bt" aria-hidden="true">
                  <i className="bf" style={{ width: inView ? `${b.pct}%` : 0, ["--bd" as string]: `${i * 110}ms` }} />
                </span>
                <span className="bv">{b.pct.toFixed(1)}%</span>
                <span className="bn">n = {b.n} resumes</span>
              </button>
            ))}
            <p className="breakdown-note">
              Test-set rates · n = 373 · uncertain 165 · bias 153 · fairness 72 · clean 90<br />
              6 of 24 occupations below DI 0.8 · cross-occupation parity 0.717 (SD 0.1845)<br />
              Engineering, Finance, Sales and Teacher overselected above 1.19
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
