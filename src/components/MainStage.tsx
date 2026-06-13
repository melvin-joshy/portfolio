"use client";

import { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useRouteTransition } from "@/components/RouteTransition";
import { ArrowLeft, ArrowRight, ArrowUpRight, ArrowDown } from "lucide-react";
import { ScribbleUnderline } from "@/components/ScribbleUnderline";
import Artifacts from "@/components/Artifacts";
import { projects as allProjects } from "@/data/projects";

// Code-split: lottie-react is heavy and only some cards use a Lottie face; the
// two modals are hidden until opened. Splitting them out keeps the home route's
// First Load JS lean without any visible pop-in (they mount post-hydration).
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });
const ContactCard = dynamic(() => import("@/components/ContactCard"), { ssr: false });
const CertificateCard = dynamic(() => import("@/components/CertificateCard"), { ssr: false });

/* ─────────────── Data ─────────────── */

// MainStage shows only the curated carousel (first 8). Detail pages cover all.
const projects = allProjects.slice(0, 8);

const N = projects.length;
const SLIDE_EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring" as const, stiffness: 380, damping: 32 };

/* ─────────────── Lottie card face ─────────────── */

function LottieHero({ src }: { src: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(encodeURI(src))
      .then(r => r.json())
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [src]);

  if (!data) return null;

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      style={{ width: "100%", height: "100%", objectFit: "cover" as const }}
      rendererSettings={{ preserveAspectRatio: "xMidYMid slice" }}
    />
  );
}

/* ─────────────── Cursor ─────────────── */

type CursorMode = "default" | "view" | "prev" | "next";

/* Trail config — each dot springs to the one ahead, creating a true snake chain */
const TRAIL_SIZES    = [5, 4.2, 3.5, 2.8, 2.2, 1.6]; // px
const TRAIL_OPACITY  = [1, 0.75, 0.54, 0.36, 0.22, 0.12];
const SPRING_CHAIN   = [
  { stiffness: 580, damping: 38 },
  { stiffness: 400, damping: 32 },
  { stiffness: 260, damping: 27 },
  { stiffness: 165, damping: 23 },
  { stiffness: 105, damping: 19 },
  { stiffness: 66,  damping: 15 },
];

function Cursor({ mode }: { mode: CursorMode }) {
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);

  /* Chained springs — each follows the previous position, not the raw mouse */
  const x0 = useSpring(mx, SPRING_CHAIN[0]); const y0 = useSpring(my, SPRING_CHAIN[0]);
  const x1 = useSpring(x0, SPRING_CHAIN[1]); const y1 = useSpring(y0, SPRING_CHAIN[1]);
  const x2 = useSpring(x1, SPRING_CHAIN[2]); const y2 = useSpring(y1, SPRING_CHAIN[2]);
  const x3 = useSpring(x2, SPRING_CHAIN[3]); const y3 = useSpring(y2, SPRING_CHAIN[3]);
  const x4 = useSpring(x3, SPRING_CHAIN[4]); const y4 = useSpring(y3, SPRING_CHAIN[4]);
  const x5 = useSpring(x4, SPRING_CHAIN[5]); const y5 = useSpring(y4, SPRING_CHAIN[5]);

  const trail = [
    [x0, y0], [x1, y1], [x2, y2],
    [x3, y3], [x4, y4], [x5, y5],
  ] as const;

  useEffect(() => {
    const fn = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY); };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mx, my]);

  return (
    <>
      {/* Trail dots — rendered back-to-front so head is on top */}
      {[...trail].reverse().map(([x, y], ri) => {
        const i = trail.length - 1 - ri;
        return (
          <motion.div
            key={i}
            className="fixed pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ x, y, zIndex: 600 + i, mixBlendMode: "difference" }}
            animate={{ opacity: mode === "default" ? TRAIL_OPACITY[i] : 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="rounded-full bg-white"
              style={{ width: TRAIL_SIZES[i], height: TRAIL_SIZES[i] }}
            />
          </motion.div>
        );
      })}

      {/* Scrawled VIEW — own container, no blend mode, red ink */}
      <AnimatePresence>
        {mode === "view" && (
          <motion.div
            key="scrawl-view"
            className="fixed z-[611] pointer-events-none -translate-x-1/2 -translate-y-1/2"
            style={{ x: x0, y: y0 }}
            initial={{ scale: 0.72, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.72, opacity: 0 }}
            transition={{ duration: 0.18, ease: SLIDE_EASE }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontFamily: "var(--font-caveat)",
                fontSize: "22px",
                color: "#c0392b",
                lineHeight: 1,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              {"view →".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.14,
                    ease: "easeOut",
                    delay: i * 0.055,
                  }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prev / next arrow pills — keeps difference blend */}
      <motion.div
        className="fixed z-[610] pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{ x: x0, y: y0, mixBlendMode: "difference" }}
      >
        <AnimatePresence mode="wait">
          {(mode === "prev" || mode === "next") && (
            <motion.div
              key={mode}
              className="w-9 h-9 rounded-full border border-white/40 bg-black/50 backdrop-blur-sm flex items-center justify-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-white/80 flex items-center justify-center">
                {mode === "prev" ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

/* ─────────────── Pixel hover overlay ─────────────── */

function PixelHover({ accent, src }: { accent: string; src?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    const cols = 26, rows = 16;
    const cw = w / cols, ch = h / rows;

    const drawFromImage = (imgEl: HTMLImageElement) => {
      /* Downsample to grid size, then upscale with no smoothing = pixelation */
      const off = document.createElement("canvas");
      off.width = cols; off.height = rows;
      const offCtx = off.getContext("2d");
      if (!offCtx) return;
      offCtx.drawImage(imgEl, 0, 0, cols, rows);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, cols, rows, 0, 0, w, h);
      /* Subtle dark grid lines to define the pixel grid */
      ctx.globalAlpha = 0.08;
      ctx.strokeStyle = "#000";
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          ctx.strokeRect(c * cw, r * ch, cw, ch);
      ctx.globalAlpha = 1;
    };

    const drawAccentFallback = () => {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = accent;
          ctx.globalAlpha = Math.random() * 0.18 + 0.04;
          ctx.fillRect(c * cw, r * ch, cw, ch);
          ctx.globalAlpha = 0.06;
          ctx.strokeStyle = "#000";
          ctx.strokeRect(c * cw, r * ch, cw, ch);
        }
      }
      ctx.globalAlpha = 1;
    };

    if (src) {
      const img = new Image();
      img.src = encodeURI(src);
      /* Image is preloaded on mount so usually already .complete */
      if (img.complete) {
        drawFromImage(img);
      } else {
        img.onload = () => drawFromImage(img);
        img.onerror = drawAccentFallback;
      }
    } else {
      drawAccentFallback();
    }
  }, [accent, src]);

  return (
    <motion.canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
    />
  );
}

type RickRollFrame = string[];

function RickRollAscii({ active, reducedMotion }: { active: boolean; reducedMotion: boolean }) {
  const [frames, setFrames] = useState<RickRollFrame[]>([]);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (!active || frames.length > 0) return;
    let cancelled = false;
    void fetch("/rickroll.json")
      .then(response => response.json())
      .then((data: unknown) => {
        if (cancelled || !Array.isArray(data)) return;
        const parsed = data.filter((frame): frame is RickRollFrame =>
          Array.isArray(frame) && frame.every(row => typeof row === "string")
        );
        setFrames(parsed);
      })
      .catch(() => setFrames([]));

    return () => {
      cancelled = true;
    };
  }, [active, frames.length]);

  useEffect(() => {
    if (!active || reducedMotion || frames.length < 2) return;
    const id = window.setInterval(() => {
      setFrameIndex(index => (index + 1) % frames.length);
    }, 72);
    return () => window.clearInterval(id);
  }, [active, frames.length, reducedMotion]);

  const frame = frames[frameIndex % Math.max(frames.length, 1)];

  return (
    <motion.div
      className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
      initial={{ opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: [0, -2, 3, -1, 0] }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.16 : 0.28, repeat: reducedMotion ? 0 : 2, ease: "linear" }}
    >
      <div className="absolute inset-0 bg-black" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 6px)",
          mixBlendMode: "screen",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {frame ? (
          <pre
            aria-hidden="true"
            style={{
              color: "#e8ddd0",
              fontFamily: "monospace",
              fontSize: "clamp(2.4px, 0.33vw, 4.1px)",
              lineHeight: 0.9,
              letterSpacing: 0,
              transform: "scaleX(0.62)",
              transformOrigin: "center",
              textShadow: "0 0 10px rgba(196,168,130,0.18)",
              whiteSpace: "pre",
            }}
          >
            {frame.join("\n")}
          </pre>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-white/45">
            Loading rickroll
          </span>
        )}
      </div>
      {!reducedMotion && (
        <>
          <motion.div className="absolute inset-x-0 top-[22%] h-[14px] bg-white/10" animate={{ x: [-60, 80, -20] }} transition={{ duration: 0.18, repeat: Infinity }} />
          <motion.div className="absolute inset-x-0 top-[58%] h-[8px] bg-purple-300/15" animate={{ x: [70, -40, 60] }} transition={{ duration: 0.14, repeat: Infinity }} />
        </>
      )}
    </motion.div>
  );
}

