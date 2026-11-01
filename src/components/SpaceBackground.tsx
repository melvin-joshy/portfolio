"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

/* Flat black sky drawn in ASCII.
   - A star grid that twinkles by swapping glyphs.
   - ASCII asteroids in three sizes: lumpy, cratered rocks shaded by a light from the top-left,
     tumbling as they drift. Small ones read as far away (dimmer, slower), big ones as near.
   - Far-off oddities: a ringed planet, a satellite with a blinking light, a tumbling astronaut.
   - Shooting stars.
   Rendered at a low frame rate on purpose: it reads as a terminal, and it's cheap. */

const FPS = 12;
// The whole sky runs on a slowed clock: drift, spin, twinkle and spawn timing all scale together
const TIME_SCALE = 0.4;
const STAR_CELL = 22;
const STAR_RAMP = [".", "·", ":", "+", "*"];
const ROCK_RAMP = " .,:;-=+*#%@";
const TRAIL = ["*", "=", "~", "-", "-", "-", ".", ".", "."];
const LIGHT = norm([-0.55, -0.65, 0.52]);   // top-left, slightly toward the viewer

type Vec = [number, number, number];
function norm(v: Vec): Vec { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }

type Star = { x: number; y: number; bright: number; speed: number; phase: number; vx: number };
type Crater = { d: Vec; cos: number; depth: number };
type Rock = {
  x: number; y: number; vx: number; vy: number;   // px, px/ms
  R: number;                                       // radius in cells
  cell: number;                                    // grid pitch in px (smaller for far rocks)
  seed: number; stretch: Vec;
  spinY: number; spinX: number; tilt: number;      // rad/ms
  craters: Crater[];
  peak: number;                                    // max alpha
  depth: number;                                   // 0 = far away, 1 = close
};
type Meteor = { x: number; y: number; dx: number; dy: number; dist: number; life: number };
type Drifter = { x: number; y: number; vx: number; vy: number; rot: number; vr: number };
type RockKind = "small" | "mid" | "big";

/* Perspective: one depth value drives size, glyph pitch, brightness and speed together,
   so far things read smaller, fainter and slower, and near things larger, brighter, faster. */
const DEPTH_RANGE: Record<RockKind, [number, number]> = { small: [0, 0.2], mid: [0.4, 0.55], big: [0.75, 0.9] };
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const RED_RGB = "192,57,43";

function makeRock(w: number, h: number, onScreen: boolean, right?: boolean, kind?: RockKind, yFrac?: number): Rock {
  const k = kind ?? (Math.random() < 0.5 ? "small" : Math.random() < 0.7 ? "mid" : "big");
  const depth = rand(DEPTH_RANGE[k][0], DEPTH_RANGE[k][1]);
  const R = 2.5 + depth * 3.6;                               // radius in cells
  const cell = Math.round(4 + depth * 3);                    // 4px glyphs far away → 7px close
  const fromRight = right ?? Math.random() < 0.6;
  const speed = 0.002 + depth * 0.008;                       // px/ms: far drifts, near travels
  const span = R * cell * 1.6;
  const craters = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => {
    const size = 0.25 + Math.random() * 0.3;
    return { d: norm([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]), cos: Math.cos(size), depth: 0.07 + Math.random() * 0.07 };
  });
  return {
    // the first rock starts in a side gutter so it isn't hidden behind the project card
    x: onScreen ? w * (fromRight ? 0.8 + Math.random() * 0.08 : 0.1 + Math.random() * 0.08) : fromRight ? w + span : -span,
    // near rocks stay in the lower sky so they never sit on the headline
    y: h * (yFrac ?? (depth > 0.6 ? rand(0.45, 0.68) : rand(0.12, 0.7))),
    vx: (fromRight ? -1 : 1) * speed,
    vy: (Math.random() - 0.5) * speed * 0.35,
    R, cell,
    seed: Math.random() * 100,
    stretch: [1.5 + Math.random() * 0.35, 0.72 + Math.random() * 0.12, 0.85],  // oblong, potato-like
    spinY: (0.00008 + Math.random() * 0.00008) * (Math.random() < 0.5 ? -1 : 1),
    spinX: 0.00003 + Math.random() * 0.00004,
    tilt: Math.random() * Math.PI,
    craters,
    peak: 0.1 + depth * 0.3,
    depth,
  };
}

