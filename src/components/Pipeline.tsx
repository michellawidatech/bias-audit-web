import { useEffect, useRef, useState } from "react";
import { PIPELINE_STAGES } from "../data";
import { Arrow, Label, Lines, delay } from "./bits";

export default function Pipeline() {
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement | null>(null);
  const stage = PIPELINE_STAGES[active];
  const last = PIPELINE_STAGES.length - 1;

  // Keep the selected chip inside the rail on small screens. Scroll the rail
  // itself — scrollIntoView would drag the whole document along with it — and
  // skip the first pass so landing on the page doesn't jump the reader here.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const track = rail.current;
    const chip = track?.children[active] as HTMLElement | undefined;
    if (!track || !chip) return;
    const left = chip.offsetLeft - (track.clientWidth - chip.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") setActive((i) => Math.min(last, i + 1));
    if (e.key === "ArrowLeft") setActive((i) => Math.max(0, i - 1));
  };

  return (
    <section className="movement" id="framework" aria-labelledby="fw-h">
      <div className="shell">
        <Label n="03">The framework</Label>
        <Lines id="fw-h" lines={["One resume in.", <><span className="soft">An auditable trail out.</span></>]} />
        <p className="lede" data-r style={delay(120)}>
          Eight stages, each one inspectable. Select a stage to read{" "}
          <strong>what happens, why it exists</strong>, and the exact technical detail — raw PDF →
          preprocessing → DistilBERT → SHAP → fairness → flags → LLaMA 2 → HR review.
        </p>

        <div className="pipe" data-r style={delay(180)}>
          <div className="pipe-rail" role="tablist" aria-label="Pipeline stages" ref={rail} onKeyDown={onKey}>
            {PIPELINE_STAGES.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                id={`tab-${s.id}`}
                aria-selected={i === active}
                aria-controls="pipe-panel"
                tabIndex={i === active ? 0 : -1}
                className="pstage"
                onClick={() => setActive(i)}
              >
                <span className="pi">{s.index}</span>
                <span className="pn">{s.name}</span>
              </button>
            ))}
          </div>

          <div className="pipe-track" aria-hidden="true">
            <i style={{ width: `${((active + 1) / PIPELINE_STAGES.length) * 100}%` }} />
          </div>

          <div
            className="pipe-panel"
            id="pipe-panel"
            role="tabpanel"
            aria-labelledby={`tab-${stage.id}`}
            tabIndex={-1}
          >
            <div>
              <span className="stage-of">
                Stage {stage.index} of 08 · {stage.short}
              </span>
              <h3>{stage.name}</h3>
              <dl className="pipe-def">
                <dt>What happens</dt>
                <dd>{stage.what}</dd>
                <dt>Why it exists</dt>
                <dd>{stage.why}</dd>
              </dl>
            </div>

            <div className="pipe-side">
              <h4>Technical detail</h4>
              <div className="chips">
                {stage.tech.map((t) => (
                  <span className="chip" key={t}>{t}</span>
                ))}
              </div>
              <div className="pipe-nav">
                <button
                  className="icon-btn"
                  onClick={() => setActive((i) => Math.max(0, i - 1))}
                  disabled={active === 0}
                  aria-label="Previous stage"
                >
                  <Arrow dir="left" />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => setActive((i) => Math.min(last, i + 1))}
                  disabled={active === last}
                  aria-label="Next stage"
                >
                  <Arrow />
                </button>
                <span className="count">{active + 1} / {PIPELINE_STAGES.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
