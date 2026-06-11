"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const CARD_BG   = "#e8dfc4";
const DARK      = "#1c2235";
const INK_FAINT = "#2e3650";
const MUTED     = "#7a6a55";
const LINE      = "#c0aa84";
const DIVIDER   = "#a89068";

const NOISE_FINE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`;
const NOISE_COARSE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='320'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.18' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='320' height='320' filter='url(%23n)'/%3E%3C/svg%3E")`;
const NOISE_SCRATCHY = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='6' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)'/%3E%3C/svg%3E")`;

/* Torn-paper edge mask — turbulence displaces a slightly-inset rect so edges look ragged */
const TORN_MASK = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 520'%3E%3Cdefs%3E%3Cfilter id='t' x='-4%25' y='-4%25' width='108%25' height='108%25'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.032 0.038' numOctaves='4' seed='17' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='11' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3C/defs%3E%3Crect x='10' y='10' width='880' height='500' fill='white' filter='url(%23t)'/%3E%3C/svg%3E")`;

function Stamp() {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        position: "absolute", top: 16, left: -48,
        width: 54, height: 54, borderRadius: "50%",
        border: "1.5px solid rgba(28,34,53,0.2)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 3,
        transform: "rotate(-20deg)", pointerEvents: "none",
      }}>
        <p style={{ fontSize: 5, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(28,34,53,0.26)" }}>MJ</p>
        <div style={{ width: "52%", height: 0.75, background: "rgba(28,34,53,0.16)" }} />
        <p style={{ fontSize: 4.5, color: "rgba(28,34,53,0.2)", letterSpacing: "0.1em" }}>2025</p>
      </div>
      <div style={{ filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.28))" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/stamp image.png" alt="Melvin Joshy"
          style={{ width: 160, display: "block", borderRadius: "1px" }} />
      </div>
    </div>
  );
}

function ALine({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingBottom: 8, marginBottom: 1, borderBottom: `1px solid ${LINE}` }}>
      {children}
    </div>
  );
}

