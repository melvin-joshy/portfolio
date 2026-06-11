"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type AspectKey = "16/9" | "16/10" | "4/3" | "3/4" | "1/1";

export function WireBox({
  aspect = "16/9",
  label,
  hint,
  className = "",
}: {
  aspect?: AspectKey;
  label: string;
  hint?: string;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden rounded-sm ${className}`}
      style={{
        aspectRatio: aspect,
        border: "1px dashed rgba(255,255,255,0.18)",
        background:
          "repeating-linear-gradient(135deg, rgba(255,255,255,0.018) 0 14px, rgba(255,255,255,0) 14px 28px)",
      }}
    >
      {/* Diagonals */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.10)" strokeWidth="0.4" />
      </svg>
      <p className="relative text-[11px] tracking-[0.3em] uppercase text-white/55">{label}</p>
      {hint && (
        <p
          className="relative mt-2 text-[15px] text-white/45"
          style={{ fontFamily: "var(--font-caveat)" }}
        >
          {hint}
        </p>
      )}
    </motion.div>
  );
}

export function WireText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => {
        const w = i === lines - 1 ? "62%" : i % 2 === 0 ? "100%" : "92%";
        return (
          <div
            key={i}
            className="h-3 rounded-sm"
            style={{
              width: w,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
            }}
          />
        );
      })}
    </div>
  );
}

export function WireNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-3 text-[14px] text-white/45"
      style={{ fontFamily: "var(--font-caveat)" }}
    >
      <span style={{ fontFamily: "var(--font-mono)", marginRight: 8, color: "rgba(255,255,255,0.3)" }}>
        →
      </span>
      {children}
    </p>
  );
}
