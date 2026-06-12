"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Props {
  onRevealStart: () => void; // hole begins opening — fire the hero's entrance now
  onComplete: () => void;    // intro fully done — unmount
}

/* ─────────────── Fill pool for the flicker grid ─────────────── */

/* Outer tiles rotate through these intro images */
const OUTER_PHOTOS = [
  "/intro 1.webp",
  "/intro 2.webp",
  "/intro 3.webp",
  "/intro 4.webp",
  "/intro 6.webp",
  "/intro 9.webp",
  "/intro 10.webp",
  "/intro 11.webp",
  "/intro 12.webp",
  "/ontra-cover.webp",
  "/Crewslink -Cover.webp",
  "/Clarity cover.webp",
  "/Framestudio cover.webp",
].map(encodeURI);

/* Center tile uses its own dedicated set; always settles on center 3 */
const CENTER_PHOTOS = [
  "/intro center 1.webp",
  "/intro center 2.webp",
  "/intro center 3.webp",
  "/intro center 4.webp",
].map(encodeURI);

const OUTER_POOL = OUTER_PHOTOS;
const CENTER_POOL = CENTER_PHOTOS;

const CENTER_FINAL = encodeURI("/intro center 3.webp");

function preloadPool() {
  [...OUTER_PHOTOS, ...CENTER_PHOTOS].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}
function pickFill(exclude: string, pool: string[]) {
  let next = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (next === exclude && guard++ < 6) next = pool[Math.floor(Math.random() * pool.length)];
  return next;
}

type Phase = "logo" | "grid" | "settle" | "collapse" | "red" | "reveal";

/* Strong custom easings (the built-in CSS ones lack punch) */
const EASE_IN_OUT = [0.76, 0, 0.24, 1] as const; // on-screen movement / morph
const EASE_OUT = [0.16, 1, 0.3, 1] as const;      // entrances / reveals
const CENTER = 4; // middle cell of a 3×3 grid
const RED = "#c0392b";        // brand red — logo J
const REVEAL_RED = "#79291f"; // deep, matte oxblood for the full-screen reveal wash

/* The centre aperture starts small (4:3, never squished) and becomes the hole */
const HOLE_W = "min(17vmin, 152px)";
const HOLE_H = "calc(min(17vmin, 152px) * 0.75)";

/* ─────────────── A single flickering grid tile ─────────────── */

function GridTile({ index, phase }: { index: number; phase: Phase }) {
  const isCenter = index === CENTER;
  const pool = isCenter ? CENTER_POOL : OUTER_POOL;
  const [img, setImg] = useState(() => pool[(index * 3) % pool.length]);
  const lastRef = useRef(img);

  // Flicker only during the live grid; freeze (settle) and beyond.
  useEffect(() => {
    if (phase !== "grid") {
      if (isCenter) setImg(CENTER_FINAL);
      return;
    }
    const swap = () => {
      const next = pickFill(lastRef.current, pool);
      lastRef.current = next;
      setImg(next);
    };
    const period = 600;
    let interval = 0;
    const start = window.setTimeout(() => {
      swap();
      interval = window.setInterval(swap, period);
    }, (index % 9) * 140);
    return () => { clearTimeout(start); clearInterval(interval); };
  // pool is derived from isCenter (stable), safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, isCenter]);

  // Grid is intact through 'grid' and 'settle'; it breaks apart from 'collapse'.
  const handedOff = phase === "collapse" || phase === "red" || phase === "reveal";
  const leaving = handedOff; // outer tiles leave once we collapse

  if (isCenter) {
    // Centre hands off to the standalone aperture (shared layoutId) once collapsing.
    if (handedOff) return <div style={{ aspectRatio: "4 / 3" }} />;
    return (
      <motion.div
        layoutId="center-window"
        className="relative overflow-hidden rounded-[2px]"
        style={{ aspectRatio: "4 / 3", background: "#0a0a0a", zIndex: 5 }}
      >
        <TileFill fill={img} onFail={() => setImg(pickFill(img, CENTER_POOL))} />
        <div className="absolute inset-0 bg-black/10" />
      </motion.div>
    );
  }

  // Outer tiles vanish from below: the top stays fixed while the height
  // collapses to 0 (a top-pinned clip wipe — no sliding, no squish).
  const row = Math.floor(index / 3); // 0 top → 2 bottom
  return (
    <motion.div
      className="relative overflow-hidden rounded-[2px]"
      style={{ aspectRatio: "4 / 3", background: "#0a0a0a" }}
      initial={{ opacity: 0, scale: 0.6, clipPath: "inset(0% 0% 0% 0%)" }}
      animate={
        leaving
          ? { opacity: 1, scale: 1, clipPath: "inset(0% 0% 100% 0%)" }
          : { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" }
      }
      transition={
        leaving
          ? { duration: 0.6, ease: EASE_IN_OUT, delay: (2 - row) * 0.08 }
          : { duration: 0.45, ease: EASE_OUT, delay: 0.03 * index }
      }
    >
      <TileFill fill={img} onFail={() => setImg(pickFill(img, OUTER_POOL))} />
      <div className="absolute inset-0 bg-black/10" />
    </motion.div>
  );
}

function TileFill({ fill, onFail }: { fill: string; onFail: () => void }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fill}
      alt=""
      draggable={false}
      onError={onFail}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
      }}
    />
  );
}

