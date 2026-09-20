import { Label, Lines, delay } from "./bits";

const FUNNEL = [
  {
    n: "250–750",
    cap: "Applicants per posting",
    p: "**Volume no human team can read line by line**, so screening gets delegated.",
  },
  {
    n: "4–6",
    cap: "Reach interview",
    p: "**The funnel is extreme.** Small ranking shifts decide entire careers.",
  },
  {
    n: "AI",
    cap: "In the loop",
    p: "**Fast, consistent — and opaque**, unless it is explicitly audited.",
  },
];

export default function Stakes() {
  return (
    <section className="movement" id="stakes" aria-labelledby="stakes-h">
      <div className="shell">
        <Label n="01">The stakes</Label>
        <Lines
          id="stakes-h"
          lines={["Thousands apply.", "A handful are seen.", <><span className="soft">AI decides who.</span></>]}
        />
        <p className="lede" data-r style={delay(120)}>
          A model does not need an explicit demographic field to be influenced by demographic
          signals. <strong>Language itself carries proxies</strong> — and accurate-looking
          predictions can still rest on them.
        </p>

        <div className="funnel" data-r style={delay(180)}>
          {FUNNEL.map((f) => (
            <div className="funnel-cell" key={f.cap}>
              <b>{f.n}</b>
              <span className="cap">{f.cap}</span>
              <p>
                {f.p.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>))}
              </p>
            </div>
          ))}
        </div>

        <figure className="pull">
          <blockquote className="q-body lines">
            <span><i style={delay(0)}>“How can we detect systematic</i></span>
            <span><i style={delay(70)}>and linguistic bias in AI-powered</i></span>
            <span><i style={delay(140)}>resume classification <span className="u">before</span></i></span>
            <span><i style={delay(210)}>recruitment decisions are finalized?”</i></span>
          </blockquote>
          <figcaption className="src" data-r style={delay(300)}>
            Proposed answer — a multi-layer bias audit framework
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
