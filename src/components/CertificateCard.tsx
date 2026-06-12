"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ScribbleUnderline } from "@/components/ScribbleUnderline";
import { BRAND } from "@/lib/brand";

const RED = BRAND.red;
const REWARD = "/reward.webp";

type Props = { open: boolean; onClose: () => void };

export default function CertificateCard({ open, onClose }: Props) {
  const [name, setName] = useState("A Curious Human");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  /* lock scroll + ESC */
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", fn); document.body.style.overflow = prev; };
  }, [open, onClose]);

  /* tilt + holographic shift */
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const sx = useSpring(mx, { stiffness: 150, damping: 20 });
  const sy = useSpring(my, { stiffness: 150, damping: 20 });
  const rotateY = useTransform(sx, [0, 1], [-13, 13]);
  const rotateX = useTransform(sy, [0, 1], [11, -11]);
  const foilAngle = useTransform(sx, [0, 1], [60, 220]);
  const foilBg = useTransform(
    foilAngle,
    a => `linear-gradient(${a}deg,
      rgba(255,120,130,0.0) 8%,
      rgba(255,120,140,0.5) 24%,
      rgba(255,170,150,0.42) 42%,
      rgba(255,205,150,0.46) 60%,
      rgba(210,140,190,0.4) 78%,
      rgba(255,120,130,0.0) 94%)`
  );
  const glareX = useTransform(sx, [0, 1], ["18%", "82%"]);
  const glareY = useTransform(sy, [0, 1], ["12%", "78%"]);
  const glareBg = useTransform([glareX, glareY], ([x, y]) =>
    `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.12) 18%, transparent 45%)`
  );

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }, [mx, my]);
  const onLeave = useCallback(() => { mx.set(0.5); my.set(0.5); }, [mx, my]);

  /* ── Canvas export — draws a faithful certificate and downloads a PNG ── */
  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const W = 1080, H = 1500, S = 2;
      const cv = document.createElement("canvas");
      cv.width = W * S; cv.height = H * S;
      const ctx = cv.getContext("2d");
      if (!ctx) return;
      ctx.scale(S, S);

      const rr = (x: number, y: number, w: number, h: number, r: number) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
      };

      // base
      const base = ctx.createLinearGradient(0, 0, W, H);
      base.addColorStop(0, "#241015");
      base.addColorStop(0.4, "#3a1320");
      base.addColorStop(0.7, "#1b0f1c");
      base.addColorStop(1, "#120a10");
      ctx.fillStyle = base; ctx.fillRect(0, 0, W, H);

      // holographic diagonal sheen
      const foil = ctx.createLinearGradient(0, 0, W, H);
      foil.addColorStop(0.10, "rgba(255,90,120,0.16)");
      foil.addColorStop(0.30, "rgba(120,210,255,0.15)");
      foil.addColorStop(0.50, "rgba(180,130,255,0.16)");
      foil.addColorStop(0.70, "rgba(255,210,120,0.15)");
      foil.addColorStop(0.90, "rgba(120,255,190,0.14)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = foil; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      // inner frame
      ctx.strokeStyle = "rgba(255,255,255,0.16)";
      ctx.lineWidth = 2;
      rr(40, 40, W - 80, H - 80, 28); ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      rr(56, 56, W - 112, H - 112, 22); ctx.stroke();

      // helper text
      const center = W / 2;
      const text = (s: string, y: number, font: string, color: string, ls = 0, align: CanvasTextAlign = "center") => {
        ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align;
        ctx.letterSpacing = `${ls}px`;
        ctx.fillText(s, align === "center" ? center : 96, y);
        ctx.letterSpacing = "0px";
      };

      // eyebrow
      text("◆  OFFICIAL  ◆", 150, "600 22px Georgia", RED, 10);
      // title
      text("CERTIFICATE", 240, "700 78px Georgia", "rgba(255,255,255,0.96)", 4);
      text("OF CURIOSITY", 320, "700 78px Georgia", "rgba(255,255,255,0.96)", 4);

      // reward portrait window — the illustrated raccoon scene (square, cover-filled)
      const pw = 620, ph = 620, px = center - pw / 2, py = 380;
      const img = await new Promise<HTMLImageElement>((res, rej) => {
        const im = new Image();
        im.onload = () => res(im); im.onerror = rej;
        im.src = REWARD;
      });
      ctx.save();
      rr(px, py, pw, ph, 24); ctx.clip();
      // object-fit: cover
      const scale = Math.max(pw / img.width, ph / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      ctx.drawImage(img, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
      // tone the vivid red toward the card's oxblood (matches the on-screen multiply)
      ctx.globalCompositeOperation = "multiply";
      const tone = ctx.createLinearGradient(px, py, px, py + ph);
      tone.addColorStop(0, "rgba(58,19,32,0.32)"); tone.addColorStop(1, "rgba(20,10,16,0.46)");
      ctx.fillStyle = tone; ctx.fillRect(px, py, pw, ph);
      ctx.globalCompositeOperation = "source-over";
      // soft vignette
      const vg = ctx.createRadialGradient(center, py + ph / 2, pw * 0.22, center, py + ph / 2, pw * 0.72);
      vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(0,0,0,0.42)");
      ctx.fillStyle = vg; ctx.fillRect(px, py, pw, ph);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 2;
      rr(px, py, pw, ph, 24); ctx.stroke();

      // holographic seal (top-right of portrait)
      const cxs = px + pw - 30, cys = py + 30, rseal = 56;
      const seal = ctx.createLinearGradient(cxs - rseal, cys - rseal, cxs + rseal, cys + rseal);
      seal.addColorStop(0, "#ff6a8a"); seal.addColorStop(0.5, "#9b7bff"); seal.addColorStop(1, "#6ad2ff");
      ctx.beginPath(); ctx.arc(cxs, cys, rseal, 0, Math.PI * 2); ctx.fillStyle = seal; ctx.fill();
      ctx.fillStyle = "rgba(0,0,0,0.85)"; ctx.font = "700 30px Georgia"; ctx.textAlign = "center";
      ctx.fillText("7/7", cxs, cys + 10);

      // awarded to
      text("AWARDED TO", py + ph + 90, "600 22px Georgia", "rgba(255,255,255,0.45)", 8);
      text(name || "A Curious Human", py + ph + 150, "italic 600 46px Georgia", "rgba(255,255,255,0.96)", 1);

      // body
      text("For finding all 7 hidden things.", py + ph + 230, "400 28px Georgia", "rgba(255,255,255,0.7)", 0);
      text("Most people don't make it past 2.", py + ph + 280, "italic 400 26px Georgia", "rgba(255,255,255,0.5)", 0);

      // signature
      text("— Melvin", H - 150, "italic 600 34px Georgia", RED, 1);
      text("melvinjoshy.com", H - 100, "600 18px Georgia", "rgba(255,255,255,0.32)", 6);

      const blob: Blob | null = await new Promise(res => cv.toBlob(res, "image/png"));
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "certificate-of-curiosity.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(false);
    }
  }, [name]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[900] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{ background: "rgba(3,3,6,0.86)", backdropFilter: "blur(16px)", cursor: "default" }}
        >
          {/* confetti-ish radial celebration glow */}
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 42%, rgba(192,57,43,0.18), transparent 70%)" }} />

          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ y: 70, rotateX: 26, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, rotateX: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.94, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.28 }}
            style={{ perspective: 1300, width: "min(360px, 92vw)" }}
          >
            {/* ── Holographic certificate card ── */}
            <motion.div
              ref={cardRef}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              style={{
                rotateX, rotateY,
                transformStyle: "preserve-3d",
                position: "relative",
                borderRadius: 22,
                overflow: "hidden",
                padding: "26px 22px 22px",
                background: "linear-gradient(150deg, #241015 0%, #3a1320 42%, #1b0f1c 72%, #120a10 100%)",
                boxShadow: "0 40px 90px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.1), 0 0 60px rgba(192,57,43,0.18), inset 0 1px 0 rgba(255,255,255,0.14)",
                willChange: "transform",
              }}
            >
              {/* holographic foil + glare layers — gentle warm iridescence, no clashing green/cyan */}
              <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1, background: foilBg, mixBlendMode: "overlay", opacity: 0.3 }} />
              <motion.div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, background: glareBg, mixBlendMode: "overlay", opacity: 0.7 }} />
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: "repeating-linear-gradient(115deg, transparent, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)" }} />

              <div style={{ position: "relative", zIndex: 3 }}>
                {/* eyebrow */}
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: "0.34em", color: RED, textAlign: "center", textTransform: "uppercase", margin: 0 }}>
                  ◆ Official ◆
                </p>
                {/* title */}
                <h2 style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(30px, 9vw, 40px)", lineHeight: 0.94, letterSpacing: "0.06em", color: "rgba(255,255,255,0.97)", textAlign: "center", margin: "8px 0 0", textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>
                  Certificate<br />of Curiosity
                </h2>

                {/* reward portrait window — the illustrated raccoon scene */}
                <div style={{ position: "relative", marginTop: 16, borderRadius: 16, overflow: "hidden", aspectRatio: "1 / 1", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.3)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={REWARD} alt="Reward" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "saturate(0.82) brightness(0.9) contrast(1.02)" }} />
                  {/* pull the vivid pure-red toward the card's muted oxblood so they read as one piece */}
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, rgba(58,19,32,0.28), rgba(20,10,16,0.42))", mixBlendMode: "multiply" }} />
                  {/* soft inner vignette so the seal + edges read */}
                  <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 50px rgba(0,0,0,0.4)" }} />
                  {/* foil seal */}
                  <div style={{ position: "absolute", top: 10, right: 10, width: 46, height: 46, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #ff6a8a, #9b7bff 50%, #6ad2ff)", boxShadow: "0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.5)", transform: "rotate(-8deg)" }}>
                    <span style={{ fontFamily: "var(--font-bebas)", fontSize: 17, letterSpacing: "0.04em", color: "rgba(0,0,0,0.82)" }}>7/7</span>
                  </div>
                </div>

                {/* awarded to */}
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 8, letterSpacing: "0.3em", color: "rgba(255,255,255,0.45)", textAlign: "center", textTransform: "uppercase", margin: "18px 0 6px" }}>
                  Awarded to
                </p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value.slice(0, 28))}
                  onClick={e => (e.target as HTMLInputElement).select()}
                  spellCheck={false}
                  aria-label="Your name"
                  style={{
                    width: "100%", textAlign: "center", background: "transparent", border: "none", outline: "none",
                    cursor: "text",
                    fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 500, fontSize: 23,
                    color: "rgba(255,255,255,0.96)", caretColor: RED,
                  }}
                />
                <div style={{ height: 1, margin: "2px auto 0", width: "62%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)" }} />

                {/* body */}
                <p style={{ fontFamily: "var(--font-serif)", fontSize: 13.5, lineHeight: 1.6, color: "rgba(255,255,255,0.72)", textAlign: "center", margin: "14px 0 0" }}>
                  For finding all 7 hidden things.
                </p>
                <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 12.5, color: "rgba(255,255,255,0.5)", textAlign: "center", margin: "4px 0 0" }}>
                  Most people don&apos;t make it past 2.
                </p>

                {/* signature */}
                <p style={{ fontFamily: "var(--font-caveat)", fontSize: 22, color: RED, textAlign: "right", margin: "12px 6px 0" }}>
                  — Melvin
                </p>
              </div>
            </motion.div>

            {/* actions — plain editorial labels with the brand scribble underline on hover */}
            <div className="mt-5 flex items-center justify-center gap-7">
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.25em]"
                style={{ cursor: "pointer", fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.85)", opacity: downloading ? 0.5 : 1 }}
              >
                <DownloadIcon />
                <ScribbleUnderline color={RED} strokeWidth={1.6} offsetY={3}>
                  {downloading ? "Rendering…" : "Download"}
                </ScribbleUnderline>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex cursor-pointer items-center text-[10px] uppercase tracking-[0.25em]"
                style={{ cursor: "pointer", fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.55)" }}
              >
                <ScribbleUnderline color={RED} strokeWidth={1.6} offsetY={3}>
                  Close
                </ScribbleUnderline>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
