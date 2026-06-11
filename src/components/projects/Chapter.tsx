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
  const videos = chapter.media?.filter(m => m.type === "video") ?? [];
  const hasMedia = (chapter.media?.length ?? 0) > 0;

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
        className="text-[11px] tracking-[0.22em] uppercase text-white/45"
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
                {videos.map((m, i) => <VideoTile key={i} media={m} />)}
              </>
          }
        </>
      ) : (
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
      className="mt-8 w-full rounded-sm flex items-center justify-center gap-8 px-10 py-6"
      style={{ background: "#f5f5f5" }}
    >
      {items.map((m, i) => {
        const dims = { maxWidth: 230, maxHeight: 460, width: "auto", height: "auto", objectFit: "contain" as const, display: "block" as const, cursor: "none" as const };
        return (
          <div key={i} className="flex flex-col items-center gap-3">
            {m.type === "video" ? (
              <LazyVideo src={m.src} onClick={() => lb?.open(m)} style={dims} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={encodeURI(m.src)} alt={m.caption ?? ""} onClick={() => lb?.open(m)} data-cursor="ZOOM" data-cursor-variant="zoom" style={dims} />
            )}
            {m.caption && (
              <p className="mt-1 text-[12px] text-white/50 text-center" style={{ fontFamily: "var(--font-mono)" }}>
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
          data-cursor="ZOOM"
          data-cursor-variant="zoom"
          className="h-auto block rounded-sm mx-auto cursor-none"
          style={{ width: "auto", maxWidth: "100%", maxHeight: 420 }}
        />
        {media.caption && (
          <figcaption
            className="mt-3 text-[12px] text-white/50 text-center"
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
          data-cursor="ZOOM"
          data-cursor-variant="zoom"
          className="w-full h-full cursor-none"
          style={{ objectFit: fit }}
        />
      </div>
      {media.caption && (
        <figcaption
          className="mt-3 text-[12px] text-white/50"
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
          className="mt-3 text-[12px] text-white/50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
