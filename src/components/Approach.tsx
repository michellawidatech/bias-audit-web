import { COMBINATION, PRIOR_WORK } from "../data";
import { Label, Lines, Rich, delay } from "./bits";

export default function Approach() {
  return (
    <section className="movement" id="approach" aria-labelledby="approach-h">
      <div className="shell">
        <Label n="02">Where existing work stops</Label>
        <Lines
          id="approach-h"
          lines={["Fairness is usually", <>checked <span className="soft">too late</span></>, <>— or <span className="soft">too narrowly.</span></>]}
        />
        <p className="lede" data-r style={delay(120)}>
          Common interventions each cover one stage. This project targets the{" "}
          <strong>gap between them</strong>: a single pipeline that classifies, explains,
          measures, flags, and narrates — before a decision lands.
        </p>

        <div className="ledger" data-r style={delay(180)}>
          {PRIOR_WORK.map((w, i) => (
            <div className="ledger-row" key={w.stage}>
              <span className="rn">0{i + 1}</span>
              <h4>
                {w.claim}
                <span>{w.stage}</span>
              </h4>
              <p><Rich text={w.limit} /></p>
            </div>
          ))}
          <div className="ledger-row">
            <span className="rn">—</span>
            <h4>
              The gap this project addresses
              <span>Synthesis</span>
            </h4>
            <p>
              Existing approaches focus on statistical parity or fix outputs after decisions
              exist. They rarely show <b>which words moved a prediction</b> and hand that
              evidence to a human reviewer in time.
            </p>
          </div>
        </div>

        <div className="combo" data-r style={delay(240)}>
          <h4>The combination proposed here</h4>
          <ol>
            {COMBINATION.map((c, i) => (
              <li key={c.layer}>
                <i>0{i + 1}</i>
                <b>{c.layer}</b>
                <em>{c.detail}</em>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
