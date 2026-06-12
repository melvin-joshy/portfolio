"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Chapter as ChapterT, Media } from "@/data/projects";
import { WireBox, WireNote } from "./Wireframe";
import { useLightbox } from "./Lightbox";

const EASE = [0.22, 1, 0.36, 1] as const;

/* Lazy autoplay video — no download until it scrolls near the viewport.
   Keeps these (some are large MP4s) off the initial page load. */
function LazyVideo({
  src,
  poster,
  className,
  style,
  onClick,
}: {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (inView) ref.current?.play().catch(() => {});
  }, [inView]);

  return (
    <video
      ref={ref}
      src={inView ? encodeURI(src) : undefined}
      poster={poster ? encodeURI(poster) : undefined}
      autoPlay
      loop
      muted
      playsInline
      preload="none"
      onClick={onClick}
      data-cursor="ZOOM"
      data-cursor-variant="zoom"
      className={className}
      style={style}
    />
  );
}

export function Chapter({ chapter, index, id }: { chapter: ChapterT; index: number; id?: string }) {
  const images = chapter.media?.filter(m => m.type !== "video") ?? [];
  const phoneVideos = chapter.media?.filter(m => m.type === "video" && m.mockup === "phone") ?? [];
  const videos = chapter.media?.filter(m => m.type === "video" && m.mockup !== "phone") ?? [];
  /* undefined = no media defined yet (show wireframe placeholder)
     []        = intentionally text-only (no wireframe)            */
  const hasMedia = (chapter.media?.length ?? 0) > 0;
  const mediaExplicitlyEmpty = Array.isArray(chapter.media) && chapter.media.length === 0;

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className="scroll-mt-24 border-t py-14"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <p
        className="text-[11px] tracking-[0.22em] uppercase text-white/58"
        style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
      >
        {chapter.eyebrow ?? `Chapter ${String(index + 1).padStart(2, "0")}`}
      </p>
      <h2
        className="mt-4 text-[clamp(22px,2.4vw,28px)] leading-[1.2] text-white"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 500, letterSpacing: "-0.005em" }}
      >
        {chapter.title}
      </h2>
      <p
        className="mt-5 text-[17px] leading-[1.7] text-white/68"
        style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
      >
        {chapter.body}
      </p>

      {hasMedia ? (
        <>
          {/* Dual-phone tray — 1 image + 1 tall video, or 2 tall images */}
          {isDualPhone(chapter.media ?? [])
            ? <DualPhoneTray items={chapter.media ?? []} />
            : <>
                {images.length > 0 && (
                  <div className={`mt-8 grid gap-5 ${images.length > 1 && images.every(m => m.aspect) ? "md:grid-cols-2" : ""}`}>
                    {images.map((m, i) => <ImageTile key={i} media={m} />)}
                  </div>
                )}
                {phoneVideos.map((m, i) => <PhoneVideoTile key={i} media={m} />)}
                {videos.map((m, i) => <VideoTile key={i} media={m} />)}
              </>
          }
        </>
      ) : mediaExplicitlyEmpty ? null : (
        <>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <WireBox aspect="4/3" label={`Ch. ${String(index + 1).padStart(2, "0")} · A`} hint="screen / sketch / data" />
            <WireBox aspect="4/3" label={`Ch. ${String(index + 1).padStart(2, "0")} · B`} hint="annotation / detail" />
          </div>
          <WireNote>add <code>media[]</code> to this chapter in <code>src/data/projects.ts</code></WireNote>
        </>
      )}
    </motion.section>
  );
}

/* ── Dual-phone detector — 2 tall+contain items (image or video) ── */
function isDualPhone(items: Media[]) {
  return items.length === 2 && items.every(m => m.aspect === "tall" && m.fit === "contain");
}

