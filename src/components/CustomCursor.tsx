"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const [hasFinePointer, setHasFinePointer] = useState(false);
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);

  const springX = useSpring(cursorX, { stiffness: 500, damping: 38, mass: 0.4 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 38, mass: 0.4 });

  const [label, setLabel] = useState<string | null>(null);
  const labelRef = useRef<string | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)");
    const syncPointer = () => setHasFinePointer(media.matches);
    syncPointer();
    media.addEventListener("change", syncPointer);
    return () => media.removeEventListener("change", syncPointer);
  }, []);

  // Clear any lingering label on route change — when a link navigates, the hovered
  // element unmounts before `mouseout` fires, so the label would otherwise stick.
  useEffect(() => {
    labelRef.current = null;
    setLabel(null);
  }, [pathname]);

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
        labelRef.current = text;
        setLabel(text);
      }
    };

    const onLeave = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest("[data-cursor]") as HTMLElement | null;
      if (el) {
        labelRef.current = null;
        setLabel(null);
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
            initial={{ opacity: 0, scale: 0.72 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.72 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{
              /* Bare red handwritten scrawl — matches the hero's cursor style */
              fontFamily: "var(--font-caveat)",
              fontSize: "24px",
              color: "#c0392b",
              lineHeight: 1,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
              userSelect: "none",
              textShadow: "0 1px 8px rgba(0,0,0,0.45)",
            }}
          >
            <RunningLabel text={label.toLowerCase()} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