/* ─────────────── Live Clock ─────────────── */

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () =>
      setT(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{t}</>;
}

/* ─────────────── Animated divider line ─────────────── */

function Divider({ delay = 0, right = false, theme = "dark" }: { delay?: number; right?: boolean; theme?: string }) {
  return (
    <div style={{ width: 20, height: 1, background: theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)", marginTop: 16, marginBottom: 16, overflow: "hidden", marginLeft: right ? "auto" : undefined }}>
      <motion.div
        style={{ height: "100%", background: theme === "light" ? "rgba(0,0,0,0.28)" : "rgba(255,255,255,0.28)", transformOrigin: right ? "right" : "left" }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.7, delay, ease: SLIDE_EASE }}
      />
    </div>
  );
}

/* ─────────────── Grid background ─────────────── */

function GridBackground({ theme }: { theme: "dark" | "light" }) {
  const dark = theme === "dark";

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>

      {/* ── Background image ── */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bg main.webp"
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          opacity: 1,
        }}
      />

      {/* ── Darken overlay — mutes the baked-in blueprint chrome so foreground type leads ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: dark ? "rgba(0,0,0,0.46)" : "rgba(255,255,255,0.30)",
      }} />

      {/* ── Vignette — edges deeper ── */}
      <div style={{
        position: "absolute", inset: 0,
        background: dark
          ? "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 20%, rgba(0,0,0,0.65) 100%)"
          : "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 20%, rgba(255,255,255,0.60) 100%)",
      }} />

    </div>
  );
}

/* ─────────────── Thumbnail scribble pool ─────────────── */

