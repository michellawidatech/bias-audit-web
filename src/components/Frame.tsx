import { useState } from "react";
import { FUTURE, LIMITATIONS, REFRAME } from "../data";
import { Label, Lines, delay } from "./bits";

const TRACKS = [
  { id: "why", label: "Why it matters" },
  { id: "limits", label: "Limitations" },
  { id: "next", label: "What's next" },
];

export default function Frame() {
  const [track, setTrack] = useState("why");

  return (
    <section className="movement" id="limits" aria-labelledby="frame-h">
      <div className="shell">
        <Label n="09">The honest frame</Label>
        <Lines
          id="frame-h"
          lines={["From black-box classifier", <>to <span className="soft">auditable colleague.</span></>]}
        />
        <p className="lede" data-r style={delay(120)}>
          The framework is a <strong>bias-audit and decision-support mechanism</strong> — not an
          autonomous hiring system. Its reframing, its constraints, and its roadmap are published
          together.
        </p>

        <div className="tracks" data-r style={delay(180)}>
          <div className="segmented" role="tablist" aria-label="Closing tracks">
            {TRACKS.map((t) => (
              <button key={t.id} role="tab" aria-selected={track === t.id} onClick={() => setTrack(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {track === "why" && (
            <div className="track-list" role="tabpanel" aria-label="Why it matters">
              {REFRAME.map((r, i) => (
                <div className="track-item" key={r.q}>
                  <span className="ti">0{i + 1}</span>
                  <div>
                    <h4>{r.q}</h4>
                    <span className="tag">{r.when}</span>
                    <p>{r.p}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {track === "limits" && (
            <div className="track-list" role="tabpanel" aria-label="Limitations">
              {LIMITATIONS.map((l, i) => (
                <div className="track-item" key={l.t}>
                  <span className="ti">0{i + 1}</span>
                  <div>
                    <h4>{l.t}</h4>
                    <span className="tag">{l.tag}</span>
                    <p>{l.p}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {track === "next" && (
            <div className="track-list" role="tabpanel" aria-label="What's next">
              {FUTURE.map((s, i) => (
                <div className="track-item" key={s.t}>
                  <span className="ti">0{i + 1}</span>
                  <div>
                    <h4>{s.t}</h4>
                    <p>{s.p}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
