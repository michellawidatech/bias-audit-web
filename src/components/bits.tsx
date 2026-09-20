import type { CSSProperties, ReactNode } from "react";

export const delay = (ms: number) => ({ "--rd": `${ms}ms` }) as CSSProperties;

/** (03) · The framework */
export function Label({ n, children }: { n: string; children: ReactNode }) {
  return (
    <p className="label" data-r>
      <span className="n">({n})</span>
      <span className="t">{children}</span>
    </p>
  );
}

/** Masked line-rise heading. Each array entry is one rendered line. */
export function Lines({
  lines,
  className = "title",
  stagger = 72,
  id,
}: {
  lines: ReactNode[];
  className?: string;
  stagger?: number;
  id?: string;
}) {
  return (
    <h2 id={id} className={`lines ${className}`}>
      {lines.map((l, i) => (
        <span key={i}>
          <i style={delay(i * stagger)}>{l}</i>
        </span>
      ))}
    </h2>
  );
}

export function Arrow({ dir = "right" }: { dir?: "right" | "left" | "down" }) {
  const r = { right: 0, down: 90, left: 180 }[dir];
  return (
    <svg className="arr" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transform: `rotate(${r}deg)` }}>
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Renders **bold** spans inside plain strings from the data module. */
export function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <span key={i}>{part}</span>))}
    </>
  );
}
