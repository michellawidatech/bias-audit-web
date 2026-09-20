import { useEffect, useRef, useState } from "react";
import { useActiveSection, useScrollLock, useScrollProgress } from "../hooks";

const SECTIONS = [
  { id: "stakes", n: "01", label: "The stakes" },
  { id: "approach", n: "02", label: "Prior work" },
  { id: "framework", n: "03", label: "Framework" },
  { id: "model", n: "04", label: "Model" },
  { id: "evidence", n: "05", label: "Evidence" },
  { id: "rules", n: "06", label: "Rules" },
  { id: "findings", n: "07", label: "Findings" },
  { id: "case", n: "08", label: "Case study" },
  { id: "limits", n: "09", label: "Limits & next" },
];

const DESKTOP = ["framework", "model", "evidence", "findings", "case", "limits"];
const IDS = SECTIONS.map((s) => s.id);

type Theme = "light" | "dark" | null;

function readTheme(): Theme {
  try {
    const v = localStorage.getItem("bias-audit-theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export default function Nav() {
  const bar = useRef<HTMLDivElement | null>(null);
  const navEl = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(readTheme);
  const active = useActiveSection(IDS);

  useScrollLock(open);
  useScrollProgress((p) => {
    if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;
    navEl.current?.classList.toggle("stuck", p > 0.004);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme) root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
    try {
      if (theme) localStorage.setItem("bias-audit-theme", theme);
      else localStorage.removeItem("bias-audit-theme");
    } catch {
      /* private mode — the page still renders correctly */
    }
  }, [theme]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const toggleTheme = () => {
    const isDark =
      document.documentElement.getAttribute("data-theme") === "dark" ||
      (!document.documentElement.getAttribute("data-theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>

      <nav className="nav" ref={navEl} aria-label="Primary">
        <div className="shell nav-in">
          <a className="mark" href="#top" aria-label="Bias Audit Framework — back to top">
            <span className="mark-glyph" aria-hidden="true" />
            <span className="mark-text">
              Bias Audit Framework
              <span>BINUS · ICISS 2026</span>
            </span>
          </a>

          <div className="nav-links">
            {SECTIONS.filter((s) => DESKTOP.includes(s.id)).map((s) => (
              <a key={s.id} href={`#${s.id}`} className={active === s.id ? "here" : undefined}>
                {s.label}
              </a>
            ))}
          </div>

          <div className="nav-tools">
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle light or dark appearance">
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.3" />
                <path d="M8 .9v1.8M8 13.3v1.8M15.1 8h-1.8M2.7 8H.9M13 3l-1.3 1.3M4.3 11.7 3 13M13 13l-1.3-1.3M4.3 4.3 3 3"
                  stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="icon-btn nav-menu-btn"
              onClick={() => setOpen(true)}
              aria-label="Open section menu"
              aria-expanded={open}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 5h12M2 11h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div ref={bar} className="nav-progress" aria-hidden="true" />
      </nav>

      {open && (
        <div className="sheet-scrim open" onClick={() => setOpen(false)} aria-hidden="true" />
      )}
      <div
        className={`sheet${open ? " open" : ""}`}
        role="dialog"
        aria-modal={open}
        aria-label="Sections"
        inert={!open}
      >
        <div className="sheet-grip" aria-hidden="true" />
        {SECTIONS.map((s) => (
          <a key={s.id} href={`#${s.id}`} onClick={() => setOpen(false)}>
            <span className="idx">{s.n}</span>
            {s.label}
            <span aria-hidden="true">›</span>
          </a>
        ))}
      </div>
    </>
  );
}