/* ── Dual-phone tray — shared light bg, image or video per slot ── */
function DualPhoneTray({ items }: { items: Media[] }) {
  const lb = useLightbox();
  return (
    <div
      className="mt-8 w-full rounded-sm flex items-center justify-center gap-3 px-3 py-5 sm:gap-8 sm:px-10 sm:py-6"
      style={{ background: "#f5f5f5" }}
    >
      {items.map((m, i) => {
        // Responsive: each phone caps at 40vw on mobile so two fit side-by-side, 220px on desktop.
        const dims = { maxWidth: "min(220px, 40vw)", maxHeight: 460, width: "auto", height: "auto", objectFit: "contain" as const, display: "block" as const, cursor: "none" as const };
        return (
          <div key={i} className="flex min-w-0 flex-col items-center gap-3">
            {m.type === "video" ? (
              <LazyVideo src={m.src} onClick={() => lb?.open(m)} style={dims} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={encodeURI(m.src)} alt={m.caption ?? ""} onClick={() => lb?.open(m)} loading="lazy" decoding="async" data-cursor="ZOOM" data-cursor-variant="zoom" style={dims} />
            )}
            {m.caption && (
              <p className="mt-1 text-[10px] sm:text-[12px] text-black/55 text-center" style={{ fontFamily: "var(--font-mono)" }}>
                {m.caption}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Image tile ── */
function ImageTile({ media }: { media: Media }) {
  const lb = useLightbox();
  const fit = media.fit ?? "cover";
  const ratio = media.aspect === "tall" ? "3/4" : media.aspect === "square" ? "1/1" : "16/10";

  /* No aspect set → image is pre-composed/already sized: render at its natural size,
     capped to the column and centered. No forced box, no padding. */
  if (!media.aspect) {
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={encodeURI(media.src)}
          alt={media.caption ?? ""}
          onClick={() => lb?.open(media)}
          loading="lazy"
          decoding="async"
          data-cursor="ZOOM"
          data-cursor-variant="zoom"
          className="h-auto block rounded-sm mx-auto cursor-none"
          style={{ width: "auto", maxWidth: "100%", maxHeight: 420 }}
        />
        {media.caption && (
          <figcaption
            className="mt-3 text-[12px] text-white/62 text-center"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {media.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure>
      <div
        className="overflow-hidden rounded-sm w-full flex items-center justify-center"
        style={{
          aspectRatio: ratio,
          background: fit === "contain" ? "#f5f5f5" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={encodeURI(media.src)}
          alt={media.caption ?? ""}
          onClick={() => lb?.open(media)}
          loading="lazy"
          decoding="async"
          data-cursor="ZOOM"
          data-cursor-variant="zoom"
          className="w-full h-full cursor-none"
          style={{ objectFit: fit }}
        />
      </div>
      {media.caption && (
        <figcaption
          className="mt-3 text-[12px] text-white/62"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Phone mockup video tile ── */
function PhoneVideoTile({ media }: { media: Media }) {
  return (
    <figure className="mt-8">
      {/* Scene background */}
      <div style={{
        width: "100%",
        borderRadius: 12,
        background: media.videoBg
          ? `url("${encodeURI(media.videoBg)}") center/cover no-repeat`
          : "radial-gradient(ellipse 90% 70% at 50% 45%, #1c1c2e 0%, #0d0d18 60%, #060608 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "52px 24px 44px",
      }}>
        {/* Phone outer shell */}
        <div style={{
          position: "relative",
          width: "min(260px, 68vw)",
          flexShrink: 0,
        }}>
          {/* Left side buttons — volume up / down / silent */}
          <div style={{ position: "absolute", left: -4, top: 88, width: 4, height: 34, background: "#2a2a2a", borderRadius: "3px 0 0 3px", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: -4, top: 132, width: 4, height: 34, background: "#2a2a2a", borderRadius: "3px 0 0 3px", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.08)" }} />
          <div style={{ position: "absolute", left: -4, top: 72, width: 4, height: 10, background: "#2a2a2a", borderRadius: "3px 0 0 3px", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.08)" }} />
          {/* Right side button — power */}
          <div style={{ position: "absolute", right: -4, top: 108, width: 4, height: 52, background: "#2a2a2a", borderRadius: "0 3px 3px 0", boxShadow: "inset -1px 0 0 rgba(255,255,255,0.08)" }} />

          {/* Phone body */}
          <div style={{
            background: "linear-gradient(160deg, #2a2a2a 0%, #1a1a1a 40%, #111 100%)",
            borderRadius: 44,
            padding: 10,
            boxShadow:
              "0 0 0 1px rgba(255,255,255,0.12), " +
              "0 0 0 1.5px rgba(0,0,0,0.8), " +
              "0 32px 80px -12px rgba(0,0,0,0.9), " +
              "0 8px 24px -4px rgba(0,0,0,0.7), " +
              "inset 0 1px 0 rgba(255,255,255,0.07)",
          }}>
            {/* Screen bezel */}
            <div style={{
              borderRadius: 36,
              overflow: "hidden",
              background: "#000",
              position: "relative",
              aspectRatio: "9 / 19.5",
            }}>
              {/* Video content */}
              <LazyVideo
                src={media.src}
                poster={media.poster}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />


              {/* Screen glare — top-left specular */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 38%)",
                pointerEvents: "none",
                zIndex: 5,
                borderRadius: 36,
              }} />
            </div>
          </div>

          {/* Subtle phone glow underneath */}
          <div style={{
            position: "absolute",
            bottom: -24,
            left: "10%",
            right: "10%",
            height: 40,
            background: "rgba(120, 140, 255, 0.12)",
            filter: "blur(20px)",
            borderRadius: "50%",
            pointerEvents: "none",
          }} />
        </div>
      </div>

      {media.caption && (
        <figcaption
          className="mt-3 text-[12px] text-white/62 text-center"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ── Video tile — full-width, autoplay muted loop ── */
function VideoTile({ media }: { media: Media }) {
  const lb = useLightbox();
  const fit = media.fit ?? "cover";
  const ratio = media.aspect === "tall" ? "9/16" : media.aspect === "square" ? "1/1" : "16/9";
  const isTall = media.aspect === "tall";
  return (
    <figure className="mt-8">
      {/* Full-width background strip */}
      <div
        className="w-full rounded-sm flex items-center justify-center py-10"
        style={{ background: "#ffffff" }}
      >
        {/* Phone-width inner container */}
        <div
          style={isTall ? { width: "100%", maxWidth: 320 } : { width: "100%", aspectRatio: ratio }}
        >
          <LazyVideo
            src={media.src}
            poster={media.poster}
            onClick={() => lb?.open(media)}
            className="w-full block cursor-none"
            style={{ aspectRatio: ratio, objectFit: fit }}
          />
        </div>
      </div>
      {media.caption && (
        <figcaption
          className="mt-3 text-[12px] text-white/62"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
