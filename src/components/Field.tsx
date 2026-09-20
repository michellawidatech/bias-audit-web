import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RESEARCH } from "../data";
import { prefersReduced } from "../hooks";

/* ---------------------------------------------------------------------------
   The hero is not decoration — it is the test set.
   One dot per resume (n = 373). Solid dots are the 283 that triggered at least
   one flag; hollow-weight dots are the 90 that triggered none. On load the
   dots fall out of noise and sort themselves into the grid: that settling is
   the audit. Pointer pushes them around; the sort can be replayed.
   --------------------------------------------------------------------------- */

const N = RESEARCH.dataset.test;                    // 373
const FLAGGED = RESEARCH.flags.atLeastOne.n;        // 283

const VERT = /* glsl */ `
  attribute vec3  aScatter;
  attribute vec3  aGrid;
  attribute float aSeed;
  attribute float aFlag;

  uniform float uProgress;
  uniform float uTime;
  uniform vec2  uPointer;
  uniform float uPointerOn;
  uniform float uSize;
  uniform float uDpr;
  uniform float uFade;

  varying float vAlpha;

  void main() {
    // staggered settle so the grid assembles rather than snapping
    float lag = fract(aSeed * 7.13) * 0.42;
    float p = clamp((uProgress - lag) / (1.0 - 0.42), 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p);

    vec3 pos = mix(aScatter, aGrid, p);

    float drift = mix(1.0, 0.16, p);
    pos.x += sin(uTime * 0.33 + aSeed * 6.2831) * 0.014 * drift;
    pos.y += cos(uTime * 0.27 + aSeed * 4.7123) * 0.014 * drift;

    vec2 delta = pos.xy - uPointer;
    float dist = length(delta);
    float push = smoothstep(0.30, 0.0, dist) * uPointerOn;
    pos.xy += normalize(delta + vec2(1e-5)) * push * 0.09;

    vAlpha = mix(0.26, 0.92, aFlag) * mix(0.35, 1.0, p) * uFade;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = uSize * uDpr * mix(0.74, 1.0, aFlag) * (1.0 + push * 1.5);
  }
`;

const FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float a = smoothstep(0.5, 0.40, length(c));
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor, a * vAlpha);
  }