const THUMB_SCRIBBLES = [
  // wobbly oval
  "M 5,50 C 6,18 22,8 50,7 C 78,6 95,18 96,48 C 97,76 82,90 52,91 C 22,92 4,78 5,50",
  // double loop oval
  "M 4,52 C 5,20 22,10 50,9 C 78,8 96,20 97,50 C 98,78 82,92 52,93 C 22,94 3,78 4,52 M 9,48 C 10,24 26,15 50,14 C 74,13 92,24 93,48 C 94,70 79,84 54,85 C 28,86 8,70 9,48",
  // triple messy oval
  "M 4,50 C 5,16 22,6 50,5 C 78,4 96,17 97,48 C 98,78 83,93 53,94 C 23,95 3,80 4,50 M 9,54 C 10,26 26,16 52,15 C 78,14 95,27 96,52 C 97,74 81,88 56,88 C 30,89 8,74 9,54 M 13,49 C 14,28 28,20 50,19 C 72,18 88,28 89,49 C 90,68 78,81 58,82 C 35,83 12,67 13,49 L 22,38",
  // X cross
  "M 8,12 L 92,88 M 92,12 L 8,88",
  // 8-point starburst
  "M 50,50 L 50,4 M 50,50 L 90,20 M 50,50 L 96,50 M 50,50 L 90,80 M 50,50 L 50,96 M 50,50 L 10,80 M 50,50 L 4,50 M 50,50 L 10,20",
  // jagged explosion
  "M 50,50 L 46,6 L 52,20 L 42,4 M 50,50 L 90,38 L 78,46 L 94,36 M 50,50 L 84,84 L 74,76 L 92,90 M 50,50 L 50,94 L 47,78 L 54,96 M 50,50 L 10,80 L 22,72 L 6,88 M 50,50 L 12,20 L 22,30 L 4,10",
  // spiral
  "M 50,48 C 50,44 54,42 58,44 C 64,48 63,57 55,61 C 46,66 36,57 37,47 C 38,35 48,27 59,28 C 72,28 83,38 83,52 C 83,67 71,79 55,80 C 37,81 22,69 22,53 C 22,35 36,21 53,19 C 73,17 90,30 92,50",
  // diagonal hatch
  "M 0,30 L 70,0 M 0,55 L 100,5 M 0,80 L 100,30 M 10,100 L 100,55 M 35,100 L 100,80",
  // tangle ball
  "M 30,50 C 38,18 68,34 58,52 C 48,68 22,56 34,36 C 46,18 72,28 68,50 C 64,72 34,68 36,46 C 38,24 68,20 72,44 C 76,66 48,80 38,60 C 28,40 58,22 70,44",
  // concentric rings
  "M 50,38 C 64,38 72,43 72,50 C 72,57 64,62 50,62 C 36,62 28,57 28,50 C 28,43 36,38 50,38 M 50,20 C 72,20 88,34 88,50 C 88,66 72,80 50,80 C 28,80 12,66 12,50 C 12,34 28,20 50,20",
  // crown spikes
  "M 5,80 L 18,30 L 30,62 L 46,14 L 60,62 L 75,28 L 90,62 L 100,30",
  // broken box frame
  "M 8,12 L 45,12 M 62,12 L 92,12 L 92,48 M 92,65 L 92,88 L 52,88 M 35,88 L 8,88 L 8,52 M 8,30 L 8,12",
];

/* ─────────────── Ticker Item ─────────────── */

function TickerItem({
  p, isActive, theme, itemW, onPick,
}: {
  p: typeof projects[0];
  isActive: boolean;
  theme: "dark" | "light";
  itemW: number;
  onPick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [thumbIdx, setThumbIdx] = useState(() => Math.floor(Math.random() * THUMB_SCRIBBLES.length));
  const lastThumbRef = useRef(thumbIdx);

  const nameColor = hovered
    ? "#c0392b"
    : isActive
    ? (theme === "light" ? "rgba(0,0,0,0.92)" : "rgba(255,255,255,0.92)")
    : theme === "light"
    ? "rgba(0,0,0,0.72)"
    : "rgba(255,255,255,0.55)";

  function handleEnter() {
    let next = Math.floor(Math.random() * THUMB_SCRIBBLES.length);
    while (next === lastThumbRef.current) next = Math.floor(Math.random() * THUMB_SCRIBBLES.length);
    lastThumbRef.current = next;
    setThumbIdx(next);
    setHovered(true);
  }

  return (
    <button
      onClick={onPick}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
      className="ticker-btn flex items-center justify-center h-full shrink-0 relative px-6"
      data-active={isActive ? "true" : "false"}
      style={{
        width: itemW,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        opacity: isActive ? 1 : 0.35,
        transition: "opacity 0.15s ease",
      }}
    >
      {/* Asterisk separator */}
      <div style={{
        position: "absolute", right: -10, top: "50%", transform: "translateY(-50%)",
        fontSize: 16, lineHeight: 1,
        color: theme === "light" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)",
        zIndex: 1, userSelect: "none", pointerEvents: "none",
      }}>✱</div>

      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <p
          className="ticker-name"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: isActive ? 22 : 17,
            letterSpacing: "0.1em",
            lineHeight: 1,
            whiteSpace: "nowrap",
            color: nameColor,
            transition: "color 0.15s ease, font-size 0.15s ease",
          }}
        >
          {p.name}
        </p>
        {isActive && (
          <span
            style={{
              display: "inline-flex",
              color: hovered ? "#c0392b" : theme === "light" ? "rgba(0,0,0,0.45)" : "rgba(255,255,255,0.5)",
              transition: "color 0.15s ease, transform 0.15s ease",
              transform: hovered ? "translate(1px,-1px)" : "none",
            }}
          >
            <ArrowUpRight size={13} strokeWidth={1.6} />
          </span>
        )}
      </div>
    </button>
  );
}

/* ─────────────── Main Stage ─────────────── */

