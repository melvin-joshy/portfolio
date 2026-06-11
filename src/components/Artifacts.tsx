"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Archive,
  Bug,
  Compass,
  Eraser,
  Flashlight,
  Music2,
  PawPrint,
  Paintbrush,
  Pencil,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STORAGE_KEY = "mj_artifacts_v2";
const TOTAL = 7;
const RED   = "#c0392b";   // editorial red — matches --color-danger
const AMBER = "#c4a882";   // warm amber — matches --color-accent
const EASE = [0.16, 1, 0.3, 1] as const;

type ArtifactId =
  | "theme-switch"
  | "music-player"
  | "raccoon-signal"
  | "origin-point"
  | "sketch-pen"
  | "archive"
  | "easter-egg";

type ArtifactDef = {
  id: ArtifactId;
  title: string;
  sub: string;
  Icon: LucideIcon;
  pos: React.CSSProperties;
};

type ArtifactsProps = {
  onRaccoonSignal: () => void;
  onEasterEgg: () => void;
};

const ARTIFACTS: ArtifactDef[] = [
  { id: "theme-switch", title: "SPOTLIGHT", sub: "field scan", Icon: Flashlight, pos: { top: "7%", left: "8%" } },
  { id: "music-player", title: "MUSIC.PLAYER", sub: "local session", Icon: Music2, pos: { top: "32%", left: "12.5%" } },
  { id: "raccoon-signal", title: "RACCOON.AI", sub: "status: online", Icon: PawPrint, pos: { top: "56%", left: "7%" } },
  { id: "sketch-pen", title: "SKETCH.PEN", sub: "ideas.log", Icon: Pencil, pos: { bottom: "22%", left: "22%" } },
  { id: "archive", title: "ARCHIVE_01", sub: "old files", Icon: Archive, pos: { top: "26%", right: "13.5%" } },
  { id: "origin-point", title: "ORIGIN.POINT", sub: "roots trace", Icon: Compass, pos: { top: "48%", right: "19%" } },
  { id: "easter-egg", title: "EASTER_EGG.EXE", sub: "do not click", Icon: Bug, pos: { top: "65%", right: "8.5%" } },
];

