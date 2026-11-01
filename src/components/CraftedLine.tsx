"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* Footer sign-off that talks to whoever is dilly-dallying around the site.
   Types itself out like a terminal, holds, backspaces, types the next one.
   Click to skip ahead. Inherits size, tracking and colour from where it's placed. */

const minutesHere = (since: number) => Math.floor((Date.now() - since) / 60000);

const LINES: ((since: number) => string | null)[] = [
  () => "Dilly-dallying? Same",
  () => "Click things. Nothing breaks. Probably",
  (s) => (minutesHere(s) >= 1 ? `${minutesHere(s)} min of dilly-dallying. Respect` : null),
  () => "Still reading the footer? You'd make a great QA",
  () => "The bug icon says don't click. Your call",
  () => "Too many frames named final_final",
  () => "The raccoon is watching. Supportively",
  (s) => (minutesHere(s) >= 2 ? "Okay, you're officially a curious one" : null),
  () => "Built on chai, curiosity and Cmd+Z",
  () => "Pushed pixel by pixel. Some pushed back",
  () => "Works on my machine",
  () => "Hand-crafted. Over-iterated",
];

const TYPE_MS = 38;
const DELETE_MS = 16;
const HOLD_MS = 6500;

export default function CraftedLine() {
  const reducedMotion = useReducedMotion();
  const since = useRef(0);
  const idx = useRef(0);
  const [target, setTarget] = useState("");
  const [shown, setShown] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");

  const pickNext = () => {
    for (let tries = 0; tries < LINES.length; tries++) {
      idx.current = (idx.current + 1) % LINES.length;
      const line = LINES[idx.current](since.current);
      if (line) return line;
    }
    return "Dilly-dallying? Same";
  };

  // Start somewhere random after mount (keeps SSR markup deterministic)
  useEffect(() => {
    since.current = Date.now();
    idx.current = Math.floor(Math.random() * LINES.length) - 1;
    const first = pickNext();
    setTarget(first);
    if (reducedMotion) { setShown(first); setPhase("holding"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!target) return;
    let id: ReturnType<typeof setTimeout>;
    if (reducedMotion) {
      // no typing: swap whole lines on a slow timer
      id = setTimeout(() => { const n = pickNext(); setTarget(n); setShown(n); }, HOLD_MS + 3000);
    } else if (phase === "typing") {
      id = shown.length < target.length
        ? setTimeout(() => setShown(target.slice(0, shown.length + 1)), TYPE_MS)
        : setTimeout(() => setPhase("holding"), 0);
    } else if (phase === "holding") {
      id = setTimeout(() => setPhase("deleting"), HOLD_MS);
    } else {
      id = shown.length > 0
        ? setTimeout(() => setShown(shown.slice(0, -1)), DELETE_MS)
        : setTimeout(() => { setTarget(pickNext()); setPhase("typing"); }, 350);
    }
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, phase, target, reducedMotion]);

  const skip = () => {
    if (reducedMotion) { const n = pickNext(); setTarget(n); setShown(n); return; }
    setPhase("deleting");
  };

  return (
    <button
      type="button"
      onClick={skip}
      title="Click for another"
      aria-label="Show another footer line"
      className="inline text-left"
      style={{ font: "inherit", letterSpacing: "inherit", textTransform: "inherit", color: "inherit", background: "none", border: 0, padding: 0, cursor: "pointer" }}
    >
      <span aria-hidden>{shown}</span>
      <span className="sr-only">{target}</span>
      {/* Terminal caret: solid while typing, blinks while idle */}
      <span aria-hidden className={phase === "holding" ? "mj-caret-blink" : undefined} style={{ display: "inline-block", width: "0.55em", height: "1em", marginLeft: 2, background: "currentColor", opacity: 0.7, transform: "translateY(0.12em)" }} />
      <span aria-hidden style={{ color: "#c0392b", fontFamily: "var(--font-mono)", letterSpacing: 0, textTransform: "none", marginLeft: "0.6em" }}>:&gt;</span>
    </button>
  );
}