export default function MainStage({ visible }: { visible: boolean }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [cardHover, setCardHover] = useState(false);
  const [raccoonFrame, setRaccoonFrame] = useState<1 | 2 | 3 | "hi" | "handsup">(1);
  const [raccoonDir, setRaccoonDir] = useState<1 | -1>(1);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [artifactTouch, setArtifactTouch] = useState(false);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [certUnlocked, setCertUnlocked] = useState(false);
  const [certOpen, setCertOpen] = useState(false);

  // Reward unlock: show the certificate nav item once all 7 artifacts are found.
  // Read on mount so it persists across reloads; Artifacts also notifies live via onUnlock.
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mj_artifacts_v2");
      const arr = raw ? JSON.parse(raw) : [];
      if (Array.isArray(arr) && arr.length >= 7) setCertUnlocked(true);
    } catch {}
  }, []);

  const handleArtifactsUnlock = useCallback(() => {
    setCertUnlocked(true);
    let seen = false;
    try { seen = localStorage.getItem("mj_cert_seen") === "1"; } catch {}
    if (seen) return;
    window.setTimeout(() => {
      setCertOpen(true);
      try { localStorage.setItem("mj_cert_seen", "1"); } catch {}
    }, 1600);
  }, []);
  const raccoonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const artifactTouchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const easterEggTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const go = useRouteTransition();

  /* ── Endless ticker ── */
  const COPIES   = 13;                           // large pool — never runs out
  const ITEM_W   = 220;
  const MID_COPY = 6;                            // center copy index (0-based)
  const tickerItems = useMemo(() => Array.from({ length: COPIES }, () => projects).flat(), []);
  const vIdxRef  = useRef(MID_COPY * N);         // start: middle of 13-copy array
  const tickerContainerRef = useRef<HTMLDivElement>(null);
  const tickerMX = useMotionValue(0);
  const tickerX  = useSpring(tickerMX, { stiffness: 280, damping: 32, mass: 0.7 });
  const dragRef = useRef({ active: false, startX: 0, startMX: 0, moved: false, captured: false });
  const justDraggedRef = useRef(false);

  const centerTicker = useCallback((vIdx: number) => {
    const cw = tickerContainerRef.current?.offsetWidth ?? window.innerWidth;
    tickerMX.set(-(vIdx * ITEM_W) + cw / 2 - ITEM_W / 2);
  }, [tickerMX]);

  /* Silently reset to middle zone when drifting toward array edges */
  const normalizeTicker = useCallback(() => {
    const v = vIdxRef.current;
    const lo = 2 * N;
    const hi = (COPIES - 3) * N;
    if (v < lo || v > hi) {
      const mod = ((v % N) + N) % N;
      vIdxRef.current = MID_COPY * N + mod;
      const cw = tickerContainerRef.current?.offsetWidth ?? window.innerWidth;
      tickerMX.jump(-(vIdxRef.current * ITEM_W) + cw / 2 - ITEM_W / 2);
    }
  }, [tickerMX]);

  const cur = projects[active];

  // Peek (next) card lags `active` until the front-card slide settles. Without this,
  // `active` jumps instantly and the peek momentarily shows active+2 while the old
  // front is still sliding out — exposing the wrong project mid-transition.
  const [peekBase, setPeekBase] = useState(active);
  useEffect(() => {
    const t = setTimeout(() => setPeekBase(active), 900); // ≈ full mode="wait" exit+enter
    return () => clearTimeout(t);
  }, [active]);
  const midProj = projects[(peekBase + 1) % N];

  /* Preload all heroImages once on mount so navigating between cards is instant */
  useEffect(() => {
    projects.forEach(p => {
      if (p.heroImage) {
        const img = new Image();
        img.src = encodeURI(p.heroImage);
      }
    });
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("mj_theme_v1");
      if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    } catch {}
  }, []);

  const triggerRaccoon = useCallback((d: 1 | -1) => {
    if (raccoonTimer.current) clearTimeout(raccoonTimer.current);
    setRaccoonDir(d);
    setRaccoonFrame(2);
    raccoonTimer.current = setTimeout(() => {
      setRaccoonFrame(3);
      raccoonTimer.current = setTimeout(() => setRaccoonFrame(1), 380);
    }, 140);
  }, []);

  const triggerArtifactRaccoon = useCallback(() => {
    if (raccoonTimer.current) clearTimeout(raccoonTimer.current);
    setRaccoonDir(1);
    setRaccoonFrame("hi");
    raccoonTimer.current = setTimeout(() => setRaccoonFrame(1), 1900);
    setArtifactTouch(true);
    if (artifactTouchTimer.current) clearTimeout(artifactTouchTimer.current);
    artifactTouchTimer.current = setTimeout(() => setArtifactTouch(false), 520);
  }, []);

  // Spotlight artifact — raccoon freezes in "hands up" for the duration of the sweep (~4.8s)
  const triggerSpotlightRaccoon = useCallback(() => {
    if (raccoonTimer.current) clearTimeout(raccoonTimer.current);
    setRaccoonDir(1);
    setRaccoonFrame("handsup");
    raccoonTimer.current = setTimeout(() => setRaccoonFrame(1), 4800);
  }, []);

  const triggerEasterEgg = useCallback(() => {
    setEasterEggActive(true);
    if (easterEggTimer.current) clearTimeout(easterEggTimer.current);
    easterEggTimer.current = setTimeout(() => setEasterEggActive(false), 6500);
  }, []);

  useEffect(() => {
    return () => {
      if (raccoonTimer.current) clearTimeout(raccoonTimer.current);
      if (artifactTouchTimer.current) clearTimeout(artifactTouchTimer.current);
      if (easterEggTimer.current) clearTimeout(easterEggTimer.current);
    };
  }, []);

  const pick = useCallback((i: number, delta?: number) => {
    if (i === active) return;
    const d = delta !== undefined ? delta : (i > active ? 1 : -1);
    setDir(d);
    setActive(i);
  }, [active]);

  const next = useCallback(() => {
    triggerRaccoon(1);
    vIdxRef.current += 1;
    centerTicker(vIdxRef.current);
    normalizeTicker();   // rebase to the middle copy so the pool never runs out
    pick((active + 1) % N, 1);
  }, [active, pick, triggerRaccoon, centerTicker, normalizeTicker]);

  const prev = useCallback(() => {
    triggerRaccoon(-1);
    vIdxRef.current -= 1;
    centerTicker(vIdxRef.current);
    normalizeTicker();   // rebase to the middle copy so the pool never runs out
    pick((active - 1 + N) % N, -1);
  }, [active, pick, triggerRaccoon, centerTicker, normalizeTicker]);

  /* Direct ticker click — shortest-path delta */
  const openProject = useCallback((p: typeof projects[0]) => {
    if (p.externalUrl) window.open(p.externalUrl, "_blank", "noopener,noreferrer");
    else router.push(`/projects/${p.id}`);
  }, [router]);

  const pickDirect = useCallback((i: number) => {
    if (i === active) return;
    const curMod = ((vIdxRef.current % N) + N) % N;
    let delta = i - curMod;
    if (delta > N / 2)  delta -= N;
    if (delta < -N / 2) delta += N;
    vIdxRef.current += delta;
    centerTicker(vIdxRef.current);
    normalizeTicker();
    pick(i, delta);
    triggerRaccoon(delta > 0 ? 1 : -1);
  }, [active, pick, triggerRaccoon, centerTicker, normalizeTicker]);

  /* ── Swipe / drag the ticker (mobile-first) — 1:1 follow, snap to nearest on release ── */
  const onTickerPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { active: true, startX: e.clientX, startMX: tickerMX.get(), moved: false, captured: false };
  }, [tickerMX]);

  const onTickerPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) <= 4) return;
      d.moved = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        d.captured = true;
      } catch {}
    }
    const nx = d.startMX + dx;
    tickerMX.jump(nx);  // bypass spring during drag for a 1:1 grab feel
    tickerX.jump(nx);
  }, [tickerMX, tickerX]);

  const onTickerPointerUp = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    if (d.captured) {
      try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); } catch {}
      d.captured = false;
    }
    if (!d.moved) return; // no movement → let the TickerItem click handle it
    justDraggedRef.current = true;
    setTimeout(() => { justDraggedRef.current = false; }, 60);

    const cw = tickerContainerRef.current?.offsetWidth ?? window.innerWidth;
    const prevMod = ((vIdxRef.current % N) + N) % N;
    const targetV = Math.round((cw / 2 - ITEM_W / 2 - tickerMX.get()) / ITEM_W);
    vIdxRef.current = targetV;
    centerTicker(targetV);   // snap: tickerMX moves, tickerX springs to it
    normalizeTicker();
    const mod = ((targetV % N) + N) % N;
    if (mod !== active) {
      const dir = ((mod - prevMod + N) % N) <= N / 2 ? 1 : -1;
      setDir(dir);
      setActive(mod);
      triggerRaccoon(dir);
    }
  }, [tickerMX, centerTicker, normalizeTicker, active, triggerRaccoon]);

  // Auto-advance
  useEffect(() => {
    if (!visible || reducedMotion) return;
    const id = setInterval(() => {
      if (dragRef.current.active) return; // don't fight a live swipe
      vIdxRef.current += 1;
      centerTicker(vIdxRef.current);
      normalizeTicker();   // rebase to the middle copy so the pool never runs out
      setDir(1);
      setActive(p => (p + 1) % N);
      triggerRaccoon(1);
    }, 6000);
    return () => clearInterval(id);
  }, [visible, reducedMotion, triggerRaccoon, centerTicker, normalizeTicker]);

  /* Init ticker position before first paint */
  useLayoutEffect(() => {
    vIdxRef.current = 2 * N + 0;
    const cw = tickerContainerRef.current?.offsetWidth ?? window.innerWidth;
    tickerMX.jump(-(vIdxRef.current * ITEM_W) + cw / 2 - ITEM_W / 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard nav
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (!visible) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, button, a")) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   prev();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [next, prev, visible]);

  // The whole card means one thing — open the case study. No misleading
  // prev/next zones (the arrow buttons below the card handle navigation).
  const handleCardMouseMove = useCallback(() => {
    setCursorMode("view");
  }, []);

  return (
    <>
      {!reducedMotion && <Cursor mode={cursorMode} />}

      <motion.div
        className="mj-stage overflow-hidden md:cursor-none"
        data-theme={theme}
        style={{ position: "relative" }}
        // Background/centre stay rendered so the intro's aperture reveals a real hero;
        // the entrance motion (columns, stack) is gated on `visible` below.
        initial={false}
        animate={{ opacity: 1 }}
      >
        {/* Background layer — sits at z-index 0, behind content */}
        <GridBackground theme={theme} />

        {/* Artifact layer — collectible HUD nodes, z-index 1 */}
        <Artifacts
          onRaccoonSignal={triggerArtifactRaccoon}
          onSpotlightSignal={triggerSpotlightRaccoon}
          onEasterEgg={triggerEasterEgg}
          heroVisible={visible}
          onUnlock={handleArtifactsUnlock}
        />

        {/* Content layer — explicitly above the grid */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>

        {/* ── Nav ── */}
        <nav
          className="min-h-11 shrink-0 grid grid-cols-[auto_1fr] md:grid-cols-3 items-center gap-3 px-4 py-2 md:px-8 md:py-0"
          style={{ borderBottom: `1px solid ${theme === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.14)"}` }}
          onMouseEnter={() => setCursorMode("default")}
        >
          <div className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase"
            style={{ color: theme === "light" ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.65)" }}>
            <span>India</span>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <span style={{ color: theme === "light" ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.28)" }}>//</span>
            <Clock />
          </div>
          <div className="flex justify-start md:justify-center">
            <motion.img
              src="/logo%20mj.svg"
              alt="MJ"
              style={{ height: 22, width: "auto", opacity: 0.65 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-[10px] tracking-[0.25em] uppercase">
            {[
              ...(certUnlocked ? [{ label: "Reward", onClick: () => setCertOpen(true), href: undefined }] : []),
              { label: "About", onClick: () => go("/about"), href: undefined },
              { label: "Resume", onClick: undefined, href: "https://drive.google.com/file/d/1YRxY_9YcVx3SqbN-la49XKdes4CCp1xh/view?usp=sharing" },
              { label: "Contact", onClick: () => setContactOpen(true), href: undefined },
            ].map(({ label, onClick, href }) => {
              const Tag = onClick ? "button" : "a";
              return (
                <Tag
                  key={label}
                  {...(onClick ? { onClick } : { href, target: label === "Resume" ? "_blank" : undefined, rel: label === "Resume" ? "noopener noreferrer" : undefined })}
                  className="inline-flex items-center min-h-[44px] px-1 transition-colors duration-300 uppercase tracking-[0.25em] text-[10px]"
                  style={{ color: theme === "light" ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.72)" }}
                >
                  <ScribbleUnderline
                    color="#c0392b"
                    strokeWidth={1.6}
                    offsetY={2}
                    underlineOnly
                  >
                    {label}
                  </ScribbleUnderline>
                </Tag>
              );
            })}
          </div>
        </nav>

        {/* ── Main content — 3 columns ── */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:min-h-0">

          {/* ── Mobile/tablet hero — leads with positioning, work scrolls below (lg:hidden) ── */}
          <motion.div
            className="lg:hidden px-6 pt-10 pb-4 text-center shrink-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 12 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1
              className="font-bebas uppercase leading-[0.92] tracking-wide"
              style={{
                fontSize: "clamp(40px, 12vw, 72px)",
                color: theme === "light" ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.92)",
              }}
            >
              Product Designer<br />Who Builds.
            </h1>
            <p
              className="mx-auto mt-4 max-w-[34ch] text-[14px] leading-relaxed"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.55)" }}
            >
              Currently at <span style={{ color: "#c0392b" }}>Tempo</span> (YC&nbsp;S23). Zero to one, repeatedly.
            </p>
            <div
              className="mt-7 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.3em]"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)" }}
            >
              <span>Selected work</span>
              <motion.span
                aria-hidden
                className="inline-flex"
                animate={reducedMotion ? {} : { y: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDown className="h-3 w-3" />
              </motion.span>
            </div>
          </motion.div>

          {/* ── LEFT column ── */}
          <motion.div
            className="hidden lg:flex w-[200px] shrink-0 flex-col justify-center px-8"
            style={{ borderRight: `1px solid ${theme === "light" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.05)"}` }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-bebas text-[28px] leading-[1.05] tracking-wider uppercase"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)" }}>
              Product Designer<br />
              Who Builds.
            </h1>
            <Divider delay={0.3} theme={theme} />
            <p className="text-[9px] uppercase tracking-[0.2em] leading-[2.2]"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.5)" }}>
              Zero to one,<br />
              repeatedly.
            </p>
          </motion.div>

          {/* ── CENTER ── */}
          <div className="flex-1 flex min-h-[520px] flex-col items-center justify-center relative min-w-0 px-4 py-6 lg:px-0 lg:py-0">

            {/* Tag + year */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`tag-${active}`}
                className="text-[10px] tracking-[0.4em] uppercase mb-4 text-center"
                style={{ color: theme === "light" ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.45)" }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: SLIDE_EASE }}
              >
                {cur.tag}&nbsp;&nbsp;·&nbsp;&nbsp;{cur.year}
              </motion.p>
            </AnimatePresence>

            {/* Project name */}
            <div className="overflow-hidden mb-5">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`name-${active}`}
                  className="font-bebas tracking-wider leading-none text-center"
                  style={{ fontSize: "clamp(34px, 6.5vw, 96px)", color: theme === "light" ? "rgba(0,0,0,0.94)" : "rgba(255,255,255,0.96)" }}
                  initial={{ y: dir > 0 ? "65%" : "-65%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: dir > 0 ? "-65%" : "65%" }}
                  transition={{ duration: 0.34, ease: SLIDE_EASE }}
                >
                  {cur.name}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* ── Stacked card deck ── */}
            <div
              className="relative"
              style={{ width: "min(480px, 82vw)", aspectRatio: "16 / 10" }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={() => { setCursorMode("default"); setCardHover(false); }}
              onMouseEnter={() => setCardHover(true)}
            >
              {/* Raccoon mascot — peeks over the card top edge.
                  The mask lives on this PLAIN wrapper, kept separate from the animated
                  transforms below: a mask on an element that also animates `transform` does
                  not reliably clip in some browsers. The wrapper's bottom sits 44px onto the
                  card, so cutting the bottom 44px hides the body below the card's top edge —
                  the raccoon reads as tucked behind the card. */}
              <div
                className="absolute pointer-events-none select-none"
                style={{
                  bottom: "calc(100% - 10px)",
                  right: "-8px",
                  zIndex: 20,
                  WebkitMaskImage: "linear-gradient(to bottom, #000 calc(100% - 10px), transparent calc(100% - 10px))",
                  maskImage: "linear-gradient(to bottom, #000 calc(100% - 10px), transparent calc(100% - 10px))",
                }}
              >
              {/* Outer: horizontal nudge + flip — separate from vertical so they don't conflict */}
              <motion.div
                animate={{
                  transform: `translateX(${raccoonFrame === 3 ? raccoonDir * 14 : 0}px) scaleX(${raccoonDir === -1 ? -1 : 1})`,
                }}
                transition={{
                  transform: raccoonFrame === 3
                    ? { duration: 0.13, ease: [0.22, 1, 0.36, 1] }
                    : { duration: 0.24, ease: [0.77, 0, 0.175, 1] },
                }}
              >
                {/* Inner: vertical bob + special-pose lift — own transition, no conflict */}
                <motion.div
                  style={{ position: "relative" }}
                  animate={{
                    transform: `translateY(${
                      raccoonFrame === "handsup" ? -2 :
                      raccoonFrame === "hi" ? -22 :
                      raccoonFrame === 2 ? -2 : 0
                    }px)`,
                  }}
                  transition={{
                    transform: (raccoonFrame === "handsup" || raccoonFrame === "hi")
                      ? { type: "spring", duration: 0.38, bounce: 0.18 }
                      : { duration: 0.12, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  {/* Walk frames: single persistent <img>, src just swaps — no mount/unmount, no ghosting */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/racoon ${typeof raccoonFrame === "number" ? raccoonFrame : 1}.webp`}
                    alt=""
                    style={{
                      width: "clamp(140px, 18vw, 220px)",
                      height: "auto",
                      display: "block",
                      visibility: typeof raccoonFrame === "number" ? "visible" : "hidden",
                    }}
                  />

                  {/* Special poses (hi / handsup) pop in over the walk frame */}
                  <AnimatePresence>
                    {(raccoonFrame === "hi" || raccoonFrame === "handsup") && (
                      <motion.img
                        key={raccoonFrame}
                        src={raccoonFrame === "hi" ? "/racoon hi.webp" : "/racoon handsup.webp"}
                        alt=""
                        initial={{ y: -10, opacity: 0, scale: 0.92 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -6, opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", duration: 0.38, bounce: 0.32 }}
                        style={{
                          position: "absolute",
                          // Bottom-anchored (not inset:0) so the taller hi/handsup
                          // frames raise their arms UPWARD instead of pushing the
                          // body down past the walk frame onto the card.
                          left: 0,
                          bottom: 0,
                          width: "clamp(140px, 18vw, 220px)",
                          height: "auto",
                          display: "block",
                        }}
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              </div>
              {/* Next card (active + 1) — the single peek the front slides away to reveal */}
              <motion.div
                className="absolute inset-0 rounded-[6px] overflow-hidden"
                animate={{
                  x: visible ? (cardHover ? 18 : 12) : 0,
                  y: visible ? (cardHover ? 22 : 16) : 0,
                  rotate: visible ? (cardHover ? 2.4 : 1.6) : 0,
                  scale: visible ? (cardHover ? 0.9 : 0.92) : 0.945,
                  opacity: visible ? (cardHover ? 0.88 : 0.78) : 0,
                }}
                transition={SPRING}
                style={{ background: midProj.bg, zIndex: 2, border: "1px solid rgba(255,255,255,0.05)" }}
              >
                {midProj.heroImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={encodeURI(midProj.heroImage)} alt="" aria-hidden
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ objectFit: "cover" }} />
                )}
              </motion.div>

              {/* Front card — lifts on hover */}
              <AnimatePresence mode="wait" custom={dir}>
                <motion.button
                  type="button"
                  aria-label={`View ${cur.name} project${cur.externalUrl ? " (opens in new tab)" : ""}`}
                  onClick={() => openProject(cur)}
                  key={`card-${active}`}
                  className="absolute inset-0 rounded-[6px] overflow-hidden border border-white/[0.07] text-left"
                  style={{
                    background: cur.bg,
                    zIndex: 3,
                  }}
                  custom={dir}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  initial={((d: number) => ({ x: d * 64, opacity: 0, scale: 0.97, y: 0 })) as any}
                  animate={{
                    x: artifactTouch && !reducedMotion ? [0, -3, 2, 0] : 0,
                    opacity: 1,
                    y: cardHover && cursorMode === "view" ? -8 : 0,
                    rotate: artifactTouch && !reducedMotion ? [0, -1.4, 0.7, 0] : 0,
                  }}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  exit={((d: number) => ({ x: d * -64, opacity: 0 })) as any}
                  transition={cardHover && cursorMode === "view"
                    ? SPRING
                    : { duration: 0.44, ease: SLIDE_EASE }
                  }
                >
                  {/* Hero image — sits below all overlays */}
                  {cur.heroImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={encodeURI(cur.heroImage)}
                      alt=""
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      style={{ objectFit: "cover", zIndex: 0 }}
                    />
                  )}

                  {/* Lottie animation — sits below all overlays */}
                  {cur.heroAnimation && (
                    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
                      <LottieHero src={cur.heroAnimation} />
                    </div>
                  )}

                  {/* Noise */}
                  <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize: "120px" }}
                  />
                  {/* Top edge highlight */}
                  <div className="absolute top-0 inset-x-0 h-px bg-white/12 pointer-events-none" />
                  {/* Bottom scrim */}
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%)" }}
                  />

                  {/* View case study affordance — brightens on hover */}
                  <div
                    className="absolute left-4 bottom-3.5 z-[4] flex items-center gap-1.5 pointer-events-none"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: cursorMode === "view" ? "#fff" : "rgba(255,255,255,0.9)",
                      transition: "color 0.2s ease",
                    }}
                  >
                    <span>{cur.externalUrl ? "Visit site" : "View case study"}</span>
                    {cur.externalUrl
                      ? <ArrowUpRight className="w-3 h-3" strokeWidth={1.6} />
                      : <ArrowRight className="w-3 h-3" strokeWidth={1.6} />}
                  </div>

                  {/* Pixel hover overlay */}
                  <AnimatePresence>
                    {cursorMode === "view" && (
                      <PixelHover key={`px-${active}`} accent={cur.accent} src={cur.heroImage} />
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {easterEggActive && (
                      <RickRollAscii active={easterEggActive} reducedMotion={Boolean(reducedMotion)} />
                    )}
                  </AnimatePresence>
                </motion.button>
              </AnimatePresence>
            </div>

            {/* Description */}
            <div className="mt-4 h-8 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`desc-${active}`}
                  className="text-[13px] md:text-[12px] tracking-wide text-center"
                  style={{ maxWidth: "min(440px, 84vw)", color: theme === "light" ? "rgba(0,0,0,0.72)" : "rgba(255,255,255,0.72)" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, delay: 0.08 }}
                >
                  {cur.description}
                </motion.p>
              </AnimatePresence>
            </div>

          </div>

          {/* ── RIGHT column ── */}
          <motion.div
            className="hidden lg:flex w-[200px] shrink-0 flex-col justify-center px-8 text-right"
            style={{ borderLeft: `1px solid ${theme === "light" ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.05)"}` }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : 20 }}
            transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.a
              href="https://www.tempo.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bebas text-[28px] leading-[1.05] tracking-wider uppercase block relative"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.85)", textDecoration: "none" }}
              whileHover={{ color: theme === "light" ? "rgba(0,0,0,1)" : "rgba(255,255,255,1)" }}
              transition={{ duration: 0.2 }}
            >
              {/* Hover highlight bar */}
              <motion.span
                className="absolute inset-0 rounded-[3px] pointer-events-none"
                style={{ background: theme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)", originX: 1 }}
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
              <ScribbleUnderline color="#c0392b" strokeWidth={1.6} offsetY={2}>
                Currently
                <br />at <span style={{ color: "#c0392b" }}>Tempo.</span>
                <br />YC S23.
              </ScribbleUnderline>
            </motion.a>
            <Divider delay={0.32} right theme={theme} />
            <p className="text-[9px] uppercase tracking-[0.2em] leading-[2.2] text-right"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.70)" : "rgba(255,255,255,0.5)" }}>
              5+ Products<br />
              Shipped<br />
              Taste First
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] leading-[2.2] mt-3 text-right"
              style={{ color: theme === "light" ? "rgba(0,0,0,0.60)" : "rgba(255,255,255,0.4)" }}>
              Ships Fast
            </p>
          </motion.div>

        </div>

        {/* ── Centered endless ticker ── */}
        <div
          ref={tickerContainerRef}
          className="shrink-0 overflow-hidden relative select-none"
          style={{ height: 88, minHeight: 88, borderTop: `1px dashed ${theme === "light" ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.14)"}`, touchAction: "pan-y", cursor: "grab" }}
          onMouseEnter={() => setCursorMode("default")}
          onPointerDown={onTickerPointerDown}
          onPointerMove={onTickerPointerMove}
          onPointerUp={onTickerPointerUp}
          onPointerCancel={onTickerPointerUp}
        >
          {/* Edge fades */}
          <div className="absolute inset-y-0 left-0 w-24 pointer-events-none z-10"
            style={{ background: `linear-gradient(to right, ${theme === "light" ? "rgba(240,236,228,0.95)" : "rgba(0,0,0,0.85)"}, transparent)` }} />
          <div className="absolute inset-y-0 right-0 w-24 pointer-events-none z-10"
            style={{ background: `linear-gradient(to left, ${theme === "light" ? "rgba(240,236,228,0.95)" : "rgba(0,0,0,0.85)"}, transparent)` }} />

          <motion.div
            className="flex items-stretch h-full"
            style={{ x: tickerX, position: "absolute", top: 0, left: 0, willChange: "transform" }}
          >
            {tickerItems.map((p, idx) => (
              <TickerItem
                key={idx}
                p={p}
                isActive={p.id === cur.id}
                theme={theme}
                itemW={ITEM_W}
                onPick={() => {
                  // Ignore the click that fires at the end of a drag.
                  if (justDraggedRef.current) return;
                  // Already centred → enter the case study. Otherwise focus it.
                  if (p.id === cur.id) openProject(p);
                  else pickDirect(projects.indexOf(p));
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* ── Footer bar ── */}
        <div
          className="min-h-9 shrink-0 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 py-2 md:grid md:grid-cols-3 md:items-center md:px-8 md:py-0"
          style={{ borderTop: `1px solid ${theme === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)"}` }}
        >
          {/* Left: copyright + crafted-with */}
          <div className="flex items-center gap-3 text-[8px] tracking-[0.2em] uppercase md:justify-self-start"
            style={{ color: theme === "light" ? "rgba(0,0,0,0.68)" : "rgba(255,255,255,0.62)" }}>
            <span>© 2026 Melvin Joshy</span>
            <span aria-hidden style={{ color: theme === "light" ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.22)" }}>·</span>
            <span style={{ color: theme === "light" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.50)" }}>
              Crafted with{" "}
              <span style={{ color: "#c0392b", fontFamily: "var(--font-mono)", letterSpacing: 0, textTransform: "none" }}>:&gt;</span>
            </span>
          </div>

          {/* Center: carousel prev/next — bare icons, dead-centered. Also the only step controls on touch. */}
          <div className="flex items-center justify-center gap-5 md:justify-self-center" onMouseEnter={() => setCursorMode("default")}>
            {([
              { label: "Previous project", onClick: prev, Icon: ArrowLeft },
              { label: "Next project", onClick: next, Icon: ArrowRight },
            ] as const).map(({ label, onClick, Icon }) => (
              <motion.button
                key={label}
                type="button"
                onClick={onClick}
                aria-label={label}
                className="inline-flex items-center justify-center p-1.5"
                style={{ color: theme === "light" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)" }}
                whileHover={{ scale: 1.18, color: "#c0392b" }}
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.15 }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.6} />
              </motion.button>
            ))}
          </div>

          {/* Right: email */}
          <motion.a
            href="mailto:melvinjoshy5@gmail.com"
            className="text-[8px] tracking-[0.2em] uppercase transition-colors duration-300 md:justify-self-end"
            style={{ color: theme === "light" ? "rgba(0,0,0,0.68)" : "rgba(255,255,255,0.62)" }}
            onMouseEnter={() => setCursorMode("view")}
            onMouseLeave={() => setCursorMode("default")}
          >
            <ScribbleUnderline color="#c0392b" strokeWidth={1.6} offsetY={2}>
              melvinjoshy5@gmail.com
            </ScribbleUnderline>
          </motion.a>
        </div>

        </div>{/* end content layer */}
      </motion.div>

      {/* Contact card overlay */}
      <ContactCard open={contactOpen} onClose={() => setContactOpen(false)} />
      <CertificateCard open={certOpen} onClose={() => setCertOpen(false)} />
    </>
  );
}
