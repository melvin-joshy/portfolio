"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────
   Two layout types:
   "under"  → SVG sits below text (viewBox 0 0 100 14)
   "wrap"   → SVG surrounds text  (viewBox 0 0 100 100, inset padding)
───────────────────────────────────────────────────────────────── */
type ScribbleDef = {
  d: string;
  type: "under" | "wrap";
};

const SCRIBBLES: ScribbleDef[] = [

  /* ══════════ UNDERLINES ══════════ */

  // bumpy wave
  { type: "under", d: "M 0,8 C 7,3 14,12 22,7 C 30,2 38,12 46,7 C 54,2 62,12 70,7 C 78,2 86,12 94,7 L 100,7" },
  // jagged zigzag
  { type: "under", d: "M 0,5 L 9,12 L 18,4 L 28,12 L 36,3 L 46,12 L 54,5 L 63,12 L 72,3 L 82,12 L 90,5 L 100,9" },
  // double scratch, uneven
  { type: "under", d: "M 0,6 C 18,3 38,9 58,5 C 78,2 92,8 100,6 M 2,11 C 24,8 52,13 80,9 L 100,11" },
  // scrappy backtrack
  { type: "under", d: "M 0,8 L 18,6 L 14,11 L 38,7 L 33,12 L 62,6 L 57,11 L 82,7 L 78,12 L 100,8" },
  // tight micro spring
  { type: "under", d: "M 0,7 C 4,2 8,12 12,7 C 16,2 20,12 24,7 C 28,2 32,12 36,7 C 40,2 44,12 48,7 C 52,2 56,12 60,7 C 64,2 68,12 72,7 C 76,2 80,12 84,7 C 88,2 92,12 96,7 L 100,7" },
  // dramatic arch
  { type: "under", d: "M 0,12 Q 50,0 100,12" },
  // seismograph burst
  { type: "under", d: "M 0,9 L 18,8 L 20,2 L 22,13 L 24,1 L 26,12 L 28,5 L 30,10 L 45,8 L 47,1 L 49,13 L 51,2 L 53,11 L 55,5 L 57,9 L 78,8 L 100,9" },
  // stacked three lines
  { type: "under", d: "M 0,4 L 100,5 M 0,8 L 100,7 M 0,12 L 100,11" },
  // arrow →
  { type: "under", d: "M 0,8 L 90,8 L 84,3 M 90,8 L 84,13" },
  // micro corrugated
  { type: "under", d: "M 0,8 Q 3,3 6,8 Q 9,13 12,8 Q 15,3 18,8 Q 21,13 24,8 Q 27,3 30,8 Q 33,13 36,8 Q 39,3 42,8 Q 45,13 48,8 Q 51,3 54,8 Q 57,13 60,8 Q 63,3 66,8 Q 69,13 72,8 Q 75,3 78,8 Q 81,13 84,8 Q 87,3 90,8 Q 93,13 96,8 L 100,8" },
  // lightning
  { type: "under", d: "M 0,5 L 22,5 L 17,9 L 42,9 L 36,13 L 68,9 L 62,5 L 82,5 L 76,9 L 100,9" },
  // reverse loop chain
  { type: "under", d: "M 100,8 C 92,2 84,13 76,8 S 60,2 52,8 S 36,13 28,8 S 12,2 4,8 L 0,8" },
  // lazy S underscore
  { type: "under", d: "M 0,11 C 30,2 70,14 100,5" },
  // needle spike row
  { type: "under", d: "M 0,8 L 5,4 L 10,8 L 15,3 L 20,8 L 25,4 L 30,8 L 35,3 L 40,8 L 45,4 L 50,8 L 55,3 L 60,8 L 65,4 L 70,8 L 75,3 L 80,8 L 85,4 L 90,8 L 95,3 L 100,8" },

  /* ══════════ WRAPS (viewBox 0 0 100 100) ══════════ */

  // single wobbly oval
  {
    type: "wrap",
    d: "M 6,50 C 7,19 22,9 50,8 C 78,7 94,19 95,48 C 96,77 82,91 52,92 C 22,93 5,78 6,50",
  },
  // double-loop oval (like the reference photo)
  {
    type: "wrap",
    d: "M 5,52 C 6,20 22,10 50,9 C 78,8 95,21 96,50 C 97,78 82,92 52,93 C 22,94 4,79 5,52 M 9,48 C 10,24 26,15 52,14 C 78,13 94,25 95,48 C 96,70 80,84 55,85 C 29,86 8,72 9,48",
  },
  // triple messy oval (main reference image)
  {
    type: "wrap",
    d: "M 4,50 C 5,16 22,6 50,5 C 78,4 96,17 97,48 C 98,78 83,93 53,94 C 23,95 3,80 4,50 M 8,54 C 9,26 26,16 52,15 C 78,14 95,27 96,52 C 97,74 81,88 56,88 C 30,89 7,74 8,54 M 13,49 C 14,28 28,20 50,19 C 72,18 88,28 89,49 C 90,68 78,81 58,82 C 35,83 12,67 13,49 L 22,38",
  },
  // lasso loop with trailing tail
  {
    type: "wrap",
    d: "M 50,9 C 80,8 95,20 96,48 C 97,76 82,91 52,92 C 22,93 5,77 5,51 C 5,25 21,12 49,9 L 50,9 L 80,32 L 95,20",
  },
  // tight spiral (3 turns)
  {
    type: "wrap",
    d: "M 50,48 C 50,44 54,42 58,44 C 64,48 63,57 55,61 C 46,66 36,57 37,47 C 38,35 48,27 59,28 C 72,28 83,38 83,52 C 83,67 71,79 55,80 C 37,81 22,69 22,53 C 22,35 36,21 53,19 C 73,17 90,30 92,50 C 94,72 80,89 58,91",
  },
  // starburst 12-point
  {
    type: "wrap",
    d: "M 50,50 L 50,4 M 50,50 L 73,10 M 50,50 L 90,27 M 50,50 L 96,50 M 50,50 L 90,73 M 50,50 L 73,90 M 50,50 L 50,96 M 50,50 L 27,90 M 50,50 L 10,73 M 50,50 L 4,50 M 50,50 L 10,27 M 50,50 L 27,10",
  },
  // jagged explosion burst
  {
    type: "wrap",
    d: "M 50,50 L 45,8 L 52,22 L 40,5 M 50,50 L 88,40 L 78,48 L 92,38 M 50,50 L 82,82 L 72,74 L 90,88 M 50,50 L 50,92 L 47,76 L 53,95 M 50,50 L 12,78 L 24,70 L 8,86 M 50,50 L 14,22 L 22,32 L 6,12",
  },
  // concentric ovals (3 rings)
  {
    type: "wrap",
    d: "M 50,42 C 58,42 63,46 63,50 C 63,54 58,58 50,58 C 42,58 37,54 37,50 C 37,46 42,42 50,42 M 50,28 C 66,28 76,38 76,50 C 76,62 66,72 50,72 C 34,72 24,62 24,50 C 24,38 34,28 50,28 M 50,14 C 74,14 88,30 88,50 C 88,70 74,86 50,86 C 26,86 12,70 12,50 C 12,30 26,14 50,14",
  },
  // hashtag / grid
  {
    type: "wrap",
    d: "M 32,8 L 26,92 M 58,6 L 52,90 M 8,32 L 92,28 M 6,60 L 90,56",
  },
  // curly brackets { }
  {
    type: "wrap",
    d: "M 34,12 C 22,12 18,22 18,50 C 18,78 22,88 34,88 M 66,12 C 78,12 82,22 82,50 C 82,78 78,88 66,88",
  },
  // big X cross
  {
    type: "wrap",
    d: "M 8,12 L 92,88 M 92,12 L 8,88",
  },
  // tangled yarn ball
  {
    type: "wrap",
    d: "M 30,50 C 38,18 68,34 58,52 C 48,68 22,56 34,36 C 46,18 72,28 68,50 C 64,72 34,68 36,46 C 38,24 68,20 72,44 C 76,66 48,80 38,60 C 28,40 58,22 72,42 C 86,62 60,84 44,68 C 28,52 40,28 58,32",
  },
  // arrow pointing left ←
  {
    type: "wrap",
    d: "M 92,50 L 8,50 L 22,36 M 8,50 L 22,64 M 35,50 C 52,42 68,58 88,50",
  },
  // crown spikes along top
  {
    type: "wrap",
    d: "M 5,72 L 15,28 L 26,55 L 38,18 L 50,55 L 62,18 L 74,55 L 85,28 L 95,72",
  },
  // figure-8 / infinity loop
  {
    type: "wrap",
    d: "M 50,50 C 50,35 38,25 28,30 C 18,35 16,50 24,58 C 32,66 50,60 50,50 C 50,40 68,34 76,42 C 84,50 82,66 72,70 C 62,74 50,65 50,50",
  },
  // organic blob outline
  {
    type: "wrap",
    d: "M 50,8 C 68,6 84,14 90,28 C 96,42 94,58 86,70 C 78,82 64,90 50,91 C 36,92 20,84 12,72 C 4,60 4,44 12,30 C 20,16 34,10 50,8",
  },
  // chaotic diagonal fill
  {
    type: "wrap",
    d: "M 5,20 L 80,5 M 5,35 L 95,15 M 5,50 L 95,35 M 5,65 L 95,50 M 5,80 L 95,65 M 20,90 L 95,80",
  },
  // broken box / rectangle
  {
    type: "wrap",
    d: "M 10,12 L 40,12 M 60,12 L 90,12 L 90,40 M 90,60 L 90,88 L 55,88 M 35,88 L 10,88 L 10,60 M 10,38 L 10,12",
  },
  // scribble underline with loops above
  {
    type: "wrap",
    d: "M 5,75 C 5,60 20,52 38,55 C 56,58 40,42 55,38 C 70,34 88,46 90,60 C 92,74 80,82 65,82 C 50,82 20,78 5,75 M 5,80 C 20,85 50,88 90,82",
  },
  // parentheses ( )
  {
    type: "wrap",
    d: "M 38,10 C 28,25 24,38 24,50 C 24,62 28,75 38,90 M 62,10 C 72,25 76,38 76,50 C 76,62 72,75 62,90",
  },
];

