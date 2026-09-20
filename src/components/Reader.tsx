import { useMemo, useState } from "react";
import { EXCERPT, PROXY_TOKENS, RESEARCH, SHAP_ROWS } from "../data";
import { Label, Lines, delay } from "./bits";

const SHAP_MAX = 0.014535;
const THRESH = RESEARCH.flags.shapThreshold; // 0.005
const OCCS = ["All", "Consultant", "Teacher", "Engineering", "Designer"];

/* Signed bar: zero in the centre, ±0.005 flag thresholds marked. */
function ShapBar({ value }: { value: number }) {
  const mag = Math.min(1, Math.abs(value) / SHAP_MAX);
  const pos = value >= 0;
  const half = (mag * 100) / 2;
  const tp = (THRESH / SHAP_MAX) * 50;
  return (
    <div className="sl-track">
      <span
        className="sl-fill"
        style={{
          left: pos ? "50%" : `${50 - half}%`,
          width: `${half}%`,
          background: pos ? "var(--sig-clean)" : "var(--sig-risk)",
        }}
      />
      <span className="sl-zero" />
      <span className="sl-thresh" style={{ left: `${50 - tp}%` }} />
      <span className="sl-thresh" style={{ left: `${50 + tp}%` }} />
    </div>
  );
}

export default function Reader() {
  const [token, setToken] = useState("female");
  const [occ, setOcc] = useState("All");

  const proxy = PROXY_TOKENS[token];
  const hits = useMemo(() => SHAP_ROWS.filter((r) => r.token === token), [token]);
  const strongest = hits.reduce((a, b) => (Math.abs(b.meanShap) > Math.abs(a.meanShap) ? b : a), hits[0]);
  const flagged = Math.abs(strongest.meanShap) > THRESH;

  const table = useMemo(
    () =>
      (occ === "All" ? SHAP_ROWS : SHAP_ROWS.filter((r) => r.occupation === occ.toUpperCase())).slice()
        .sort((a, b) => Math.abs(b.meanShap) - Math.abs(a.meanShap)),
    [occ]
  );

  return (
    <section className="movement" id="evidence" aria-labelledby="ev-h">
      <div className="shell">
        <Label n="05">The evidence</Label>
        <Lines id="ev-h" lines={["Which words", <><span className="soft">moved the prediction?</span></>]} />
        <p className="lede" data-r style={delay(120)}>
          Token-level SHAP attribution. <strong>A positive value pushed suitability upward; a
          negative value pushed it downward.</strong> Tap a highlighted word to read its measured
          influence. 386 instances across the analysis mapped to proxy-variable tokens.
        </p>

        <div className="reader" data-r style={delay(180)}>
          <div className="doc">
            <div className="doc-head">
              <b>resume_10332.pdf</b>
              <span className="pill">Predicted: Consultant · suitability 0.50</span>
            </div>

            <p className="doc-body">
              {EXCERPT.map((t, i) => {
                if (t.w === ".")
                  return (
                    <span key={i} className={EXCERPT[i - 1]?.proxy ? "stop tight" : "stop"}>
                      {". "}
                    </span>
                  );
                const gap = EXCERPT[i + 1]?.w === "." ? "" : " ";
                if (!t.proxy)
                  return (
                    <span className="w" key={i}>
                      {t.w}
                      {gap}
                    </span>
                  );
                const row = SHAP_ROWS.find((r) => r.token === t.proxy);
                const dir = row && row.meanShap >= 0 ? "up" : "down";
                return (
                  <span key={i}>
                    <button
                      className={`tok ${dir}`}
                      onClick={() => setToken(t.proxy!)}
                      aria-pressed={token === t.proxy}
                      aria-label={`Inspect the token ${t.w}`}
                    >
                      {t.w}
                    </button>
                    {gap}
                  </span>
                );
              })}
            </p>

            <p className="doc-hint">
              Four proxy-signal candidates are highlighted. They are not labelled discriminatory —
              their measured influence is surfaced for human review.
            </p>
          </div>

          <div className="readout" aria-live="polite">
            <p className="ro-label">Measured influence</p>
            <p className="ro-token">
              <span className="qm">“</span>{proxy.token}<span className="qm">”</span>
            </p>
            <p className="ro-label" style={{ margin: "0 0 4px" }}>{proxy.kind}</p>

            {hits.map((h) => (
              <div className="shapline" key={h.occupation}>
                <div className="sl-head">
                  <span>→ {h.occupation}</span>
                  <span className="sl-val" style={{ color: h.meanShap >= 0 ? "var(--sig-clean)" : "var(--sig-risk)" }}>
                    {h.meanShap >= 0 ? "+" : ""}{h.meanShap.toFixed(6)}
                  </span>
                </div>
                <ShapBar value={h.meanShap} />
                <div className="sl-scale">
                  <span>pushed down</span>
                  <span>│ ±0.005 │</span>
                  <span>pushed up</span>
                </div>
              </div>
            ))}

            <p className="ro-note">{proxy.gloss}</p>

            <p className={`ro-verdict ${flagged ? "flagged" : "below"}`}>
              <span className="dot" aria-hidden="true" />
              {flagged
                ? "|mean SHAP| > 0.005 → potential bias flag"
                : "Below the 0.005 flag threshold"}
            </p>
          </div>
        </div>

        {/* every measured attribution, filterable ----------------------------- */}
        <div className="attr-block" data-r>
          <div className="attr-head">
            <h3 className="subtitle">All measured attributions</h3>
            <div className="segmented" role="tablist" aria-label="Filter by occupation">
              {OCCS.map((o) => (
                <button key={o} role="tab" aria-selected={occ === o} onClick={() => setOcc(o)}>
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="attr-table" role="table">
            <div className="attr-row attr-th" role="row">
              <span role="columnheader">Occupation</span>
              <span role="columnheader">Token</span>
              <span role="columnheader">Mean SHAP</span>
              <span role="columnheader">Direction</span>
            </div>
            {table.map((r) => (
              <div className="attr-row" role="row" key={r.occupation + r.token}>
                <span className="ao" role="cell">{r.occupation}</span>
                <span className="at" role="cell">“{r.token}”</span>
                <span
                  className="av"
                  role="cell"
                  style={{ color: r.meanShap >= 0 ? "var(--sig-clean)" : "var(--sig-risk)" }}
                >
                  {r.meanShap >= 0 ? "+" : ""}{r.meanShap.toFixed(6)}
                </span>
                <span className="ad" role="cell">
                  <ShapBar value={r.meanShap} />
                </span>
                <span className="an" role="cell">{r.note}</span>
              </div>
            ))}
          </div>

          <div className="attr-foot">
            <p className="legend">
              <span><i style={{ background: "var(--sig-clean)" }} />Positive — pushed the score up</span>
              <span><i style={{ background: "var(--sig-risk)" }} />Negative — pushed the score down</span>
              <span><i className="thr" />±0.005 flag threshold</span>
            </p>
            <p className="attr-note">
              Stratified SHAP sample: 30 resumes per occupation (22 for BPO). Values are reported
              means, not causal proof. SHAP shows measured influence inside the model — which is
              exactly why influence beyond |0.005| becomes a review flag rather than a verdict.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