/* Radius of the rock surface in a given (object-space, unit) direction */
function surface(r: Rock, d: Vec) {
  const s = r.seed;
  let k = 1
    + 0.12 * Math.sin(2.1 * d[0] + s) * Math.sin(2.4 * d[1] + s * 1.3) * Math.sin(1.9 * d[2] + s * 0.7)
    + 0.05 * Math.sin(5.3 * d[0] + s * 2) * Math.sin(4.7 * d[1] - s) * Math.sin(5.1 * d[2] + s);
  for (const c of r.craters) {
    const cosA = d[0] * c.d[0] + d[1] * c.d[1] + d[2] * c.d[2];
    if (cosA > c.cos) {
      const t = (cosA - c.cos) / (1 - c.cos);              // 0 at the rim → 1 at the centre
      k -= c.depth * Math.sin(t * Math.PI * 0.5);
    }
  }
  return k;
}

export default function SpaceBackground({ theme }: { theme: "dark" | "light" }) {
  const dark = theme === "dark";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const ink = dark ? "255,255,255" : "20,18,15";
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-mono").trim() || "ui-monospace, Menlo, monospace";
    let w = 0, h = 0, raf = 0, last = 0, acc = 0, clock = 0;
    let stars: Star[] = [];
    let rocks: Rock[] = [];
    let nextRockAt = 0;
    let meteor: Meteor | null = null;
    let planet = { x: 0, y: 0 };
    let sat: Drifter | null = null;
    let nextSatAt = 3000 + Math.random() * 2000;
    let astro: Drifter | null = null;
    let nextAstroAt = 24000 + Math.random() * 24000;   // rare sighting: ~1–2 real minutes in (slowed clock)
    let nextMeteorAt = 3000 + Math.random() * 4000;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cells = (w / STAR_CELL) * (h / STAR_CELL);
      stars = Array.from({ length: Math.round(cells / 38) }, () => {
        const depth = Math.random() ** 2.6;
        return {
          x: Math.random() * w, y: Math.random() * h, bright: depth,
          speed: 0.0004 + Math.random() * 0.0009, phase: Math.random() * Math.PI * 2,
          vx: -(0.0008 + depth * 0.002),
        };
      });
      // one near (big) and one far (small) rock to start, on opposite sides
      // A loose trio: one big (near) and two smaller ones, spread to different corners of the sky
      if (!rocks.length) rocks = [
        makeRock(w, h, true, false, "big", rand(0.5, 0.62)),     // left gutter, low
        makeRock(w, h, true, true, "mid", rand(0.26, 0.34)),     // right gutter, upper-middle
        makeRock(w, h, true, false, "small", rand(0.16, 0.22)),  // left gutter, high
      ];
      planet = { x: w - 6 * 6 * 2.2 - 48, y: Math.max(150, h * 0.18) };   // ring fully on screen, below the satellite lane
      nextRockAt = clock + 40000 + Math.random() * 20000;
    };

    const glyph = (s: string, x: number, y: number, a: number) => {
      ctx.fillStyle = `rgba(${ink},${a.toFixed(3)})`;
      ctx.fillText(s, x, y);
    };

    const drawRock = (r: Rock, t: number) => {
      const ay = t * r.spinY, ax = r.tilt + t * r.spinX;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const reach = Math.ceil(r.R * 1.35);
      for (let row = -reach; row <= reach; row++) {
        for (let col = -reach; col <= reach; col++) {
          const u = col / r.R, v = row / r.R;
          if (u * u + v * v > 1.9) continue;
          // march the view ray front-to-back until it enters the rock
          for (let z = 1.4; z > -1.4; z -= 0.11) {
            // view → object space (inverse spin), then undo the stretch
            const x1 = u * cy - z * sy, z1 = u * sy + z * cy;
            const y2 = v * cx - z1 * sx, z2 = v * sx + z1 * cx;
            const ox = x1 / r.stretch[0], oy = y2 / r.stretch[1], oz = z2 / r.stretch[2];
            const len = Math.hypot(ox, oy, oz);
            const k = surface(r, [ox / (len || 1), oy / (len || 1), oz / (len || 1)]);
            if (len <= k) {
              const n = norm([u, v, z]);
              const lambert = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]);
              const shade = Math.min(1, Math.max(0, 0.08 + 0.92 * lambert + (k - 1) * 1.8));
              const idx = Math.round(shade * (ROCK_RAMP.length - 1));
              if (idx > 0) glyph(ROCK_RAMP[idx], r.x + col * r.cell, r.y + row * r.cell, (0.06 + shade * r.peak) * (dark ? 1 : 0.7));
              break;
            }
          }
        }
      }
    };

    /* A small, far-off ringed planet: banded sphere + tilted ring that passes in front of and behind it */
    const drawPlanet = (t: number) => {
      const R = 6, cell = 6, tilt = -0.32, ct = Math.cos(tilt), st = Math.sin(tilt);
      const L = norm([-0.75, -0.35, 0.55]);
      ctx.font = `${cell + 1}px ${mono}`;
      for (let row = -Math.ceil(R * 1.1); row <= Math.ceil(R * 1.1); row++) {
        for (let col = -Math.ceil(R * 2.4); col <= Math.ceil(R * 2.4); col++) {
          const u = col / R, v = row / R;
          const ru = u * ct + v * st, rv = -u * st + v * ct;
          const rr = Math.hypot(ru, rv / 0.26);
          const inRing = rr > 1.3 && rr < 2.15 && !(rr > 1.68 && rr < 1.8);   // with a Cassini-style gap
          const front = rv > 0;
          const onPlanet = u * u + v * v <= 1;
          const x = planet.x + col * cell, y = planet.y + row * cell;
          if (onPlanet && !(inRing && front)) {
            const z = Math.sqrt(Math.max(0, 1 - u * u - v * v));
            const lambert = Math.max(0, u * L[0] + v * L[1] + z * L[2]);
            const band = 0.5 + 0.5 * Math.sin(v * 7 + 0.7 * Math.sin(u * 3 + t * 0.00025));
            const shade = Math.min(1, 0.06 + lambert * (0.7 + 0.3 * band));
            const idx = Math.round(shade * (ROCK_RAMP.length - 1));
            if (idx > 0) glyph(ROCK_RAMP[idx], x, y, 0.06 + shade * 0.42);
          } else if (inRing) {
            // Ring material clumps; the pattern slowly orbits the planet so the ring visibly revolves
            const phi = Math.atan2(rv / 0.26, ru);
            const clump = 0.5 + 0.5 * Math.sin(phi * 5 - t * 0.00028 + rr * 3.5);
            const ch = clump > 0.72 ? "=" : clump > 0.38 ? "-" : clump > 0.18 ? "." : "";
            if (ch) glyph(ch, x, y, (front ? 0.5 : 0.24) * (0.45 + 0.55 * clump));
          }
        }
      }
    };

    /* Satellite and astronaut: drawn as real shapes on a small offscreen canvas, then converted
       to shaded ASCII (same treatment as the planet and rocks) so they read as the real thing. */
    const SPRITE = 140;
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SPRITE;
    const g = sprite.getContext("2d", { willReadFrequently: true })!;
    const SPRITE_RAMP = " .,:;-=+*#%@";
    const W = (a: number) => `rgba(255,255,255,${a})`;
    const RED = `rgba(${RED_RGB},1)`;
    const rr = (x: number, y: number, w2: number, h2: number, r: number) => { g.beginPath(); g.roundRect(x, y, w2, h2, r); };

    const satelliteShape = (t: number) => {
      // solar panels: bright cells with dark gaps
      for (const px of [-40, 13]) {
        rr(px, -8, 27, 16, 1.5); g.fillStyle = W(0.85); g.fill();
        g.fillStyle = "rgba(0,0,0,1)";
        for (let gx = px + 6.75; gx < px + 27; gx += 6.75) g.fillRect(gx - 0.8, -8, 1.6, 16);
        g.fillRect(px, -0.8, 27, 1.6);
      }
      // struts
      g.fillStyle = W(0.6); g.fillRect(-13, -1, 26, 2);
      // body with a darker window
      rr(-8, -10, 16, 20, 2.5); g.fillStyle = W(1); g.fill();
      rr(-5, -6, 10, 8, 1.5); g.fillStyle = W(0.35); g.fill();
      // dish
      g.beginPath(); g.ellipse(0, 15, 7, 3.5, 0, 0, Math.PI * 2); g.fillStyle = W(0.7); g.fill();
      // antenna + blinking light
      g.fillStyle = W(0.7); g.fillRect(-0.8, -19, 1.6, 9);
      if (Math.floor(t / 650) % 2 === 0) { g.beginPath(); g.arc(0, -21, 2.6, 0, Math.PI * 2); g.fillStyle = RED; g.fill(); }
    };

    const astronautShape = (t: number) => {
      const wave = Math.sin(t * 0.0018) * 0.35;
      rr(-11, -12, 22, 24, 5); g.fillStyle = W(0.45); g.fill();             // slim backpack
      g.fillStyle = W(0.8);
      rr(-8.5, 12, 7, 20, 3.5); g.fill(); rr(1.5, 12, 7, 18, 3.5); g.fill(); // legs
      g.fillStyle = W(0.6);
      rr(-9.5, 29, 9, 5, 2.5); g.fill(); rr(0.5, 27, 9, 5, 2.5); g.fill();    // boots
      g.fillStyle = W(0.75);
      g.save(); g.translate(-10, -3); g.rotate(0.3); rr(-3.5, 0, 7, 19, 3.5); g.fill(); g.restore();          // arm
      g.save(); g.translate(10, -5); g.rotate(-2.4 + wave); rr(-3.5, 0, 7, 19, 3.5); g.fill(); g.restore();   // waving arm
      rr(-10, -8, 20, 23, 7); g.fillStyle = W(0.9); g.fill();               // torso
      rr(-5, 0, 10, 7, 1.5); g.fillStyle = W(0.3); g.fill();                // chest panel
      g.beginPath(); g.arc(2.5, 3.5, 1.8, 0, Math.PI * 2); g.fillStyle = RED; g.fill();
      g.beginPath(); g.arc(0, -17, 11, 0, Math.PI * 2); g.fillStyle = W(0.95); g.fill();        // helmet
      g.beginPath(); g.ellipse(1.5, -17, 7.5, 6.5, 0, 0, Math.PI * 2); g.fillStyle = "rgba(0,0,0,1)"; g.fill();   // visor
      g.beginPath(); g.ellipse(-1.5, -20, 2.4, 1.4, -0.5, 0, Math.PI * 2); g.fillStyle = W(0.85); g.fill();     // glint
    };

    const asciiSprite = (shape: (t: number) => void, d: Drifter, t: number, scale: number, alpha: number, cell: number) => {
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.clearRect(0, 0, SPRITE, SPRITE);
      g.translate(SPRITE / 2, SPRITE / 2); g.rotate(d.rot); g.scale(scale, scale);
      shape(t);
      // Same lighting as the planet and rocks: lit from the top-left, falling into shadow bottom-right
      g.setTransform(1, 0, 0, 1, 0, 0);
      g.globalCompositeOperation = "source-atop";
      const lightGrad = g.createLinearGradient(SPRITE * 0.3, SPRITE * 0.3, SPRITE * 0.72, SPRITE * 0.72);
      lightGrad.addColorStop(0, "rgba(0,0,0,0)");
      lightGrad.addColorStop(1, "rgba(0,0,0,0.75)");
      g.fillStyle = lightGrad; g.fillRect(0, 0, SPRITE, SPRITE);
      g.globalCompositeOperation = "source-over";
      const px = g.getImageData(0, 0, SPRITE, SPRITE).data;
      ctx.font = `${cell + 1}px ${mono}`;
      const half = SPRITE / 2;
      for (let cy = 0; cy < SPRITE; cy += cell) {
        for (let cx = 0; cx < SPRITE; cx += cell) {
          // average the cell (4 samples) → brightness and redness
          let lum = 0, red = 0;
          for (const [ox, oy] of [[1, 1], [cell - 2, 1], [1, cell - 2], [cell - 2, cell - 2]]) {
            const i = ((cy + oy) * SPRITE + (cx + ox)) * 4, a = px[i + 3] / 255;
            lum += ((px[i] + px[i + 1] + px[i + 2]) / 765) * a;
            red += px[i] > 70 && px[i] > px[i + 1] * 1.8 ? a : 0;   // red survives the shading
          }
          lum /= 4; red /= 4;
          const x = d.x + cx + cell / 2 - half, y = d.y + cy + cell / 2 - half;
          if (red > 0.25) {
            ctx.fillStyle = `rgba(${RED_RGB},${Math.min(1, alpha + 0.3).toFixed(3)})`;
            ctx.fillText("@", x, y);
            continue;
          }
          const tone = Math.pow(lum, 1.35) * 0.85;                    // keep it airy: few solid @s
          const idx = Math.round(tone * (SPRITE_RAMP.length - 1));
          if (idx > 0) glyph(SPRITE_RAMP[idx], x, y, (0.08 + tone * 0.8) * alpha);
        }
      }
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.textAlign = "center"; ctx.textBaseline = "middle";

      // Stars
      ctx.font = `11px ${mono}`;
      for (const s of stars) {
        if (dt) { s.x += s.vx * dt; if (s.x < -STAR_CELL) { s.x = w + STAR_CELL; s.y = Math.random() * h; } }
        const wave = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(t * s.speed + s.phase);
        const level = s.bright * 0.7 + wave * 0.3 * (0.3 + s.bright);
        const idx = Math.min(STAR_RAMP.length - 1, Math.floor(level * STAR_RAMP.length));
        glyph(STAR_RAMP[idx], Math.round(s.x / STAR_CELL) * STAR_CELL, Math.round(s.y / STAR_CELL) * STAR_CELL, (dark ? 0.22 : 0.14) + level * (dark ? 0.55 : 0.3));
      }

      // Far-off oddities sit behind the asteroids
      drawPlanet(t);

      if (!reducedMotion) {
        // Satellite: crosses the open band above the card, light blinking red
        if (!sat && t > nextSatAt) {
          const ltr = Math.random() < 0.5;
          sat = { x: ltr ? -60 : w + 60, y: rand(84, 94), vx: (ltr ? 1 : -1) * 0.03, vy: 0, rot: rand(-0.15, 0.15), vr: rand(-0.00003, 0.00003) };   // its own lane above the planet
        }
        if (sat) {
          if (dt) { sat.x += sat.vx * dt; sat.y += sat.vy * dt; sat.rot += sat.vr * dt; }
          asciiSprite(satelliteShape, sat, t, 1.2, 0.6, 4);
          if (sat.x < -80 || sat.x > w + 80) { sat = null; nextSatAt = t + rand(12000, 20000); }
        }

        // Astronaut: floats up a side gutter, tumbling slowly
        if (!astro && t > nextAstroAt) {
          const left = Math.random() < 0.5;
          // vy is set so the float up the gutter takes ~2 real minutes
          astro = { x: w * (left ? rand(0.04, 0.15) : rand(0.85, 0.96)), y: h * 0.78, vx: rand(-0.002, 0.002), vy: -(h * 0.74) / (120000 * TIME_SCALE), rot: rand(-0.4, 0.4), vr: rand(0.00015, 0.0003) * (Math.random() < 0.5 ? -1 : 1) };
        }
        if (astro) {
          if (dt) { astro.x += astro.vx * dt; astro.y += astro.vy * dt; astro.rot += astro.vr * dt; }
          asciiSprite(astronautShape, astro, t, 0.75, 0.6, 3);   // small and far: finer glyphs keep it readable
          if (astro.y < h * 0.04) { astro = null; nextAstroAt = t + rand(120000, 240000) * TIME_SCALE; }   // back every 2–4 real minutes
        }
      }

      // Asteroids, far to near so closer rocks paint over distant ones
      rocks.sort((a, b) => a.depth - b.depth);
      for (const r of rocks) {
        if (dt) { r.x += r.vx * dt; r.y += r.vy * dt; }
        ctx.font = `${r.cell + 1}px ${mono}`;
        drawRock(r, t);
      }
      if (!reducedMotion) {
        const pad = 200;
        rocks = rocks.filter((r) => r.x > -pad - r.R * r.cell * 1.6 && r.x < w + pad + r.R * r.cell * 1.6);
        if (rocks.length < 3 && t > nextRockAt) {   // up to three, only ever one big one
          const hasBig = rocks.some((r) => r.depth > 0.6);
          const kind: RockKind = !hasBig && Math.random() < 0.4 ? "big" : Math.random() < 0.5 ? "small" : "mid";
          // keep them far apart: pick the height that's furthest from every rock already out there
          let bestY = 0.4, bestGap = -1;
          for (let k = 0; k < 10; k++) {
            const yf = kind === "big" ? rand(0.45, 0.68) : rand(0.12, 0.7);
            const gap = Math.min(...rocks.map((r) => Math.abs(r.y / h - yf)), 1);
            if (gap > bestGap) { bestGap = gap; bestY = yf; }
          }
          rocks.push(makeRock(w, h, false, undefined, kind, bestY));
          nextRockAt = t + 40000 + Math.random() * 20000;
        }
      }

      // ASCII shooting star (dark theme only): a continuous streak of glyphs, head first
      if (!dark || reducedMotion) return;
      ctx.font = `bold 14px ${mono}`;
      if (!meteor && t > nextMeteorAt) {
        // Route through open sky, not behind the project card: either skim the band above it,
        // or drop diagonally down one of the side gutters.
        const lane = Math.random();
        const deg = lane < 0.5 ? 166 + Math.random() * 8 : lane < 0.75 ? 118 + Math.random() * 12 : 50 + Math.random() * 12;
        const ang = (Math.PI / 180) * deg;
        meteor = lane < 0.5
          ? { x: w * (0.7 + Math.random() * 0.25), y: h * (0.09 + Math.random() * 0.06), dx: Math.cos(ang), dy: Math.sin(ang), dist: 0, life: 560 + Math.random() * 300 }
          : lane < 0.75
          ? { x: w * (0.86 + Math.random() * 0.1), y: h * (0.1 + Math.random() * 0.2), dx: Math.cos(ang), dy: Math.sin(ang), dist: 0, life: 380 + Math.random() * 160 }
          : { x: w * (0.04 + Math.random() * 0.1), y: h * (0.1 + Math.random() * 0.2), dx: Math.cos(ang), dy: Math.sin(ang), dist: 0, life: 380 + Math.random() * 160 };
      }
      if (meteor && dt) {
        meteor.dist += (0.24 / TIME_SCALE) * dt;                     // ~240 px/s: still a streak, just calmer
        const p = Math.min(meteor.dist / meteor.life, 1);
        const fade = Math.sin(Math.PI * p);
        const hx = meteor.x + meteor.dx * meteor.dist, hy = meteor.y + meteor.dy * meteor.dist;
        TRAIL.forEach((ch, k) => {
          const back = k * 10;                                        // tightly packed so it reads as one streak
          if (back > meteor!.dist) return;
          glyph(ch, hx - meteor!.dx * back, hy - meteor!.dy * back, (k === 0 ? 1 : 0.85) * fade * (1 - k / (TRAIL.length + 1)));
        });
        if (p >= 1) { meteor = null; nextMeteorAt = t + 7000 + Math.random() * 8000; }
      }
    };

    const frame = 1000 / FPS;
    const loop = (now: number) => {
      const dt = last ? Math.min(now - last, 250) : 0;
      last = now; acc += dt; clock += dt * TIME_SCALE;
      if (acc >= frame || !dt) { draw(clock, acc * TIME_SCALE); acc = 0; }
      raf = requestAnimationFrame(loop);
    };

    seed();
    if (reducedMotion) draw(0, 0);
    else raf = requestAnimationFrame(loop);

    const ro = new ResizeObserver(() => { seed(); if (reducedMotion) draw(0, 0); });
    ro.observe(canvas);
    const onVis = () => {
      if (reducedMotion) return;
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf) { last = 0; acc = 0; raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [dark, reducedMotion]);

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0, background: dark ? "#000" : "#efebe4" }}>
      {/* Masked out of the nav and rail/footer rows: glyphs next to type read as stray punctuation */}
      <canvas ref={canvasRef} style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        maskImage: "linear-gradient(to bottom, transparent 46px, #000 64px, #000 calc(100% - 172px), transparent calc(100% - 156px))",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 46px, #000 64px, #000 calc(100% - 172px), transparent calc(100% - 156px))",
      }} />
    </div>
  );
}
