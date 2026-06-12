"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, type Variants } from "framer-motion";

/* Content stagger — rows populate after the card lands */
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: 0.38 + i * 0.055, duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  }),
};

type Props = { open: boolean; onClose: () => void };

export default function ContactCard({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[800] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          /* Backdrop ready 60ms before card arrives */
          transition={{ duration: 0.18, ease: "easeOut" }}
          onClick={onClose}
          style={{ background: "rgba(4,4,6,0.82)", backdropFilter: "blur(14px)" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            /* Enter: spring flip — card placed onto table from above with slight dual-axis rotation */
            initial={{ y: 80, rotateX: 28, rotateY: -6, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, rotateX: 0, rotateY: 0, opacity: 1, scale: 1 }}
            /* Exit: snap away fast — asymmetric, 3× faster than enter */
            exit={{ y: 40, rotateX: 12, opacity: 0, scale: 0.94,
              transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
            transition={{
              type: "spring",
              duration: 0.62,
              bounce: 0.18,   /* subtle landing bounce — like a card hitting a surface */
            }}
            style={{ perspective: 1200 }}
          >
            <Card />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── GlareCard implementation (React Bits pattern) ─── */
function Card() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  /* Tilt springs */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springCfg = { stiffness: 200, damping: 30 };
  const springX = useSpring(mx, springCfg);
  const springY = useSpring(my, springCfg);
  const rotateX = useTransform(springY, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-12, 12]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width;
    const ny = (e.clientY - r.top) / r.height;
    mx.set(nx - 0.5);
    my.set(ny - 0.5);
    /* Glare follows exact cursor — React Bits style */
    setGlarePos({ x: nx * 100, y: ny * 100 });
  }, [mx, my]);

  const handleMouseLeave = useCallback(() => {
    mx.set(0); my.set(0);
    setIsHovered(false);
    setGlarePos({ x: 50, y: 50 });
  }, [mx, my]);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);

  return (
    /* ── Outer wrapper: tilt + overflow visible so raccoon hangs off edge ── */
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        rotateX, rotateY,
        transformStyle: "preserve-3d",
        position: "relative",
        width: "min(520px, 92vw)",
        aspectRatio: "85.6 / 53.98",
        cursor: "default",
        willChange: "transform",
      }}
    >
      {/* ── Card shell: clipped backgrounds + border ── */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: 18,
        overflow: "hidden",
        background: "linear-gradient(135deg, #1e1a1a 0%, #3a1a1a 18%, #2e1212 36%, #1a1218 52%, #2a1010 68%, #3c1414 82%, #150a0a 100%)",
        boxShadow: "0 40px 100px -16px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.09), inset 0 1px 0 rgba(255,255,255,0.12)",
      }}>
        {/* Red glow blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 55% at 15% 80%, rgba(180,20,20,0.45) 0%, transparent 70%), radial-gradient(ellipse 45% 40% at 85% 20%, rgba(150,15,15,0.3) 0%, transparent 65%)" }} />
        {/* Brushed-metal lines */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 3px)" }} />
        {/* Glare */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${isHovered ? 0.22 : 0}) 0%, rgba(255,255,255,0.06) 30%, transparent 65%)`, transition: isHovered ? "background 0.05s" : "background 0.4s", mixBlendMode: "overlay" }} />
        {/* Rainbow foil */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: `linear-gradient(${105 + glarePos.x * 0.6}deg, rgba(255,100,100,0) 0%, rgba(130,210,255,${isHovered ? 0.08 : 0.03}) 20%, rgba(180,130,255,${isHovered ? 0.10 : 0.04}) 40%, rgba(255,200,100,${isHovered ? 0.08 : 0.03}) 60%, rgba(100,255,180,${isHovered ? 0.07 : 0.02}) 80%, rgba(255,100,100,0) 100%)`, transition: "background 0.15s", mixBlendMode: "screen" }} />
        {/* Edge glint */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 35%, transparent 65%, rgba(255,255,255,0.04) 100%)" }} />
      </div>

      {/* ── Raccoon — bottom-right, half off card ── */}
      <motion.img
        src="/racoon%20for%20contact%20card.webp"
        alt=""
        aria-hidden
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 0.55, bounce: 0.25, delay: 0.55 }}
        style={{
          position: "absolute",
          bottom: "-22%",
          right: "-4%",
          width: "48%",
          height: "auto",
          zIndex: 20,
          pointerEvents: "none",
          userSelect: "none",
          /* Edged: dark shadow + red rim light from below */
          filter: "drop-shadow(0 -6px 24px rgba(180,20,20,0.5)) drop-shadow(0 12px 32px rgba(0,0,0,0.85))",
          /* Subtle desaturate to blend with dark card palette */
          mixBlendMode: "normal",
        }}
      />

      {/* ── Card content — sits above shell, below raccoon ── */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        padding: "6% 8%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}>

        {/* Top row — stagger 0 */}
        <motion.div
          variants={rowVariants} initial="hidden" animate="show" custom={0}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <div>
            <p style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 9, letterSpacing: "0.32em",
              color: "rgba(255,255,255,0.75)",
              textTransform: "uppercase", lineHeight: 1, margin: 0,
            }}>
              Product Designer
            </p>
            <p style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: 7.5, letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.45)",
              textTransform: "uppercase", margin: "4px 0 0",
            }}>
              ID · 2023–Present
            </p>
          </div>
          <Chip />
        </motion.div>

        {/* Name — stagger 1 */}
        <motion.div
          variants={rowVariants} initial="hidden" animate="show" custom={1}
          style={{ lineHeight: 1 }}
        >
          <p style={{
            fontFamily: "var(--font-bebas, 'Bebas Neue', sans-serif)",
            fontSize: "clamp(32px, 8vw, 48px)",
            letterSpacing: "0.07em",
            color: "rgba(255,255,255,0.97)",
            margin: 0, lineHeight: 0.9,
            textShadow: "0 2px 20px rgba(0,0,0,0.6)",
          }}>
            MELVIN JOSHY
          </p>
        </motion.div>

        {/* Contact links — stagger 2, 3, 4 individually */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {([
            { icon: <EmailIcon />, label: "melvinjoshy5@gmail.com", href: "mailto:melvinjoshy5@gmail.com" },
            { icon: <LinkedInIcon />, label: "linkedin.com/in/melvin-joshy", href: "https://www.linkedin.com/in/melvin-joshy/" },
            { icon: <XIcon />, label: "@Mel_on_adee", href: "https://x.com/Mel_on_adee" },
          ] as const).map((row, i) => (
            <motion.div key={row.href} variants={rowVariants} initial="hidden" animate="show" custom={2 + i}>
              <ContactRow icon={row.icon} label={row.label} href={row.href} />
            </motion.div>
          ))}
        </div>

        {/* Bottom row — stagger 5 */}
        <motion.div
          variants={rowVariants} initial="hidden" animate="show" custom={5}
          style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-end" }}
        >
          <Barcode />
        </motion.div>
      </div>
    </motion.div>
  );
}

function ContactRow({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        textDecoration: "none",
        cursor: "pointer",
        pointerEvents: "all",
      }}
    >
      <span style={{
        color: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.65)",
        display: "flex", flexShrink: 0,
        transition: "color 0.18s",
      }}>
        {icon}
      </span>
      <span style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 10, letterSpacing: "0.1em",
        color: hovered ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.82)",
        transition: "color 0.18s",
        textDecoration: hovered ? "underline" : "none",
        textUnderlineOffset: 3,
        textDecorationColor: "rgba(255,255,255,0.3)",
      }}>
        {label}
      </span>
    </a>
  );
}

function Chip() {
  return (
    <div style={{
      width: 52, height: 40, borderRadius: 7, flexShrink: 0,
      background: "linear-gradient(135deg, #b89040 0%, #f0d880 22%, #d4a830 48%, #c09040 66%, #e8cc68 82%, #a87820 100%)",
      boxShadow: "0 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.2)",
      position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Subtle grid lines behind initials */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)",
        backgroundSize: "8px 8px",
      }} />
      {/* Contact notch lines (top/bottom) */}
      <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 1, background: "rgba(0,0,0,0.25)" }} />
      <div style={{ position: "absolute", bottom: 0, left: "20%", right: "20%", height: 1, background: "rgba(0,0,0,0.25)" }} />
      {/* MJ logo */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo%20mj.svg"
        alt="MJ"
        style={{
          position: "relative", zIndex: 1,
          height: 20, width: "auto",
          filter: "brightness(0) sepia(1) saturate(0.6) brightness(0.35)",
          userSelect: "none", pointerEvents: "none",
        }}
      />
    </div>
  );
}

function Barcode() {
  const bars = [3,1,2,1,4,1,2,3,1,2,1,3,2,1,4,1,2,1,3,1,1,2,3,1,2,1,3,2];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 1.5 }}>
        {bars.map((w, i) => (
          <div key={i} style={{
            width: w,
            height: i % 7 === 0 ? 22 : 15,
            background: "rgba(255,255,255,0.22)",
            borderRadius: 0.5,
          }} />
        ))}
      </div>
      <p style={{
        fontFamily: "var(--font-mono, monospace)",
        fontSize: 6.5, letterSpacing: "0.2em",
        color: "rgba(255,255,255,0.25)",
        textAlign: "center", margin: 0,
      }}>
        MJ · 0001
      </p>
    </div>
  );
}

function EmailIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
