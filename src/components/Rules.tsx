import { useState } from "react";
import { RESEARCH, RULES } from "../data";
import { useInView } from "../hooks";
import { Label, Lines, delay } from "./bits";

export default function Rules() {
  const [open, setOpen] = useState<string | null>("uncertain");
  const { ref, inView } = useInView<HTMLDivElement>(0.2);
  const n = RESEARCH.dataset.test;

  return (
    <section className="movement" id="rules" aria-labelledby="rules-h">
      <div className="shell">
        <Label n="06">How bias gets detected</Label>
        <Lines id="rules-h" lines={["Three explicit rules.", <><span className="soft">No silent judgment.</span></>]} />
        <p className="lede" data-r style={delay(120)}>
          Every flag traces to a <strong>stated numeric threshold</strong>. Open a rule to read the
          exact condition and how often it fired across the {n}-resume test set.
        </p>

        <div className="rules" ref={ref} data-r style={delay(180)}>
          {RULES.map((r) => (
            <button
              key={r.id}
              className={`rule-card ${r.cls}`}
              aria-expanded={open === r.id}
              onClick={() => setOpen(open === r.id ? null : r.id)}
            >
              <span className="rule-head">
                <span className="dot" aria-hidden="true" />
                <span className="nm">{r.name}</span>
              </span>
              <span className="rule-expr">{r.expr}</span>
              <span className="rule-title">{r.title}</span>
              <span className="rule-body">{r.body}</span>
              <span className="rule-fired">
                <span>Fired on {r.n} of {n}</span>
                <span className="bar" aria-hidden="true">
                  <i style={{ width: inView ? `${r.pct}%` : 0 }} />
                </span>
                <span>{r.pct.toFixed(1)}%</span>
              </span>
              <span className="rule-more">
                <span>
                  <span className="rule-detail">{r.detail}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
