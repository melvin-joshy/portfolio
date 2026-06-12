"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { useRouteTransition } from "@/components/RouteTransition";
import { ScribbleUnderline } from "@/components/ScribbleUnderline";
import ContactCard from "@/components/ContactCard";

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

const EASE  = [0.22, 1, 0.36, 1] as const;
const CREAM = "#ede7d8";
const LINE  = "1px solid rgba(255,255,255,0.07)";
const INK   = "#0a0a0a";

/* ─── Eyebrow label — scannable at a glance ─── */
function Eyebrow({ label, hovered }: { label: string; hovered: boolean }) {
  return (
    <p style={{
      fontFamily: "var(--font-mono)",
      fontSize: 9,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      lineHeight: 1,
      marginBottom: 12,
      color: hovered ? "rgba(0,0,0,0.40)" : "rgba(255,255,255,0.30)",
      transition: "color 0.28s ease",
    }}>
      {label}
    </p>
  );
}

export default function AboutPage() {
  const go = useRouteTransition();
  const [contactOpen, setContactOpen] = useState(false);
  const [stampVisible, setStampVisible] = useState(false);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 500, damping: 35 });
  const springY = useSpring(rawY, { stiffness: 500, damping: 35 });
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  /* Shared card text style — serif, mixed-case, readable */
  const cardText = (card: string) => ({
    fontSize: 15,
    letterSpacing: "0.01em",
    lineHeight: 1.75,
    fontFamily: "var(--font-serif)" as const,
    fontWeight: 300,
    color: hoveredCard === card ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.82)",
    transition: "color 0.28s ease",
  });

  const cardBg = (card: string) => ({
    backgroundColor: hoveredCard === card ? "#eeeeee" : "transparent",
    transition: "background-color 0.28s ease",
  });

  return (
    <div className="about-page" style={{ background: CREAM, fontFamily: "var(--font-inter)" }}>
      <style>{`
        @media (max-width: 1023px) {
          .about-hero {
            position: relative !important;
            height: auto !important;
            min-height: 100svh !important;
          }

          .about-nav {
            grid-template-columns: auto 1fr !important;
            padding: 0 16px !important;
          }

          .about-nav > div:last-child {
            gap: 16px !important;
          }

          .about-grid {
            display: block !important;
          }

          .about-grid > div {
            padding-top: 0 !important;
          }

          .about-card {
            display: block !important;
            min-height: auto !important;
            padding: 96px 20px 36px !important;
          }

          .about-card div {
            max-width: none !important;
            text-align: left !important;
          }

          .about-card p {
            font-size: 14px !important;
            text-align: left !important;
          }

          .about-card-image {
            position: relative !important;
            left: auto !important;
            right: auto !important;
            top: auto !important;
            transform: none !important;
            width: min(220px, 60vw) !important;
            margin-bottom: 24px !important;
          }
        }
      `}</style>

      {/* ══════════════════════════════════════
          PART 1 — sticky cream hero
         ══════════════════════════════════════ */}
      <div className="about-hero" style={{
        position: "sticky", top: 0, height: "88vh", zIndex: 1,
        background: CREAM, overflow: "hidden",
        display: "flex", flexDirection: "column",
      }}>
        {/* Nav */}
        <div className="about-nav" style={{
          minHeight: 44, flexShrink: 0,
          display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center",
          gap: 12, padding: "8px 32px",
          borderBottom: "1px solid rgba(0,0,0,0.14)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase",
            color: "rgba(0,0,0,0.72)",
          }}>
            <span>India</span>
            {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
            <span style={{ color: "rgba(0,0,0,0.35)" }}>//</span>
            <Clock />
          </div>
          <button
            onClick={() => go("/")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <svg
              width="35"
              height="22"
              viewBox="0 0 461 394"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="MJ"
              style={{ height: 22, width: "auto", opacity: 0.85 }}
            >
              <g>
                <path d="M156.115 371.954C156.115 289.967 155.258 123.214 224.676 123.214C275.351 123.214 287.435 211.336 290.266 291.356" stroke="rgba(0,0,0,0.85)" strokeWidth="22.3586" strokeLinecap="round" />
                <path d="M425.31 8.62598C436.21 8.62598 444.863 19.2395 449.24 31.2168C452.89 41.2075 448.085 52.9918 438.183 56.877C434.11 58.4748 429.604 58.9326 421.705 58.9326C405.777 58.9326 396.47 54.9019 396.47 38.4375C396.47 21.9732 409.382 8.62623 425.31 8.62598ZM428.88 31.1279C427.386 26.4182 421.402 24.114 415.515 25.9814C409.628 27.8491 406.066 33.1817 407.56 37.8916C409.054 42.6014 419.055 48.3234 424.943 46.4561C430.83 44.5884 430.374 35.8378 428.88 31.1279Z" fill="rgba(0,0,0,0.85)" />
                <path d="M290.267 286.23C294.607 353.672 319.354 374.748 361.9 374.748C415.083 374.748 421.594 311.521 423.765 283.42C425.235 264.406 423.765 164.927 423.765 117.624" stroke="#EF2626" strokeWidth="22.3586" />
                <path d="M19.169 374.748C19.169 291.84 18.2996 123.214 88.7191 123.214C159.139 123.214 156.096 290.435 156.096 374.748" stroke="rgba(0,0,0,0.85)" strokeWidth="22.3586" strokeLinecap="square" />
              </g>
            </svg>
          </button>
          <div style={{ display: "flex", gap: 20, justifyContent: "flex-end" }}>
            {[
              { label: "Work", onClick: () => go("/"), href: undefined as string | undefined },
              { label: "Resume", onClick: undefined, href: "https://drive.google.com/file/d/1YRxY_9YcVx3SqbN-la49XKdes4CCp1xh/view?usp=sharing" },
              { label: "Contact", onClick: () => setContactOpen(true), href: undefined },
            ].map(({ label, onClick, href }) => {
              const commonStyle = {
                fontSize: 10, letterSpacing: "0.25em", textTransform: "uppercase" as const,
                color: "rgba(0,0,0,0.72)", textDecoration: "none", background: "none", border: "none",
                cursor: "pointer",
                // ≥44px touch target for mobile a11y
                display: "inline-flex", alignItems: "center", minHeight: 44, padding: "0 4px",
              };
              const inner = (
                <ScribbleUnderline color="#c0392b" strokeWidth={1.6} offsetY={2}>
                  {label}
                </ScribbleUnderline>
              );
              return onClick ? (
                <button key={label} onClick={onClick} style={commonStyle}>{inner}</button>
              ) : (
                <a
                  key={label}
                  href={href}
                  target={label === "Resume" ? "_blank" : undefined}
                  rel={label === "Resume" ? "noopener noreferrer" : undefined}
                  style={commonStyle}
                >{inner}</a>
              );
            })}
          </div>
        </div>

        {/* Hero — centered */}
        <div
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 48px" }}
          onMouseMove={(e) => { rawX.set(e.clientX + 20); rawY.set(e.clientY - 140); }}
        >
          <div style={{ textAlign: "center", width: "100%" }}>
            <motion.h1
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(44px, 6.5vw, 100px)",
                lineHeight: 0.92, letterSpacing: "0.01em",
                color: "rgba(0,0,0,0.87)", marginBottom: 28,
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              ONCE UPON A TIME,<br />
              I WAS BUILDING STRUCTURES.<br />
              NOW, I&apos;M BUILDING<br />
              DIGITAL EXPERIENCES.
            </motion.h1>
            <motion.p
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(14px, 1.5vw, 20px)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                lineHeight: 1.5,
                color: "rgba(0,0,0,0.42)",
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
            >
              Melvin — your friendly neighbourhood{" "}
              <em
                style={{ color: "#c0392b", fontStyle: "normal", cursor: "default" }}
                onMouseEnter={() => setStampVisible(true)}
                onMouseLeave={() => setStampVisible(false)}
              >
                product designer
              </em>{" "}
              who actually ships :)
            </motion.p>
          </div>
        </div>

        {/* Floating stamp on hover */}
        <AnimatePresence>
          {stampVisible && (
            <motion.div
              style={{
                position: "fixed",
                top: 0, left: 0,
                x: springX, y: springY,
                pointerEvents: "none",
                zIndex: 200,
              }}
              initial={{ opacity: 0, scale: 0.92, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 0.92, rotate: -8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/stamp image.png"
                alt="Melvin Joshy"
                style={{ width: 180, height: "auto", display: "block", filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.22))" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ══════════════════════════════════════
          PART 2 — dark section scales in on scroll
         ══════════════════════════════════════ */}
      <motion.div
        initial={{ scale: 0.88 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: false, amount: 0.08 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative", zIndex: 2,
          background: INK,
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
          transformOrigin: "top center",
        }}
      >

        {/* ── 2-column: central dashed line, text near center, images at outer edges ── */}
        <div className="about-grid" style={{ display: "flex", position: "relative", zIndex: 1, borderBottom: LINE }}>

          {/* Central dashed vertical line */}
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 1, borderLeft: "1px dashed rgba(255,255,255,0.14)",
            pointerEvents: "none", zIndex: 2,
          }} />

          {/* LEFT column */}
          <div style={{ flex: 1, position: "relative" }}>

            {/* Academic Journey */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("academic")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 440, padding: "80px 64px 80px 320px",
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                ...cardBg("academic"),
              }}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/graduation.webp" alt="" className="about-card-image" style={{
                position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "academic" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
              <div style={{ textAlign: "right", maxWidth: 380 }}>
                <Eyebrow label="Background" hovered={hoveredCard === "academic"} />
                <p style={cardText("academic")}>
                  Swapped my ruler for a degree. B.Arch from the College of Engineering, Trivandrum — five years of learning to think in systems before I ever touched a screen.
                </p>
              </div>
            </motion.div>

            {/* Design */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("design")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 440, padding: "80px 64px 80px 320px",
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                ...cardBg("design"),
              }}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/4 patterbs.webp" alt="" className="about-card-image" style={{
                position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "design" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
              <div style={{ textAlign: "right", maxWidth: 380 }}>
                <Eyebrow label="Philosophy" hovered={hoveredCard === "design"} />
                <p style={cardText("design")}>
                  Finding the pattern underneath the problem — then making something people feel rather than just use. That&apos;s been the constant across everything I&apos;ve shipped.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT column — staggered: starts 140px lower */}
          <div style={{ flex: 1, position: "relative", paddingTop: 140 }}>

            {/* Currently / Opportunities */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("opportunities")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 440, padding: "80px 320px 80px 64px",
                display: "flex", alignItems: "center",
                ...cardBg("opportunities"),
              }}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE }}
            >
              <div style={{ maxWidth: 380 }}>
                <Eyebrow label="Currently" hovered={hoveredCard === "opportunities"} />
                <p style={cardText("opportunities")}>
                  Two years in, five products shipped — transit tech, deal sourcing, AI tooling. Now looking for the next great problem. Something with real users, real stakes, and room to build right.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/racoon 1.webp" alt="" className="about-card-image" style={{
                position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "opportunities" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
            </motion.div>

            {/* Soundtracks */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("soundtracks")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 440, padding: "80px 320px 80px 64px",
                display: "flex", alignItems: "center",
                ...cardBg("soundtracks"),
              }}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            >
              <div style={{ maxWidth: 380 }}>
                <Eyebrow label="Soundtrack" hovered={hoveredCard === "soundtracks"} />
                <p style={cardText("soundtracks")}>
                  Music is the background to everything. Nodding along to catchy beats, lost in rhythm and melody — it&apos;s where the best ideas arrive uninvited.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/racoon 2.webp" alt="" className="about-card-image" style={{
                position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "soundtracks" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
            </motion.div>
          </div>
        </div>

        {/* ── Lower grid ── */}
        <div className="about-grid" style={{ display: "flex", position: "relative", zIndex: 1 }}>

          {/* Central dashed vertical line */}
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 1, borderLeft: "1px dashed rgba(255,255,255,0.14)",
            pointerEvents: "none", zIndex: 2,
          }} />

          {/* LEFT column */}
          <div style={{ flex: 1, position: "relative" }}>

            {/* Screen Time */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("screentime")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 420, padding: "80px 64px 80px 320px",
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                ...cardBg("screentime"),
              }}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/racoon 3.webp" alt="" className="about-card-image" style={{
                position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "screentime" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
              <div style={{ textAlign: "right", maxWidth: 380 }}>
                <Eyebrow label="Watch List" hovered={hoveredCard === "screentime"} />
                <p style={cardText("screentime")}>
                  Sci-fi, thrillers, anime, Studio Ghibli. Anything that pulls me into a world built with as much intention as the ones I try to build at work.
                </p>
              </div>
            </motion.div>

            {/* Beyond the Table */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("beyondtable")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 420, padding: "80px 64px 80px 320px",
                display: "flex", alignItems: "center", justifyContent: "flex-end",
                ...cardBg("beyondtable"),
              }}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE, delay: 0.1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/2 tt.webp" alt="" className="about-card-image" style={{
                position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "beyondtable" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
              <div style={{ textAlign: "right", maxWidth: 380 }}>
                <Eyebrow label="Outside Work" hovered={hoveredCard === "beyondtable"} />
                <p style={cardText("beyondtable")}>
                  Table tennis. Not a metaphor — actually playing. Champion in the making, one serve at a time.
                </p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT column — staggered 140px lower */}
          <div style={{ flex: 1, position: "relative", paddingTop: 140 }}>

            {/* Tea Time */}
            <motion.div
              className="about-card"
              onMouseEnter={() => setHoveredCard("teatime")}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative", minHeight: 420, padding: "80px 320px 80px 64px",
                display: "flex", alignItems: "center",
                ...cardBg("teatime"),
              }}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.65, ease: EASE }}
            >
              <div style={{ maxWidth: 380 }}>
                <Eyebrow label="Ritual" hovered={hoveredCard === "teatime"} />
                <p style={cardText("teatime")}>
                  A proper cup of tea is the unit of time everything else gets measured against. Always on the hunt for the next perfect brew.
                </p>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/3-chai.webp" alt="" className="about-card-image" style={{
                position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
                width: 260, height: "auto", display: "block",
                filter: hoveredCard === "teatime" ? "none" : "invert(1)",
                transition: "filter 0.28s ease",
              }} />
            </motion.div>

            {/* Footer */}
            <div style={{ minHeight: 420, padding: "80px 64px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <p style={{ fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", marginBottom: 8 }}>© 2025 Melvin Joshy</p>
              <p style={{ fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.22)", marginBottom: 8 }}>Designed &amp; built from scratch</p>
              <a href="mailto:melvinjoshy5@gmail.com" style={{ fontSize: 8, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.38)", textDecoration: "none" }}>
                melvinjoshy5@gmail.com
              </a>
            </div>
          </div>
        </div>

      </motion.div>

      <ContactCard open={contactOpen} onClose={() => setContactOpen(false)} />
    </div>
  );
}