`;

type Api = { replay: () => void };

export default function Field({ apiRef }: { apiRef?: React.RefObject<Api | null> }) {
  const host = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL — the hero still reads fine without it
    }

    const reduced = prefersReduced();
    let dirty = true; // reduced-motion mode only draws when this is set
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearAlpha(0);
    el.appendChild(renderer.domElement);

    /* ---- buffers ---------------------------------------------------------- */
    const scatter = new Float32Array(N * 3);
    const grid = new Float32Array(N * 3);
    const seed = new Float32Array(N);
    const flag = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      seed[i] = Math.random();
      flag[i] = i < FLAGGED ? 1 : 0; // sorted: flagged block, then the clean tail
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aScatter", new THREE.BufferAttribute(scatter, 3));
    geo.setAttribute("aGrid", new THREE.BufferAttribute(grid, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    geo.setAttribute("aFlag", new THREE.BufferAttribute(flag, 1));

    const uniforms = {
      uProgress: { value: reduced ? 1 : 0 },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(99, 99) },
      uPointerOn: { value: 0 },
      uSize: { value: 5 },
      uDpr: { value: Math.min(window.devicePixelRatio, 2) },
      uFade: { value: 1 },
      uColor: { value: new THREE.Color("#16150f") },
    };

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    /* ---- theme ------------------------------------------------------------ */
    const syncTheme = () => {
      const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
      if (ink) uniforms.uColor.value.set(ink);
    };
    syncTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener?.("change", syncTheme);

    /* ---- layout ----------------------------------------------------------- */
    let w = 1;
    let h = 1;

    const layout = () => {
      const rect = el.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      const aspect = w / h;

      renderer.setSize(w, h, false);
      camera.left = -aspect;
      camera.right = aspect;
      camera.top = 1;
      camera.bottom = -1;
      camera.updateProjectionMatrix();

      // the chart lives in the upper band; hero copy is anchored below it
      const narrow = w < 760;
      const u0 = narrow ? 0.06 : 0.02;
      const u1 = narrow ? 0.94 : 0.98;
      const v0 = narrow ? 0.04 : 0.06;
      const v1 = narrow ? 0.96 : 0.94;

      const toX = (u: number) => (u * 2 - 1) * aspect;
      const toY = (v: number) => 1 - v * 2;

      const areaW = toX(u1) - toX(u0);
      const areaH = toY(v0) - toY(v1);
      const cols = Math.max(6, Math.round(Math.sqrt((N * areaW) / areaH)));
      const rows = Math.ceil(N / cols);
      const stepX = areaW / Math.max(1, cols - 1);
      const stepY = rows > 1 ? areaH / (rows - 1) : 0;

      // 373 is prime, so the last row is always partial — centre it so the
      // remainder reads as a deliberate tail rather than an orphan.
      const tail = N % cols;
      const tailPad = tail ? ((cols - tail) * stepX) / 2 : 0;
      const lastRow = rows - 1;

      for (let i = 0; i < N; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        grid[i * 3] = toX(u0) + c * stepX + (tail && r === lastRow ? tailPad : 0);
        grid[i * 3 + 1] = toY(v0) - r * stepY;
        grid[i * 3 + 2] = 0;

        scatter[i * 3] = toX(u0) + Math.random() * areaW;
        scatter[i * 3 + 1] = toY(v1) + Math.random() * areaH * 1.35;
        scatter[i * 3 + 2] = 0;
      }
      geo.attributes.aScatter.needsUpdate = true;
      geo.attributes.aGrid.needsUpdate = true;

      const gap = Math.min(stepX, stepY || stepX);
      const px = (gap / 2) * (h / 2); // world units -> css px
      uniforms.uSize.value = Math.max(3.2, Math.min(8, px * 1.05));
      uniforms.uDpr.value = Math.min(window.devicePixelRatio, 2);
    };

    layout();
    const ro = new ResizeObserver(() => {
      layout();
      dirty = true;
    });
    ro.observe(el);

    /* ---- input ------------------------------------------------------------ */
    const onPointer = (e: PointerEvent) => {
      dirty = true;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        uniforms.uPointerOn.value = 0;
        return;
      }
      const aspect = rect.width / rect.height;
      uniforms.uPointer.value.set((x / rect.width) * 2 * aspect - aspect, 1 - (y / rect.height) * 2);
      uniforms.uPointerOn.value = 1;
    };
    const onLeave = () => {
      uniforms.uPointerOn.value = 0;
      dirty = true;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    /* ---- fade the field out as the hero leaves ---------------------------- */
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const gone = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height * 0.8)));
      uniforms.uFade.value = 1 - gone;
      dirty = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* ---- loop ------------------------------------------------------------- */
    let raf = 0;
    let start = performance.now() + 260;
    let running = true;

    const tick = (now: number) => {
      if (!running) return;
      if (reduced) {
        // no autoplaying drift: draw only when the viewer moved something
        if (dirty) {
          dirty = false;
          if (uniforms.uFade.value > 0.001) renderer.render(scene, camera);
        }
      } else {
        uniforms.uTime.value = now / 1000;
        const t = Math.min(1, Math.max(0, (now - start) / 2300));
        uniforms.uProgress.value = 1 - Math.pow(1 - t, 3);
        if (uniforms.uFade.value > 0.001) renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    if (apiRef) {
      apiRef.current = {
        replay: () => {
          if (reduced) return;
          layout();
          start = performance.now() + 60;
          uniforms.uProgress.value = 0;
        },
      };
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      media.removeEventListener?.("change", syncTheme);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  return <div ref={host} className="hero-canvas" aria-hidden="true" />;
}