/* ─────────────── Logo: greyscale path-trace, then colour fills up ─────────────── */

const GREY = "#6f6f6f";
const STROKES = [
  "M19.169 374.748C19.169 291.84 18.2996 123.214 88.7191 123.214C159.139 123.214 156.096 290.435 156.096 374.748",
  "M156.115 371.954C156.115 289.967 155.258 123.214 224.676 123.214C275.351 123.214 287.435 211.336 290.266 291.356",
  "M290.267 286.23C294.607 353.672 319.354 374.748 361.9 374.748C415.083 374.748 421.594 311.521 423.765 283.42C425.235 264.406 423.765 164.927 423.765 117.624",
];
const DOT =
  "M425.31 8.62598C436.21 8.62598 444.863 19.2395 449.24 31.2168C452.89 41.2075 448.085 52.9918 438.183 56.877C434.11 58.4748 429.604 58.9326 421.705 58.9326C405.777 58.9326 396.47 54.9019 396.47 38.4375C396.47 21.9732 409.382 8.62623 425.31 8.62598ZM428.88 31.1279C427.386 26.4182 421.402 24.114 415.515 25.9814C409.628 27.8491 406.066 33.1817 407.56 37.8916C409.054 42.6014 419.055 48.3234 424.943 46.4561C430.83 44.5884 430.374 35.8378 428.88 31.1279Z";

function LogoMark({ phase }: { phase: Phase }) {
  const visible = phase === "logo";
  return (
    <motion.div
      className="absolute inset-0 z-30 flex items-center justify-center"
      style={{ paddingBottom: "7vmin" }} // nudge up so the low-mass logo reads as centred
      animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.9 }}
      transition={{ duration: 0.5, ease: EASE_IN_OUT }}
    >
      <svg
        viewBox="0 0 461 394"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "min(13.5vmin, 92px)", height: "auto", display: "block" }}
      >
        <defs>
          <clipPath id="mj-fill">
            <motion.rect
              x="0"
              width="461"
              fill="white"
              initial={{ y: 394, height: 0 }}
              animate={{ y: 0, height: 394 }}
              transition={{ duration: 0.85, ease: EASE_OUT, delay: 1.25 }}
            />
          </clipPath>
        </defs>

        {/* 1) Greyscale path-trace */}
        <g>
          {STROKES.map((d, i) => (
            <motion.path
              key={i}
              d={d}
              stroke={GREY}
              strokeWidth="22.3586"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 0.65, ease: EASE_OUT, delay: 0.1 + i * 0.2 },
                opacity: { duration: 0.15, delay: 0.1 + i * 0.2 },
              }}
            />
          ))}
          <motion.path
            d={DOT}
            fill={GREY}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: 1.0 }}
            style={{ transformOrigin: "423px 33px" }}
          />
        </g>

        {/* 2) Colour fills up over the grey */}
        <g clipPath="url(#mj-fill)">
          {STROKES.map((d, i) => (
            <path
              key={i}
              d={d}
              stroke={i === 2 ? RED : "#ffffff"}
              strokeWidth="22.3586"
              strokeLinecap="round"
              fill="none"
            />
          ))}
          <path d={DOT} fill="#ffffff" />
        </g>
      </svg>
    </motion.div>
  );
}

/* ─────────────── Intro ─────────────── */