export default function PostcardModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="postcard-modal"
          className="fixed inset-0 z-[500] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 cursor-pointer"
            style={{ background: "rgba(0,0,0,0.52)", backdropFilter: "blur(6px) saturate(0.7)" }}
            onClick={onClose}
          />

          {/* Postcard */}
          <motion.div
            style={{
              position: "relative", zIndex: 10, cursor: "default",
              width: "min(900px,93vw)", height: "min(520px,78vh)",
              background: CARD_BG, borderRadius: "2px",
              boxShadow: [
                "0 50px 120px rgba(0,0,0,0.65)",
                "0 0 0 1px rgba(80,55,10,0.22)",
                "inset 0 0 90px rgba(100,70,15,0.12)",
                "inset 0 0 12px rgba(100,70,15,0.24)",
              ].join(", "),
              display: "flex", overflow: "hidden",
              filter: "sepia(0.18) contrast(1.04)",
              /* Torn paper edges — always visible, no interaction needed */
              maskImage: TORN_MASK,
              WebkitMaskImage: TORN_MASK,
              maskSize: "100% 100%",
              WebkitMaskSize: "100% 100%",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
            } as React.CSSProperties}
            initial={{ scale: 0.88, y: 32, rotate: -1.5 }}
            animate={{ scale: 1,   y: 0,  rotate: 0   }}
            transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* ── GRUNGE 1: fine grain ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none",
              opacity: 0.16, mixBlendMode: "multiply",
              backgroundImage: NOISE_FINE, backgroundSize: "180px",
            }} />

            {/* ── GRUNGE 2: coarse turbulence ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none",
              opacity: 0.10, mixBlendMode: "multiply",
              backgroundImage: NOISE_COARSE, backgroundSize: "290px",
            }} />

            {/* ── GRUNGE 3: scratchy overlay ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none",
              opacity: 0.08, mixBlendMode: "overlay",
              backgroundImage: NOISE_SCRATCHY, backgroundSize: "360px",
            }} />

            {/* ── DECAY: deep corner burns ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 24, pointerEvents: "none",
              background: [
                "radial-gradient(ellipse at 0% 0%,   rgba(45,25,5,0.42) 0%, transparent 40%)",
                "radial-gradient(ellipse at 100% 0%,  rgba(45,25,5,0.30) 0%, transparent 36%)",
                "radial-gradient(ellipse at 0% 100%, rgba(45,25,5,0.50) 0%, transparent 42%)",
                "radial-gradient(ellipse at 100% 100%,rgba(45,25,5,0.38) 0%, transparent 38%)",
              ].join(", "),
            }} />

            {/* ── DECAY: edge burn frame ── */}
            <div style={{
              position: "absolute", inset: 0, zIndex: 24, pointerEvents: "none",
              background: [
                "linear-gradient(to right,  rgba(30,15,0,0.22) 0%, transparent 8%)",
                "linear-gradient(to left,   rgba(30,15,0,0.18) 0%, transparent 8%)",
                "linear-gradient(to bottom, rgba(30,15,0,0.20) 0%, transparent 8%)",
                "linear-gradient(to top,    rgba(30,15,0,0.28) 0%, transparent 9%)",
              ].join(", "),
            }} />

            {/* ── DECAY: water-stain blotch ── */}
            <div style={{
              position: "absolute", zIndex: 23, pointerEvents: "none",
              top: "14%", left: "8%", width: "42%", height: "50%",
              background: "radial-gradient(ellipse, rgba(160,110,30,0.07) 0%, rgba(140,90,20,0.04) 40%, transparent 70%)",
              transform: "rotate(-14deg)",
            }} />

            {/* ── DECAY: horizontal crease ── */}
            <div style={{
              position: "absolute", zIndex: 23, pointerEvents: "none",
              top: "52%", left: 0, right: 0, height: "1px",
              background: "linear-gradient(to right, transparent 4%, rgba(80,50,10,0.12) 18%, rgba(80,50,10,0.08) 50%, rgba(80,50,10,0.14) 80%, transparent 96%)",
            }} />

            {/* ── Paper noise base ── */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.07, pointerEvents: "none", zIndex: 22,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.88' numOctaves='4'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "140px",
            }} />

            {/* ── Close button ── */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 12, right: 14, zIndex: 30,
                background: "rgba(28,34,53,0.10)", border: "1px solid rgba(28,34,53,0.18)",
                borderRadius: "50%", width: 44, height: 44,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: MUTED, fontSize: 14, lineHeight: 1,
                transition: "background 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(28,34,53,0.18)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(28,34,53,0.10)")}
              aria-label="Close"
            >
              ×
            </button>

            {/* ── LEFT — story ── */}
            <div style={{
              width: "50%",
              borderRight: `2px solid ${DIVIDER}`,
              padding: "36px 32px 30px 36px",
              display: "flex", flexDirection: "column",
              overflow: "hidden", background: "transparent",
            }}>
              <div style={{ fontFamily: "var(--font-caveat)", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 19, lineHeight: 1.72, color: DARK }}>
                  I work on product design at Tempo, a YC-backed platform where designers
                  and developers build together using AI.
                </p>
                <p style={{ fontSize: 19, lineHeight: 1.72, color: INK_FAINT }}>
                  I like to build things for real people — think deeply about how an interface
                  looks, feels, and behaves. Then I actually build it.
                </p>
                <p style={{ fontSize: 19, lineHeight: 1.72, color: INK_FAINT }}>
                  Previously, I&apos;ve designed for Ontra, Mary&apos;s Land Farm, CrewsLink, and other startups
                  across mobility, hospitality, and aviation.
                </p>
                <p style={{ fontSize: 19, lineHeight: 1.72, color: INK_FAINT }}>
                  On the side, I built Clarity — a voice-first app I use every day to organise
                  my thoughts. And Frame Studio, because I needed a better way to show my work.
                </p>
              </div>
              <p style={{
                fontFamily: "var(--font-caveat)", fontSize: 20, lineHeight: 1.5,
                color: DARK, flexShrink: 0, marginTop: 8,
              }}>
                Let&apos;s build something.<br />— Melvin
              </p>
            </div>

            {/* ── RIGHT — stamp + address ── */}
            <div style={{
              flex: 1, padding: "22px 28px 24px 36px",
              display: "flex", flexDirection: "column",
            }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                <Stamp />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 7 }}>
                <ALine>
                  <p style={{ fontFamily: "var(--font-bebas)", fontSize: 30, letterSpacing: "0.06em", color: DARK, lineHeight: 1 }}>
                    Melvin Joshy
                  </p>
                </ALine>
                <ALine>
                  <p style={{ fontSize: 10.5, letterSpacing: "0.18em", textTransform: "uppercase", color: MUTED }}>
                    Product Designer · Founding Level
                  </p>
                </ALine>
                <ALine>
                  <p style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED }}>
                    Tempo · YC S23 · Clarity · Frame Studio
                  </p>
                </ALine>
                <ALine>
                  <a href="mailto:melvinjoshy5@gmail.com"
                    style={{ fontSize: 10.5, letterSpacing: "0.12em", color: DARK, textDecoration: "none" }}>
                    melvinjoshy5@gmail.com
                  </a>
                </ALine>
                <ALine>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block", flexShrink: 0 }} />
                    <p style={{ fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: MUTED }}>
                      Available for select projects
                    </p>
                  </div>
                </ALine>
                <ALine>
                  <a href="https://www.linkedin.com/in/melvinjoshy"
                    target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 10.5, letterSpacing: "0.15em", textTransform: "uppercase", color: MUTED, textDecoration: "none" }}>
                    LinkedIn →
                  </a>
                </ALine>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