function useArtifacts() {
  const [found, setFound] = useState<Set<ArtifactId>>(new Set());
  const [toastCount, setToastCount] = useState<number | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ArtifactId[];
      setFound(new Set(parsed.filter(id => ARTIFACTS.some(def => def.id === id))));
    } catch {}
  }, []);

  const collect = useCallback((id: ArtifactId) => {
    let nextCount = 0;
    let isNew = false;

    setFound(prev => {
      if (prev.has(id)) return prev;
      isNew = true;
      const next = new Set(prev);
      next.add(id);
      nextCount = next.size;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });

    if (!isNew) return;
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastCount(nextCount);
    toastTimer.current = setTimeout(() => setToastCount(null), 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  return { found, count: found.size, toastCount, collect };
}

function Corners({ size = 6, color }: { size?: number; color: string }) {
  const border = `1px solid ${color}`;
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, width: size, height: size, borderTop: border, borderLeft: border }} />
      <div style={{ position: "absolute", top: 0, right: 0, width: size, height: size, borderTop: border, borderRight: border }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, width: size, height: size, borderBottom: border, borderLeft: border }} />
      <div style={{ position: "absolute", bottom: 0, right: 0, width: size, height: size, borderBottom: border, borderRight: border }} />
    </>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div style={{ position: "absolute", left: 48, top: 16, display: "flex", gap: 2, alignItems: "center", opacity: active ? 0.75 : 0 }}>
      {[8, 14, 10, 18, 7].map((h, i) => (
        <motion.span
          key={i}
          style={{ width: 1, height: h, background: RED, transformOrigin: "center" }}
          animate={active ? { scaleY: [0.35, 1, 0.45] } : { scaleY: 0.35 }}
          transition={{ duration: 0.62, repeat: active ? Infinity : 0, delay: i * 0.07, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ArtifactNode({
  def,
  collected,
  isPlaying,
  onTrigger,
}: {
  def: ArtifactDef;
  collected: boolean;
  isPlaying?: boolean;
  onTrigger: (id: ArtifactId) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const { Icon } = def;
  const active = hovered || pressed || isPlaying;

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setPressed(true);
    window.setTimeout(() => setPressed(false), 180);
    onTrigger(def.id);
  }

  return (
    <motion.button
      type="button"
      aria-label={def.title}
      style={{ position: "absolute", cursor: "pointer", userSelect: "none", ...def.pos }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleClick}
      animate={{ scale: pressed && !reducedMotion ? 0.95 : 1 }}
      transition={{ duration: 0.12, ease: EASE }}
    >
      <motion.div
        style={{
          position: "absolute",
          bottom: 52,
          left: 0,
          display: "flex",
          alignItems: "center",
          gap: 5,
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
        initial={false}
        animate={{ opacity: hovered ? 0.84 : 0, y: hovered ? 0 : 3 }}
        transition={{ duration: reducedMotion ? 0 : 0.14 }}
      >
        <span style={{ width: 10, height: 1, background: "rgba(255,255,255,0.24)" }} />
        <span style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.15em", color: RED }}>
          {def.title}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.12em", color: "rgba(255,255,255,0.36)" }}>
          {collected ? "FOUND" : def.sub}
        </span>
      </motion.div>

      <div
        style={{
          position: "relative",
          width: 44,
          height: 44,
          border: `1px solid ${active ? "rgba(192,57,43,0.48)" : "rgba(255,255,255,0.10)"}`,
          background: "rgba(0,0,0,0.24)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: active ? 0.92 : collected ? 0.48 : 0.28,
          boxShadow: active ? "0 0 16px rgba(192,57,43,0.12)" : "none",
          transition: "opacity 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
        }}
      >
        <Corners color={active ? "rgba(192,57,43,0.60)" : "rgba(255,255,255,0.16)"} />
        <motion.span
          animate={isPlaying && !reducedMotion ? { rotate: 360, scale: [1, 1.08, 1] } : { rotate: 0, scale: 1 }}
          transition={isPlaying ? { rotate: { duration: 5, repeat: Infinity, ease: "linear" }, scale: { duration: 1.1, repeat: Infinity } } : { duration: 0.18 }}
          style={{ display: "flex" }}
        >
          <Icon size={18} color={active ? RED : "rgba(255,255,255,0.70)"} strokeWidth={1.2} />
        </motion.span>
        <Waveform active={Boolean(isPlaying)} />
        {collected && (
          <span
            style={{
              position: "absolute",
              right: -4,
              bottom: -4,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: active ? RED : "rgba(255,255,255,0.42)",
              border: "1px solid rgba(0,0,0,0.75)",
            }}
          />
        )}
      </div>
    </motion.button>
  );
}

function Toast({ count }: { count: number }) {
  const pct = (count / TOTAL) * 100;

  return (
    <motion.div
      className="fixed left-1/2 z-[700] pointer-events-none"
      style={{ top: 52, x: "-50%" }}
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      <div style={{
        position: "relative",
        width: 300,
        padding: "11px 16px 13px",
        background: "rgba(4,4,12,0.97)",
        border: "1px solid rgba(192,57,43,0.32)",
        boxShadow: "0 0 48px rgba(192,57,43,0.10), 0 12px 40px rgba(0,0,0,0.55)",
        overflow: "hidden",
      }}>
        <Corners size={6} color="rgba(192,57,43,0.62)" />

        {/* Animated scan line */}
        <motion.div
          style={{
            position: "absolute", left: 0, right: 0, height: 1, top: 0,
            background: "linear-gradient(to right, transparent 0%, rgba(232,221,208,0.22) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
          animate={{ top: ["0%", "100%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <motion.span
              style={{ width: 5, height: 5, borderRadius: "50%", background: RED, display: "inline-block" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            />
            <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.26em", color: RED, textTransform: "uppercase" }}>
              Artifact Located
            </span>
          </div>
          <span style={{ fontFamily: "monospace", fontSize: 8, letterSpacing: "0.18em", color: "rgba(255,255,255,0.42)" }}>
            {String(count).padStart(2, "0")}&nbsp;/&nbsp;{String(TOTAL).padStart(2, "0")}
          </span>
        </div>

        {/* Progress track */}
        <div style={{ position: "relative", height: 4, background: "rgba(255,255,255,0.07)", marginBottom: 8, borderRadius: 1 }}>
          {/* Segment tick marks */}
          {Array.from({ length: TOTAL - 1 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", top: 0, bottom: 0, width: 1,
              left: `${((i + 1) / TOTAL) * 100}%`,
              background: "rgba(0,0,0,0.7)", zIndex: 1,
            }} />
          ))}
          {/* Fill */}
          <motion.div
            style={{ position: "absolute", left: 0, top: 0, bottom: 0, background: RED, borderRadius: 1, zIndex: 0 }}
            initial={{ width: "0%" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
          {/* Glow on fill edge */}
          <motion.div
            style={{ position: "absolute", top: -2, bottom: -2, width: 6, background: `radial-gradient(ellipse, ${RED} 0%, transparent 100%)`, opacity: 0.7, zIndex: 2 }}
            initial={{ left: "0%" }}
            animate={{ left: `calc(${pct}% - 3px)` }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          />
        </div>

        {/* Footer */}
        <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.16em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase" }}>
          {count === TOTAL
            ? "◈  all artifacts recovered — mission complete"
            : `◈  ${TOTAL - count} artifact${TOTAL - count !== 1 ? "s" : ""} remaining — keep exploring`}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Real constellation data for the 4 corners ── */
type StarMap = { stars: [number, number][]; lines: [number, number][] };

const CONSTELLATION_DATA: Record<string, StarMap> = {
  // Cassiopeia — iconic W shape (5 stars)
  cassiopeia: {
    stars: [[18,80],[46,44],[82,70],[116,34],[152,58]],
    lines: [[0,1],[1,2],[2,3],[3,4]],
  },
  // Orion — 7 main stars: shoulders, belt (3), knees
  orion: {
    stars: [[38,18],[130,24],[44,72],[82,68],[120,65],[148,118],[24,118]],
    lines: [[0,2],[1,4],[2,3],[3,4],[0,1],[4,5],[2,6]],
  },
  // Ursa Minor — Little Dipper (7 stars)
  ursaMinor: {
    stars: [[168,14],[140,36],[122,54],[98,62],[32,38],[20,68],[62,88]],
    lines: [[0,1],[1,2],[2,3],[3,6],[6,5],[5,4],[4,3]],
  },
  // Scorpius — hook shape (8 stars)
  scorpius: {
    stars: [[24,22],[44,36],[60,52],[72,70],[78,90],[84,108],[96,122],[118,132]],
    lines: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
  },
};

function GlowConstellation({
  map, W = 180, H = 140, flip, delay, reducedMotion,
}: {
  map: StarMap; W?: number; H?: number; flip?: "x";
  delay: number; reducedMotion: boolean;
}) {
  const tx = (x: number) => flip === "x" ? W - x : x;
  const id = `glow-${delay}`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <filter id={id} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Glow lines */}
      {map.lines.map(([a, b], i) => (
        <motion.line
          key={`gl-${i}`}
          x1={tx(map.stars[a][0])} y1={map.stars[a][1]}
          x2={tx(map.stars[b][0])} y2={map.stars[b][1]}
          stroke="#c4a882" strokeWidth={2.8} strokeLinecap="round"
          filter={`url(#${id})`}
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{ opacity: 0.32, pathLength: 1 }}
          transition={{ duration: reducedMotion ? 0 : 1.1, delay: delay + i * 0.08, ease: [0.16,1,0.3,1] }}
        />
      ))}
      {/* Crisp lines */}
      {map.lines.map(([a, b], i) => (
        <motion.line
          key={`cl-${i}`}
          x1={tx(map.stars[a][0])} y1={map.stars[a][1]}
          x2={tx(map.stars[b][0])} y2={map.stars[b][1]}
          stroke="#d4b896" strokeWidth={0.8} strokeLinecap="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          transition={{ duration: reducedMotion ? 0 : 0.6, delay: delay + i * 0.08, ease: [0.16,1,0.3,1] }}
        />
      ))}

      {/* Stars */}
      {map.stars.map(([x, y], i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.3, delay: delay + 0.3 + i * 0.06, ease: EASE }}
        >
          <circle cx={tx(x)} cy={y} r={7} fill="#c4a882" opacity={0.10} />
          <circle cx={tx(x)} cy={y} r={3.5} fill="#c4a882" opacity={0.22} filter={`url(#${id})`} />
          <circle cx={tx(x)} cy={y} r={1.8} fill="white" opacity={0.92} />
          <circle cx={tx(x)} cy={y} r={0.85} fill="#e8d4b8" opacity={1} />
        </motion.g>
      ))}
    </svg>
  );
}

function OriginTrace({ visible, reducedMotion }: { visible: boolean; reducedMotion: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-[4] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.3, ease: EASE }}
        >
          {/*
            Layout reference:
            - Left text column ends at ~13% width
            - Project card starts at ~38% width, ends at ~63%
            - Right text column starts at ~87% width
            - LEFT GUTTER  = x 13-38%, full height
            - RIGHT GUTTER = x 63-87%, full height
            All 4 constellations live inside these gutters,
            well clear of all text and the card.
          */}

          {/* Cassiopeia — top of LEFT gutter (W shape) */}
          <div style={{ position: "absolute", top: "9%", left: "16%" }}>
            <GlowConstellation map={CONSTELLATION_DATA.cassiopeia} W={170} H={120} delay={0} reducedMotion={reducedMotion} />
          </div>

          {/* Ursa Minor — bottom of LEFT gutter (below "ZERO TO ONE" text) */}
          <div style={{ position: "absolute", top: "58%", left: "15%" }}>
            <GlowConstellation map={CONSTELLATION_DATA.ursaMinor} W={160} H={130} delay={0.28} reducedMotion={reducedMotion} />
          </div>

          {/* Orion — top of RIGHT gutter */}
          <div style={{ position: "absolute", top: "8%", right: "16%" }}>
            <GlowConstellation map={CONSTELLATION_DATA.orion} flip="x" W={160} H={140} delay={0.15} reducedMotion={reducedMotion} />
          </div>

          {/* Scorpius — bottom of RIGHT gutter (below "AI-NATIVE WORKFLOW") */}
          <div style={{ position: "absolute", top: "60%", right: "14%" }}>
            <GlowConstellation map={CONSTELLATION_DATA.scorpius} flip="x" W={150} H={155} delay={0.4} reducedMotion={reducedMotion} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SpotlightOverlay({ activeKey, reducedMotion }: { activeKey: number; reducedMotion: boolean }) {
  return (
    <AnimatePresence>
      {activeKey > 0 && (
        <motion.div
          key={activeKey}
          className="fixed inset-0 z-[710] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.2, ease: EASE }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 36% 42%, rgba(255,246,214,0.42) 0%, rgba(255,246,214,0.16) 15%, rgba(255,246,214,0.05) 27%, transparent 43%)",
              mixBlendMode: "screen",
            }}
            animate={reducedMotion ? { opacity: [0, 0.9, 0] } : {
              opacity: [0, 1, 0.82, 0],
              x: ["-18%", "8%", "22%", "34%"],
              y: ["8%", "-5%", "10%", "-3%"],
              scale: [0.86, 1.04, 0.96, 1.08],
            }}
            transition={reducedMotion ? { duration: 0.8, times: [0, 0.45, 1] } : {
              duration: 4.8,
              times: [0, 0.22, 0.7, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 0%, transparent 24%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.34) 100%)",
            }}
            animate={{ opacity: [0, 0.72, 0] }}
            transition={{ duration: reducedMotion ? 0.8 : 4.8, ease: EASE }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ArchiveModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[720] flex items-center justify-center"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <motion.div
            onClick={event => event.stopPropagation()}
            className="relative"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
            style={{ width: 240, padding: 14, background: "rgba(5,5,10,0.96)", border: "1px solid rgba(192,57,43,0.28)", boxShadow: "0 24px 80px rgba(0,0,0,0.45)" }}
          >
            <Corners color="rgba(192,57,43,0.42)" />
            <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.22em", color: RED, textTransform: "uppercase", marginBottom: 10 }}>
              Archive_01
            </div>
            {["Old sketches", "First Figma file", "Architecture notes"].map((item, i) => (
              <div key={item} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 30, borderTop: i === 0 ? "1px solid rgba(255,255,255,0.08)" : undefined, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.08em", color: "rgba(255,255,255,0.58)" }}>{item}</span>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(192,57,43,0.55)" }} />
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PaintModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<"brush" | "eraser">("brush");
  const [color, setColor] = useState("#111111");
  const [size, setSize] = useState(5);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const prepareCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(prepareCanvas, 40);
    window.addEventListener("resize", prepareCanvas);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener("resize", prepareCanvas);
    };
  }, [open, prepareCanvas]);

  const getPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const drawTo = useCallback((point: { x: number; y: number }) => {
    const canvas = canvasRef.current;
    const last = lastPointRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !last) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }, [color, size, tool]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  const PALETTE = [
    "#000000", "#808080", "#800000", "#FF0000", "#808000", "#FFFF00", "#008000", "#00FF00",
    "#008080", "#00FFFF", "#000080", "#0000FF", "#800080", "#FF00FF", "#C0C088", "#FFFFFF",
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[730] flex items-center justify-center px-6"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Win9x teal desktop backdrop */}
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <style>{`
            .win95-bevel-out {
              box-shadow:
                inset 1px 1px 0 #ffffff,
                inset -1px -1px 0 #404040,
                inset 2px 2px 0 #dfdfdf,
                inset -2px -2px 0 #808080;
            }
            .win95-bevel-in {
              box-shadow:
                inset 1px 1px 0 #404040,
                inset -1px -1px 0 #ffffff,
                inset 2px 2px 0 #808080,
                inset -2px -2px 0 #dfdfdf;
            }
            .win95-bevel-sunken {
              box-shadow:
                inset 1px 1px 0 #808080,
                inset -1px -1px 0 #ffffff;
            }
            .win95-titlebar {
              background: linear-gradient(to right, #000080 0%, #1084d0 100%);
            }
            .win95-button {
              background: #c0c0c0;
              box-shadow:
                inset 1px 1px 0 #ffffff,
                inset -1px -1px 0 #404040,
                inset 2px 2px 0 #dfdfdf,
                inset -2px -2px 0 #808080;
            }
            .win95-button:active,
            .win95-button[data-pressed="true"] {
              box-shadow:
                inset 1px 1px 0 #404040,
                inset -1px -1px 0 #ffffff,
                inset 2px 2px 0 #808080,
                inset -2px -2px 0 #dfdfdf;
            }
            .win95-text {
              font-family: var(--font-pixelify), "MS Sans Serif", "Tahoma", "Geneva", sans-serif;
            }
            /* Custom slider */
            .win95-slider {
              -webkit-appearance: none;
              appearance: none;
              background: transparent;
              height: 18px;
            }
            .win95-slider::-webkit-slider-runnable-track {
              height: 4px;
              background: #808080;
              box-shadow: inset 1px 1px 0 #404040, inset -1px -1px 0 #ffffff;
            }
            .win95-slider::-moz-range-track {
              height: 4px;
              background: #808080;
              box-shadow: inset 1px 1px 0 #404040, inset -1px -1px 0 #ffffff;
            }
            .win95-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 10px;
              height: 16px;
              margin-top: -6px;
              background: #c0c0c0;
              box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #404040, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080;
              cursor: pointer;
            }
            .win95-slider::-moz-range-thumb {
              width: 10px;
              height: 16px;
              border: none;
              background: #c0c0c0;
              box-shadow: inset 1px 1px 0 #ffffff, inset -1px -1px 0 #404040, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080;
              cursor: pointer;
            }
          `}</style>
          <motion.div
            onClick={event => event.stopPropagation()}
            className="win95-bevel-out win95-text relative flex max-h-[calc(100vh-48px)] w-[min(920px,calc(100vw-32px))] flex-col text-black"
            style={{ background: "#c0c0c0" }}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE }}
          >
            {/* Title bar */}
            <div className="win95-titlebar flex h-[22px] items-center justify-between px-1 text-white" style={{ margin: 3 }}>
              <div className="flex items-center gap-1.5 text-[12px] font-bold tracking-tight">
                <Pencil size={12} />
                <span>SKETCH.PEN - Paint</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="win95-button flex h-[18px] w-[18px] items-center justify-center text-black"
              >
                <X size={11} strokeWidth={3} />
              </button>
            </div>

            {/* Menu bar */}
            <div className="flex items-center gap-3 px-2 text-[11px]" style={{ paddingBottom: 2 }}>
              {["File", "Edit", "View", "Image", "Options", "Help"].map((m) => (
                <span key={m} className="cursor-default select-none px-1 py-0.5 hover:bg-[#000080] hover:text-white">
                  <span className="underline">{m[0]}</span>
                  {m.slice(1)}
                </span>
              ))}
            </div>

            <div className="flex min-h-0 flex-1 gap-1 px-1 pb-1">
              {/* Left toolbox */}
              <div className="win95-bevel-out flex w-[72px] shrink-0 flex-col items-center gap-2 p-1.5" style={{ background: "#c0c0c0" }}>
                {/* Tool buttons — 2-column grid */}
                <div className="grid w-full grid-cols-2 gap-[2px]">
                  <button
                    type="button"
                    onClick={() => setTool("brush")}
                    data-pressed={tool === "brush"}
                    className="win95-button flex h-[26px] w-[26px] items-center justify-center"
                    aria-label="Use brush"
                    aria-pressed={tool === "brush"}
                  >
                    <Paintbrush size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setTool("eraser")}
                    data-pressed={tool === "eraser"}
                    className="win95-button flex h-[26px] w-[26px] items-center justify-center"
                    aria-label="Use eraser"
                    aria-pressed={tool === "eraser"}
                  >
                    <Eraser size={14} />
                  </button>
                </div>

                {/* Size slider in sunken well */}
                <div className="win95-bevel-in flex w-full flex-col items-center gap-1 px-1 py-1.5" style={{ background: "#c0c0c0" }}>
                  <div className="text-[9px] uppercase leading-none text-black/70">Size</div>
                  <input
                    aria-label="Brush size"
                    type="range"
                    min="2"
                    max="18"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="win95-slider w-full"
                  />
                  <div className="text-[10px] leading-none">{size}px</div>
                </div>

                {/* Clear button */}
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="win95-button w-full px-2 py-1 text-[10px] uppercase tracking-wider"
                >
                  Clear
                </button>
              </div>

              {/* Canvas + bottom palette */}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="win95-bevel-in min-h-[360px] min-w-0 flex-1 overflow-hidden" style={{ background: "#ffffff" }}>
                <canvas
                  ref={canvasRef}
                  className="block h-full w-full cursor-crosshair bg-white"
                  style={{ minHeight: 360, maxHeight: "calc(100vh - 128px)", touchAction: "none" }}
                  onPointerDown={event => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    drawingRef.current = true;
                    lastPointRef.current = getPoint(event);
                  }}
                  onPointerMove={event => {
                    if (!drawingRef.current) return;
                    const point = getPoint(event);
                    if (point) drawTo(point);
                  }}
                  onPointerUp={event => {
                    event.currentTarget.releasePointerCapture(event.pointerId);
                    drawingRef.current = false;
                    lastPointRef.current = null;
                  }}
                  onPointerCancel={() => {
                    drawingRef.current = false;
                    lastPointRef.current = null;
                  }}
                />
                </div>

                {/* Color palette — 16 swatches, 2 rows × 8 cols */}
                <div className="win95-bevel-out flex items-center gap-2 p-1.5" style={{ background: "#c0c0c0" }}>
                  {/* Current color preview */}
                  <div className="win95-bevel-in flex flex-col items-center justify-center" style={{ width: 32, height: 32, padding: 3, background: "#c0c0c0" }}>
                    <div style={{ width: "100%", height: "100%", background: color }} />
                  </div>
                  {/* Swatch grid */}
                  <div className="grid grid-cols-8 gap-[2px]">
                    {PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`Color ${c}`}
                        onClick={() => { setColor(c); setTool("brush"); }}
                        className="win95-bevel-sunken"
                        style={{ width: 16, height: 16, background: c, padding: 0 }}
                      />
                    ))}
                  </div>
                  {/* Optional custom-color escape hatch */}
                  <label className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider">
                    <span>Custom</span>
                    <input
                      aria-label="Custom color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width: 24, height: 24, padding: 0, border: "none", background: "transparent" }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div className="win95-bevel-in flex items-center justify-between gap-3 px-2 py-0.5 text-[10px]" style={{ background: "#c0c0c0", margin: 3, marginTop: 0 }}>
              <span>For Help, click Help Topics on the Help Menu.</span>
              <span className="font-mono">{tool === "brush" ? `■ ${color}` : "● Eraser"} · {size}px</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Artifacts({ onRaccoonSignal, onEasterEgg }: ArtifactsProps) {
  const { found, count, toastCount, collect } = useArtifacts();
  const reducedMotion = Boolean(useReducedMotion());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [spotlightKey, setSpotlightKey] = useState(0);
  const [originVisible, setOriginVisible] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [paintOpen, setPaintOpen] = useState(false);

  const originTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/music.mp3");
    // Don't fetch the 3.6 MB file on mount — only when the user hits play.
    audioRef.current.preload = "none";
    audioRef.current.loop = true;
    audioRef.current.volume = 0.28;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const runTimed = useCallback((timer: React.MutableRefObject<ReturnType<typeof setTimeout> | null>, fn: () => void, clearFn: () => void, ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    fn();
    timer.current = setTimeout(clearFn, ms);
  }, []);

  const triggerAction = useCallback((id: ArtifactId) => {
    collect(id);

    if (id === "theme-switch") {
      setSpotlightKey(key => key + 1);
      return;
    }

    if (id === "music-player") {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      } else {
        audio.pause();
        setPlaying(false);
      }
      return;
    }

    if (id === "raccoon-signal") {
      onRaccoonSignal();
      return;
    }

    if (id === "origin-point") {
      runTimed(originTimer, () => setOriginVisible(true), () => setOriginVisible(false), 4000);
      return;
    }

    if (id === "sketch-pen") {
      setPaintOpen(true);
      return;
    }

    if (id === "archive") {
      setArchiveOpen(true);
      return;
    }

    onEasterEgg();
  }, [collect, onEasterEgg, onRaccoonSignal, runTimed]);

  useEffect(() => {
    return () => {
      [originTimer].forEach(timer => {
        if (timer.current) clearTimeout(timer.current);
      });
    };
  }, []);

  return (
    <>
      <div className="hidden md:block" style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: 13, right: 20, display: "flex", alignItems: "center", gap: 5, opacity: 0.56, pointerEvents: "none" }}>
          <span style={{ width: 4, height: 4, borderRadius: "50%", background: RED }} />
          <span style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.2em", color: RED, textTransform: "uppercase" }}>
            {count}/{TOTAL} found
          </span>
        </div>

        <OriginTrace visible={originVisible} reducedMotion={reducedMotion} />

        {ARTIFACTS.map(def => (
          <div key={def.id} style={{ pointerEvents: "auto" }}>
            <ArtifactNode def={def} collected={found.has(def.id)} isPlaying={def.id === "music-player" && playing} onTrigger={triggerAction} />
          </div>
        ))}
      </div>

      <SpotlightOverlay activeKey={spotlightKey} reducedMotion={reducedMotion} />

      <ArchiveModal open={archiveOpen} onClose={() => setArchiveOpen(false)} />
      <PaintModal open={paintOpen} onClose={() => setPaintOpen(false)} />

      <AnimatePresence>
        {toastCount !== null && <Toast key={`toast-${toastCount}`} count={toastCount} />}
      </AnimatePresence>
    </>
  );
}