export default function Intro({ onRevealStart, onComplete }: Props) {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("logo");
  const calledRef = useRef(false);
  const revealedRef = useRef(false);

  const cbRef = useRef({ onRevealStart, onComplete });
  useEffect(() => { cbRef.current = { onRevealStart, onComplete }; });

  const startReveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    cbRef.current.onRevealStart();
  }, []);

  const finish = useCallback(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    startReveal();
    cbRef.current.onComplete();
  }, [startReveal]);

  useEffect(() => { preloadPool(); }, []);

  useEffect(() => {
    if (reducedMotion) {
      startReveal();
      const t = setTimeout(finish, 700);
      return () => clearTimeout(t);
    }
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setPhase("grid"), 2500));     // logo done
    timers.push(window.setTimeout(() => setPhase("settle"), 5200));   // flicker → freeze
    timers.push(window.setTimeout(() => setPhase("collapse"), 5900)); // hold, then break apart
    timers.push(window.setTimeout(() => setPhase("red"), 6700));      // red closes in
    timers.push(window.setTimeout(() => setPhase("reveal"), 7300));   // hole scales open
    // Fire the hero's entrance AS the hole starts opening, so the cards fan out and
    // side text ease in together with the reveal — no dead gap before the deck moves.
    timers.push(window.setTimeout(startReveal, 7400));
    // Unmount the intro shortly after the hole is open enough to read the hero, so full
    // interactivity (clicking a card) returns ~1s sooner instead of waiting out the tail.
    timers.push(window.setTimeout(finish, 8100));
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion, finish, startReveal]);

  const showGrid = !reducedMotion && phase !== "logo";
  const apertureLive = !reducedMotion && (phase === "collapse" || phase === "red" || phase === "reveal");
  const redLive = phase === "red" || phase === "reveal";
  const opening = phase === "reveal";

  return (
    <div
      className="fixed inset-0 z-[500] overflow-hidden"
      style={{
        ["--hw" as string]: HOLE_W,
        ["--hh" as string]: HOLE_H,
        // Once the hole starts opening, let clicks fall through to the revealed hero.
        pointerEvents: opening ? "none" : "auto",
      }}
    >
      {/* Black backdrop — fades as the red hole-mask takes over so the hole sees through */}
      <motion.div
        className="absolute inset-0 z-[10] bg-black"
        animate={{ opacity: redLive ? 0 : 1 }}
        transition={{ duration: 0.4, ease: EASE_IN_OUT }}
      />

      {!reducedMotion && <LogoMark phase={phase} />}

      {/* Flicker grid */}
      {showGrid && (
        <motion.div
          className="absolute inset-0 z-[20] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "clamp(12px, 2.2vmin, 28px)",
              width: "min(72vmin, 620px)",
            }}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <GridTile key={i} index={i} phase={phase} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Red hole-mask — a centred rect whose huge box-shadow paints everything red.
          Scaling it up grows the transparent hole, pushing the red off-screen to
          reveal the live hero behind the whole intro. */}
      {redLive && (
        <div className="absolute inset-0 z-[58] flex items-center justify-center pointer-events-none">
          <motion.div
            style={{
              width: "var(--hw)",
              height: "var(--hh)",
              borderRadius: 6,
              // Feathered edge so the red dissolves into the hero instead of a hard line
              boxShadow: `0 0 18px 100vmax ${REVEAL_RED}`,
            }}
            initial={{ scale: 1, opacity: 0 }}
            animate={opening ? { scale: 36, opacity: 1 } : { scale: 1, opacity: 1 }}
            transition={
              opening
                ? { duration: 0.7, ease: EASE_IN_OUT }
                : { opacity: { duration: 0.3, ease: EASE_IN_OUT } }
            }
          />
        </div>
      )}

      {/* Centre aperture — the image rectangle. Morphs in from the grid cell (scaling
          smaller as the others fall away), sits inside the hole, then blurs out so the
          hero shows through the same rectangle as the hole opens. */}
      {apertureLive && (
        <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
          <motion.div
            layoutId="center-window"
            className="relative overflow-hidden rounded-[2px]"
            style={{ width: "var(--hw)", height: "var(--hh)", background: "#0a0a0a" }}
            animate={{ opacity: opening ? 0 : 1, filter: opening ? "blur(6px)" : "blur(0px)" }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CENTER_FINAL} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/10" />
          </motion.div>
        </div>
      )}

      {/* Skip affordance — removed once the reveal begins so it can't eat clicks */}
      {!opening && (
        <button
          type="button"
          aria-label="Skip intro"
          className="absolute inset-0 z-[70] cursor-pointer"
          onClick={finish}
        />
      )}
      <motion.div
        className="pointer-events-none absolute bottom-8 left-1/2 z-[80] -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: redLive ? 0 : 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
      >
        <span className="text-[9px] uppercase tracking-[0.4em] text-white/30">
          tap anywhere to skip
        </span>
      </motion.div>
    </div>
  );
}
