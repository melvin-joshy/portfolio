"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence, useReducedMotion } from "framer-motion";

function RunningLabel({ text }: { text: string }) {
  const chars = text.split("");
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {chars.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.12, delay: i * 0.03, ease: "easeOut" }}
          style={{ display: "inline-block", whiteSpace: "pre" }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
}

export default function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const springX = useSpring(cursorX, { stiffness: 500, damping: 38, mass: 0.4 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 38, mass: 0.4 });

  const [label, setLabel] = useState<string | null>(null);
  const [variant, setVariant] = useState<"default" | "zoom">("default");
  const labelRef = useRef<string | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const syncPointer = () => setHasFinePointer(media.matches);
    syncPointer();
    media.addEventListener("change", syncPointer);
    return () => media.removeEventListener("change", syncPointer);
  }, []);

  useEffect(() => {
    if (reducedMotion || !hasFinePointer) return;
    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const onEnter = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
      if (el) {
        const text = el.dataset.cursor ?? "view →";
        const v = el.dataset.cursorVariant === "zoom" ? "zoom" : "default";
        labelRef.current = text;
        setLabel(text);
        setVariant(v);
      }
    };

    const onLeave = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
      if (el) {
        labelRef.current = null;
        setLabel(null);
        setVariant("default");
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnter, { passive: true });
    document.addEventListener("mouseout", onLeave, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
    };
  }, [cursorX, cursorY, hasFinePointer, reducedMotion]);

  if (reducedMotion || !hasFinePointer) return null;

  return (
    <motion.div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        x: springX,
        y: springY,
        translateX: "-50%",
        translateY: "-50%",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <AnimatePresence>
        {label && (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: variant === "zoom" ? "#1c1410" : "#f5f0e8",
              color: variant === "zoom" ? "#ff3b30" : "#1c2235",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: variant === "zoom" ? "0.22em" : "0.12em",
              textTransform: variant === "zoom" ? "uppercase" : "none",
              padding: "8px 16px",
              borderRadius: "999px",
              whiteSpace: "nowrap",
              boxShadow: variant === "zoom"
                ? "0 4px 20px rgba(255,59,48,0.25)"
                : "0 4px 20px rgba(0,0,0,0.25)",
              userSelect: "none",
            }}
          >
            <RunningLabel text={label} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
