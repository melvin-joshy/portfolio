"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Msg = { role: "user" | "assistant"; content: string; error?: boolean };

const RED = "var(--color-danger, #c0392b)"; // brand token, falls back to hex
const SUGGESTIONS = [
  "What does Melvin do?",
  "Tell me about Tempo",
  "Best project to look at?",
  "How do I reach him?",
];

export default function MelvinAI() {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [launcherHover, setLauncherHover] = useState(false);
  const [coarse, setCoarse] = useState(false); // touch devices -> no hover to pause the marquee
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  // Detect coarse (touch) pointers — read after mount to avoid hydration mismatch.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setCoarse(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const staticChips = !!reducedMotion || coarse; // static, tappable suggestions

  // Keep the transcript pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Focus the input on open; restore focus to the launcher on close.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // While open: Escape closes, Tab is trapped across the launcher (close) + panel.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); return; }
      if (e.key !== "Tab") return;
      const nodes: HTMLElement[] = [];
      if (launcherRef.current) nodes.push(launcherRef.current);
      if (panelRef.current) {
        nodes.push(
          ...Array.from(
            panelRef.current.querySelectorAll<HTMLElement>(
              'button, a[href], textarea, input, [tabindex]:not([tabindex="-1"])'
            )
          ).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1)
        );
      }
      if (nodes.length === 0) return;
      const first = nodes[0], last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && active === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Core: takes a history ending in the user turn to answer, streams the reply.
  const runChat = useCallback(async (history: Msg[]) => {
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Strip errored turns so failures never become model context.
        body: JSON.stringify({
          messages: history.filter((m) => !m.error).map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let msg = "Melvin AI is unavailable right now. Try emailing melvinjoshy5@gmail.com.";
        try { const data = await res.json(); if (data?.error) msg = data.error; } catch {}
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: msg, error: true }; return c; });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
      }
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        // User stopped it — keep what streamed, drop an empty slot.
        setMessages((m) => {
          const c = [...m];
          const last = c[c.length - 1];
          if (last && last.role === "assistant" && !last.content) c.pop();
          return c;
        });
      } else {
        setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: "Something went wrong reaching Melvin AI. Please try again.", error: true }; return c; });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }, []);

  const send = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setInput("");
    runChat([...messages, { role: "user", content: trimmed }]);
  }, [busy, messages, runChat]);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const retry = useCallback(() => {
    if (busy) return;
    const h = [...messages];
    while (h.length && h[h.length - 1].role === "assistant") h.pop();
    if (h.length) runChat(h);
  }, [busy, messages, runChat]);

  const copyMsg = useCallback((i: number, text: string) => {
    navigator.clipboard?.writeText(text)
      .then(() => {
        setCopiedIdx(i);
        setTimeout(() => setCopiedIdx((c) => (c === i ? null : c)), 1400);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ── Launcher — round dot-matrix orb FAB. Hidden while the panel is open
            so the header ✕ is the single close control (no duplicate). ── */}
      <motion.div
        className="group fixed bottom-5 right-5 z-[700] flex items-center gap-3"
        initial={{ opacity: 0, y: 16, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setLauncherHover(true)}
        onMouseLeave={() => setLauncherHover(false)}
      >
        {/* Hover tooltip for discoverability */}
        <span
          className="pointer-events-none whitespace-nowrap rounded-full px-3 py-1.5 text-[9px] uppercase tracking-[0.28em] text-white/90 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          style={{
            fontFamily: "var(--font-mono, monospace)",
            background: "rgba(12,12,14,0.9)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.7)",
          }}
        >
          {open ? "Close" : "Ask Melvin AI"}
        </span>

        <button
          ref={launcherRef}
          type="button"
          aria-label={open ? "Close Melvin AI" : "Open Melvin AI chat"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="relative h-[58px] w-[58px] shrink-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          {/* The disc — dimmed at rest, full brightness on hover (and when open, as the close button) */}
          <motion.span
            className={`absolute inset-0 flex items-center justify-center overflow-hidden rounded-full transition-[filter] duration-200 group-hover:[filter:brightness(1)] ${open ? "[filter:brightness(1)]" : "[filter:brightness(0.78)]"}`}
            style={{
              background: "radial-gradient(120% 120% at 50% 20%, #20171b 0%, #0c0a0e 75%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow:
                "0 16px 40px -10px rgba(0,0,0,0.85), 0 2px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <motion.svg
                  key="x"
                  width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="rgba(255,255,255,0.85)" strokeWidth="1.8" strokeLinecap="round"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </motion.svg>
              ) : (
                <motion.span
                  key="orb"
                  className="flex items-center justify-center"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 20 }}
                >
                  <Orb size={44} cols={18} decor={false} maskSrc="/racoon%20hi.webp" still={!!reducedMotion || !launcherHover} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.span>

        </button>
      </motion.div>

      {/* ── Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Melvin AI chat"
            className="fixed bottom-24 right-5 z-[700] flex w-[calc(100vw-2.5rem)] max-w-[380px] flex-col overflow-hidden rounded-[26px]"
            style={{
              height: "min(560px, calc(100vh - 7rem))",
              // Sits on the site's #0a0a0a ink, with only a hair of lift at the top.
              background: "linear-gradient(180deg, #0d0d0d 0%, #090909 60%, #070707 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 40px 100px -20px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2.5">
                <Orb size={28} cols={14} decor={false} maskSrc="/racoon%20hi.webp" still={!!reducedMotion} />
                <div className="leading-tight">
                  <p
                    className="font-bebas text-[17px] tracking-[0.12em] text-white/95"
                    style={{ fontFamily: "var(--font-bebas, sans-serif)" }}
                  >
                    MELVIN AI
                  </p>
                  <p className="text-[8px] uppercase tracking-[0.3em] text-white/55">
                    Trained on his work
                  </p>
                </div>
              </div>
              {/* Close lives in the bottom orb FAB (it morphs to ✕ when open). */}
            </div>

            {/* Body */}
            <div
              ref={scrollRef}
              aria-live="polite"
              aria-atomic="false"
              className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide"
            >
              {messages.length === 0 ? (
                /* Empty-state hero — orb + stars + prompt + chips */
                <div className="flex h-full flex-col items-center justify-center px-2 text-center">
                  <Orb size={112} cols={28} maskSrc="/racoon%20hi.webp" still={!!reducedMotion} />
                  <p
                    className="mt-6 text-[17px] tracking-[0.08em] text-white/95"
                    style={{ fontFamily: "var(--font-bebas, sans-serif)" }}
                  >
                    Ask me about my work
                  </p>
                  <p className="mt-2 max-w-[28ch] text-[11px] leading-relaxed text-white/50">
                    Projects, process, how I think, or how to reach me.
                  </p>
                  {staticChips ? (
                    /* Touch / reduced-motion: static, tappable suggestions (no moving targets) */
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                      {SUGGESTIONS.map((s, i) => (
                        <span key={s} className="flex items-center gap-x-2">
                          <Chip label={s} onPick={() => send(s)} />
                          {i < SUGGESTIONS.length - 1 && <Sep />}
                        </span>
                      ))}
                    </div>
                  ) : (
                    /* Slow editorial marquee — one line, pauses on hover (pointer devices) */
                    <div
                      className="group relative mt-6 w-full overflow-hidden"
                      style={{
                        WebkitMaskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)",
                        maskImage: "linear-gradient(90deg, transparent, #000 14%, #000 86%, transparent)",
                      }}
                    >
                      <div
                        className="flex w-max items-center gap-x-4 group-hover:[animation-play-state:paused]"
                        style={{ animation: "mjchip 28s linear infinite" }}
                      >
                        {[...SUGGESTIONS, ...SUGGESTIONS].map((s, i) => (
                          // Second copy is decorative duplication for the loop — hide from AT.
                          <span key={i} aria-hidden={i >= SUGGESTIONS.length} className="flex items-center gap-x-4">
                            <Chip label={s} onPick={() => send(s)} tabIndex={i >= SUGGESTIONS.length ? -1 : 0} />
                            <Sep />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Transcript */
                <div className="space-y-3">
                  {messages.map((m, i) => {
                    const isUser = m.role === "user";
                    const isLast = i === messages.length - 1;
                    const showTools = !isUser && !!m.content && !(busy && isLast);
                    return (
                      <div key={i} className={`group flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                        <div
                          className="max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                          style={
                            isUser
                              ? { background: RED, color: "#fff", borderBottomRightRadius: 4 }
                              : {
                                  background: "rgba(255,255,255,0.05)",
                                  color: "rgba(255,255,255,0.9)",
                                  border: "1px solid rgba(255,255,255,0.06)",
                                  borderBottomLeftRadius: 4,
                                }
                          }
                        >
                          {m.content || (busy && isLast ? <Dots /> : "")}
                        </div>

                        {showTools && (
                          <div className="mt-0.5 flex items-center gap-1 pl-1">
                            <button
                              type="button"
                              aria-label="Copy reply"
                              onClick={() => copyMsg(i, m.content)}
                              className="inline-flex min-h-[32px] items-center px-1.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white/35 transition-colors hover:text-white/80 cursor-pointer focus-visible:outline-none focus-visible:text-white/80"
                            >
                              {copiedIdx === i ? "Copied" : "Copy"}
                            </button>
                            {m.error && !busy && (
                              <button
                                type="button"
                                onClick={retry}
                                className="inline-flex min-h-[32px] items-center px-1.5 py-1 text-[10px] uppercase tracking-[0.18em] transition-colors cursor-pointer focus-visible:outline-none focus-visible:underline"
                                style={{ color: RED }}
                              >
                                Try again
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="px-3 pb-3 pt-2"
            >
              {/* Concentric radius: panel 26px − 12px padding = 14px inner. */}
              <div
                className="flex items-end gap-1.5 rounded-[14px] py-1.5 pl-4 pr-1.5 transition-colors focus-within:border-white/25"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                  }}
                  rows={1}
                  aria-label="Message Melvin AI"
                  placeholder="Message Melvin AI..."
                  className="max-h-24 flex-1 resize-none bg-transparent py-2 text-[13px] text-white/90 placeholder:text-white/45 focus:outline-none"
                />
                <button
                  type={busy ? "button" : "submit"}
                  aria-label={busy ? "Stop generating" : "Send message"}
                  onClick={busy ? stop : undefined}
                  disabled={!busy && !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  style={{ background: RED }}
                >
                  {busy ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" aria-hidden>
                      <rect x="5" y="5" width="14" height="14" rx="2.5" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes mjchip { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </>
  );
}

/* ─────────────── Orb — iridescent core, soft bloom, twinkling stars ─────────────── */

const STARS = [
  { x: -14, y: 10, s: 2 }, { x: 102, y: 22, s: 1.6 }, { x: 88, y: -10, s: 2.4 },
  { x: -8, y: 70, s: 1.5 }, { x: 108, y: 74, s: 2 }, { x: 44, y: -16, s: 1.4 },
  { x: 16, y: 96, s: 1.7 }, { x: 78, y: 98, s: 1.4 },
];

function Orb({ size = 100, cols = 13, decor = true, maskSrc, still = false }: { size?: number; cols?: number; decor?: boolean; maskSrc?: string; still?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const maskRef = useRef<Float32Array | null>(null);
  const [maskReady, setMaskReady] = useState(0); // bumps when the mask finishes loading

  // Optional shape mask (e.g. raccoon) sampled down to the dot grid -> halftone silhouette.
  useEffect(() => {
    if (!maskSrc) { maskRef.current = null; return; }
    let alive = true;
    const off = document.createElement("canvas");
    off.width = cols; off.height = cols;
    const octx = off.getContext("2d");
    if (!octx) return;
    const im = new Image();
    im.onload = () => {
      if (!alive) return;
      octx.clearRect(0, 0, cols, cols);
      const s = Math.min(cols / im.width, cols / im.height) * 0.96;
      const w = im.width * s, h = im.height * s;
      octx.drawImage(im, (cols - w) / 2, (cols - h) / 2, w, h);
      const d = octx.getImageData(0, 0, cols, cols).data;
      const arr = new Float32Array(cols * cols);
      for (let k = 0; k < cols * cols; k++) {
        const a = d[k * 4 + 3] / 255;
        const lum = (0.299 * d[k * 4] + 0.587 * d[k * 4 + 1] + 0.114 * d[k * 4 + 2]) / 255;
        arr[k] = a * (0.25 + 0.75 * lum); // visible + brightness -> dot weight
      }
      maskRef.current = arr;
      setMaskReady((n) => n + 1); // trigger a repaint now the mask exists
    };
    im.src = maskSrc;
    return () => { alive = false; };
  }, [maskSrc, cols]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gap = size / cols;
    const cx = size / 2, cy = size / 2;
    const R = size / 2 - gap * 0.35; // orb radius

    const paint = (t: number) => {
      ctx.clearRect(0, 0, size, size);
      const mask = maskRef.current;

      for (let j = 0; j < cols; j++) {
        for (let i = 0; i < cols; i++) {
          const x = gap * 0.5 + i * gap;
          const y = gap * 0.5 + j * gap;
          const nd = Math.hypot(x - cx, y - cy) / R; // 0 centre -> 1 edge

          // Intensity: raccoon mask if present, else circular falloff.
          let intensity: number;
          if (mask) {
            intensity = mask[j * cols + i];
          } else {
            if (nd > 1.06) continue; // circular mask (+ slight scatter ring)
            intensity = Math.max(0, 1 - nd * nd);
          }
          if (intensity < 0.06) continue;

          // Ripple travelling outward = the "moving" feel.
          const wave = 0.5 + 0.5 * Math.sin(t * 2.2 - nd * 5.2);
          const r = gap * 0.46 * (0.2 + 0.8 * intensity) * (0.72 + 0.4 * wave);
          if (r < 0.3) continue;

          // Red gradient: hot orange-red centre -> deep oxblood edge.
          const cr = Math.round(255 - nd * 70);
          const cg = Math.round(Math.max(0, 74 - nd * 50));
          const cb = Math.round(Math.max(0, 50 - nd * 35));
          const alpha = !mask && nd > 0.88 ? Math.max(0, 1 - (nd - 0.88) / 0.18) : 1;

          ctx.beginPath();
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // Static: paint one frame and stop (no idle rAF burning CPU in the corner).
    if (still) { paint(0); return; }

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      paint((now - start) / 1000);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [size, cols, still, maskReady]);

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={decor && !still ? { scale: [1, 1.04, 1] } : undefined}
      transition={decor && !still ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {decor && (
        <>
          {STARS.map((st, i) => (
            <motion.span
              key={i}
              className="absolute bg-white"
              style={{ left: st.x, top: st.y, width: st.s + 0.5, height: st.s + 0.5, boxShadow: "0 0 3px rgba(255,255,255,0.7)" }}
              animate={still ? { opacity: 0.6 } : { opacity: [0.12, 1, 0.12] }}
              transition={still ? undefined : { duration: 1.8 + (i % 4) * 0.4, repeat: Infinity, delay: i * 0.27, ease: "easeInOut" }}
            />
          ))}
          <Sparkle x={-18} y={44} delay={0.4} still={still} />
          <Sparkle x={104} y={52} delay={1.3} still={still} />
        </>
      )}

      {/* Red bloom behind the dots */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          filter: `blur(${Math.round(size * 0.16)}px)`,
          background: "radial-gradient(circle at 50% 50%, rgba(239,38,38,0.5), rgba(120,20,16,0.35) 55%, transparent 72%)",
        }}
      />
      {/* Halftone dot matrix */}
      <canvas ref={ref} aria-hidden className="absolute inset-0" style={{ width: size, height: size }} />
    </motion.div>
  );
}

// A tiny pixel "+" sparkle.
function Sparkle({ x, y, delay, still = false }: { x: number; y: number; delay: number; still?: boolean }) {
  return (
    <motion.span
      className="absolute"
      style={{ left: x, top: y, width: 7, height: 7 }}
      animate={still ? { opacity: 0.7 } : { opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
      transition={still ? undefined : { duration: 2.6, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      <span className="absolute left-[3px] top-0 h-[7px] w-[1px] bg-white" />
      <span className="absolute left-0 top-[3px] h-[1px] w-[7px] bg-white" />
    </motion.span>
  );
}

// Editorial text-link suggestion (no pill) — matches the site's project ticker.
function Chip({ label, onPick, tabIndex }: { label: string; onPick: () => void; tabIndex?: number }) {
  return (
    <button
      type="button"
      onClick={onPick}
      tabIndex={tabIndex}
      className="inline-flex min-h-[36px] shrink-0 items-center whitespace-nowrap px-1.5 py-2 text-[11px] text-white/55 underline-offset-4 transition-colors hover:text-white hover:underline cursor-pointer focus-visible:outline-none focus-visible:text-white focus-visible:underline"
      style={{ textDecorationColor: "rgba(255,255,255,0.3)" }}
    >
      {label}
    </button>
  );
}

function Sep() {
  return <span aria-hidden className="select-none text-[10px] text-white/20">✱</span>;
}

function Dots() {
  return (
    <span className="inline-flex gap-1 py-1" aria-label="Melvin AI is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-white/50"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  );
}
