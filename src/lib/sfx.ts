/* Tiny UI sound effects (Kenney, CC0 — see public/sounds/CREDITS.txt).
   Web Audio so clicks fire instantly and can overlap; buffers decode lazily on first use.
   Everything is quiet by design and fails silently (no audio, blocked autoplay, SSR). */

const SOUNDS = {
  click: { src: "/sounds/nav-click.mp3", volume: 0.35 },
  swish: { src: "/sounds/swish.mp3", volume: 0.45 },
  flashlight: { src: "/sounds/flashlight.mp3", volume: 0.5 },
  sketch: { src: "/sounds/sketch.mp3", volume: 0.3 },
  mantra: { src: "/sounds/mantra.mp3", volume: 0.6 },
  compass: { src: "/sounds/compass.mp3", volume: 0.7 },
  glitch: { src: "/sounds/glitch.mp3", volume: 0.25 },
} as const;

export type SfxName = keyof typeof SOUNDS;

let ctx: AudioContext | null = null;
const buffers = new Map<SfxName, Promise<AudioBuffer | null>>();

function audioContext() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function load(name: SfxName) {
  let p = buffers.get(name);
  if (!p) {
    const ac = audioContext();
    p = ac
      ? fetch(SOUNDS[name].src).then((r) => r.arrayBuffer()).then((b) => ac.decodeAudioData(b)).catch(() => null)
      : Promise.resolve(null);
    buffers.set(name, p);
  }
  return p;
}

/** Play a UI sound. Safe to call anywhere; does nothing if audio isn't available. */
export function playSfx(name: SfxName) {
  const ac = audioContext();
  if (!ac) return;
  if (ac.state === "suspended") void ac.resume().catch(() => {});
  void load(name).then((buf) => {
    if (!buf) return;
    const src = ac.createBufferSource();
    const gain = ac.createGain();
    gain.gain.value = SOUNDS[name].volume;
    src.buffer = buf;
    src.connect(gain).connect(ac.destination);
    src.start();
  });
}

/** Warm the cache so the first click isn't late (call after any user gesture). */
export function preloadSfx() {
  (Object.keys(SOUNDS) as SfxName[]).forEach((n) => void load(n));
}