/* Index pools — "wrap" doodles loop around the word (arcing above it), which can
   poke past a tight container's top edge. `underlineOnly` restricts to the
   below-text squiggles for places like the nav where that arc looks stray. */
const ALL_IDX = SCRIBBLES.map((_, i) => i);
const UNDER_IDX = SCRIBBLES.map((s, i) => (s.type === "under" ? i : -1)).filter((i) => i >= 0);

interface ScribbleUnderlineProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  strokeWidth?: number;
  offsetY?: number;
  /** Restrict to under-text squiggles (no wrap-around doodles). */
  underlineOnly?: boolean;
}

export function ScribbleUnderline({
  children,
  className,
  color = "#c0392b",
  strokeWidth = 1.8,
  offsetY = 3,
  underlineOnly = false,
}: ScribbleUnderlineProps) {
  const pool = underlineOnly ? UNDER_IDX : ALL_IDX;
  const [hovered, setHovered] = useState(false);
  const [idx, setIdx] = useState(() => pool[Math.floor(Math.random() * pool.length)]);
  const lastRef = useRef(idx);

  function handleEnter() {
    let next = pool[Math.floor(Math.random() * pool.length)];
    while (next === lastRef.current && pool.length > 1) next = pool[Math.floor(Math.random() * pool.length)];
    lastRef.current = next;
    setIdx(next);
    setHovered(true);
  }

  const s = SCRIBBLES[idx];

  return (
    <span
      className={`relative inline-block ${className ?? ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: "inherit" }}
    >
      {children}

      {s.type === "under" ? (
        /* underline: sits just below text */
        <span
          className="absolute left-0 right-0 pointer-events-none"
          style={{ bottom: -offsetY, height: 16 }}
        >
          <svg
            viewBox="0 0 100 14"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            <motion.path
              key={idx}
              d={s.d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
              transition={{
                pathLength: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.08 },
              }}
            />
          </svg>
        </span>
      ) : (
        /* wrap: surrounds the text element with padding */
        <span
          className="absolute pointer-events-none"
          style={{ top: -8, bottom: -8, left: -14, right: -14 }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%", overflow: "visible" }}
          >
            <motion.path
              key={idx}
              d={s.d}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth * 0.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
              transition={{
                pathLength: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.08 },
              }}
            />
          </svg>
        </span>
      )}
    </span>
  );
}
