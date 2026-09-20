import { useEffect, useRef, useState } from "react";

export const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

/* -------------------------------------------------------------------------
   Lenis smooth scroll. Skipped entirely when the user asks for reduced motion.
   ------------------------------------------------------------------------- */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let frame = 0;
    let cancelled = false;

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });
      lenis = instance as unknown as typeof lenis;
      const loop = (time: number) => {
        instance.raf(time);
        frame = requestAnimationFrame(loop);
      };
      frame = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);
}

/* -------------------------------------------------------------------------
   One observer for every reveal on the page: [data-r] fades up, .lines
   rises out of its mask. Elements only ever animate in, never back out.
   ------------------------------------------------------------------------- */
export function useRevealRoot() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      document.querySelectorAll("[data-r], .lines").forEach((el) => el.classList.add("in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("in");
          obs.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    // The hero plays on load, not on scroll: parts of it sit below the
    // observer's reading band, and its CTA must never start invisible.
    const intro = requestAnimationFrame(() =>
      document.querySelectorAll(".hero [data-r], .hero .lines").forEach((el) => el.classList.add("in"))
    );

    const watch = () =>
      document
        .querySelectorAll("[data-r]:not(.in), .lines:not(.in)")
        .forEach((el) => obs.observe(el));
    watch();

    // pick up anything mounted later (tab panels, hot reloads)
    const mo = new MutationObserver(() => watch());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(intro);
      mo.disconnect();
      obs.disconnect();
    };
  }, []);
}

/* -------------------------------------------------------------------------
   Single element in-view latch (for count-ups and bar fills).
   ------------------------------------------------------------------------- */
export function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export function useCountUp(target: number, active: boolean, duration = 1200, decimals = 1) {
  const [value, setValue] = useState(0);
  const raf = useRef(0);
  useEffect(() => {
    if (!active) return;
    if (prefersReduced()) {
      setValue(target);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 4);
      setValue(parseFloat((target * eased).toFixed(decimals + 2)));
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else setValue(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [active, target, duration, decimals]);
  return value;
}

/* -------------------------------------------------------------------------
   Document scroll progress 0..1, written straight to a transform to keep
   it off the React render path.
   ------------------------------------------------------------------------- */
export function useScrollProgress(onChange: (p: number) => void) {
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });
  useEffect(() => {
    let ticking = false;
    const read = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      cb.current(max > 0 ? Math.min(1, Math.max(0, doc.scrollTop / max)) : 0);
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
}

/* -------------------------------------------------------------------------
   Which section is currently in the viewport's reading band.
   ------------------------------------------------------------------------- */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ids]);
  return active;
}

/* Body scroll lock for the mobile sheet. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}

export const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;
