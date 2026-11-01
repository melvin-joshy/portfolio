"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { CarouselSlide, ClientProject, Story, StoryImpact, StorySection, StorySlot } from "@/data/projects";
import { ChapterTOC, type TOCItem } from "./ChapterTOC";
import { LightboxProvider, useLightbox, STAGE_BG } from "./Lightbox";

/* ───────────────── ClientStoryBody ─────────────────
 * Story-style client case study driven by `project.story`.
 *
 * One reading column (1040px). Headings, body copy and every visual share the
 * same left and right edges, so the eye never has to re-find the start of a
 * line. Screenshots sit on a pale blue stage (STAGE_BG) sampled from the cover
 * loop; images that already carry their own background opt out with `bare`.
 * ──────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;
const IS_DEV = process.env.NODE_ENV !== "production";

type Fonts = { text: string; mono: string };

const FONTS: Fonts = {
  text: "var(--font-geist), var(--font-inter)",
  mono: "var(--font-geist-mono), var(--font-mono)",
};

const COLUMN = "mx-auto w-full max-w-[1040px]";

export function ClientStoryBody({ project }: { project: ClientProject & { story: Story } }) {
  const { story } = project;
  const f = FONTS;
  const tocItems: TOCItem[] = [
    { id: "cover", label: "Overview" },
    ...story.sections.map((s) => ({ id: s.id, label: s.nav })),
  ];
  const meta = [
    { label: "Company", value: project.client },
    { label: "Role", value: project.role },
    { label: "Scope", value: project.scope.join(" · ") },
    { label: "Year", value: project.year },
  ];

  return (
    <LightboxProvider>
      <div className="px-6 pb-32 pt-12 md:px-10">
        <ChapterTOC title={project.client} items={tocItems} serifTitle={false} />

        <header id="cover" className={`${COLUMN} scroll-mt-24`}>
          <BackButton fonts={f} />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mt-10"
          >
            <Label fonts={f}>
              {project.client} · {project.tag}
            </Label>
            <h1
              className="mt-5 text-[clamp(36px,4.6vw,56px)] leading-[1.06] text-white"
              style={{ fontFamily: f.text, fontWeight: 500, letterSpacing: "-0.025em" }}
            >
              {story.cover.headline}
            </h1>
            <p
              className="mt-6 text-[16px] leading-[1.6] text-white/65"
              style={{ fontFamily: f.text, fontWeight: 400 }}
            >
              {story.cover.descriptor}
            </p>
          </motion.div>
        </header>

        <SlotFrame slot={story.cover.slot} dir={story.assetDir} fonts={f} eager className={`mt-12 ${COLUMN}`} />

        <dl
          className={`${COLUMN} mt-16 grid grid-cols-2 gap-x-14 gap-y-9 border-y py-8 md:grid-cols-4`}
          style={{ borderColor: "rgba(255,255,255,0.08)" }}
        >
          {meta.map((m) => (
            <div key={m.label}>
              <dt
                className="text-[10px] tracking-[0.24em] uppercase text-white/40"
                style={{ fontFamily: f.mono, fontWeight: 500 }}
              >
                {m.label}
              </dt>
              <dd className="mt-3 text-[14px] leading-[1.45] text-white/85" style={{ fontFamily: f.text }}>
                <Flagged text={m.value} fonts={f} />
              </dd>
            </div>
          ))}
        </dl>

        {story.impact && <ImpactStrip impact={story.impact} fonts={f} />}

        {story.sections.map((s) => (
          <StorySectionBlock key={s.id} section={s} dir={story.assetDir} fonts={f} />
        ))}
      </div>
    </LightboxProvider>
  );
}

/* Intro paragraphs and the three operational metrics, right after the cover
   credits. The stat value sits above its label visually, but the label comes
   first in the markup so the <dl> stays valid (dt before dd). */
function ImpactStrip({ impact, fonts }: { impact: StoryImpact; fonts: Fonts }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className={`${COLUMN} mt-20`}
    >
      <p className="text-[16px] leading-[1.62] text-white/65" style={{ fontFamily: fonts.text, fontWeight: 400 }}>
        {impact.body}
      </p>

      {impact.body2 && (
        <p
          className="mt-4 text-[16px] leading-[1.62] text-white/65"
          style={{ fontFamily: fonts.text, fontWeight: 400 }}
        >
          {impact.body2}
        </p>
      )}

      <dl
        className="mt-9 grid grid-cols-1 gap-x-10 gap-y-8 border-t pt-8 sm:grid-cols-3"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        {impact.stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse">
            <dt
              className="mt-2 text-[13px] leading-[1.4] text-white/50"
              style={{ fontFamily: fonts.text, fontWeight: 400 }}
            >
              {stat.label}
            </dt>
            <dd
              className="text-[clamp(32px,4vw,44px)] leading-[1.05] text-white"
              style={{ fontFamily: fonts.text, fontWeight: 500, letterSpacing: "-0.02em" }}
            >
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );
}

function StorySectionBlock({ section, dir, fonts }: { section: StorySection; dir: string; fonts: Fonts }) {
  const slots = section.slots ?? [];
  const bodyParaClass = "text-[16px] leading-[1.62] text-white/65";

  return (
    <>
      <motion.section
        id={section.id}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: EASE }}
        className={`${COLUMN} mt-28 scroll-mt-24`}
      >
        <h2
          className="text-[clamp(24px,2.5vw,33px)] leading-[1.12] text-white"
          style={{ fontFamily: fonts.text, fontWeight: 500, letterSpacing: "-0.02em" }}
        >
          {section.title}
        </h2>

        {section.body &&
          section.body.split(/\n\n+/).map((para, i) => (
            <p
              key={`b1-${i}`}
              className={`mt-5 ${bodyParaClass}`}
              style={{ fontFamily: fonts.text, fontWeight: 400 }}
            >
              <Flagged text={para} fonts={fonts} />
            </p>
          ))}

        {section.body2 &&
          section.body2.split(/\n\n+/).map((para, i) => (
            <p
              key={`b2-${i}`}
              className={`mt-4 ${bodyParaClass}`}
              style={{ fontFamily: fonts.text, fontWeight: 400 }}
            >
              <Flagged text={para} fonts={fonts} />
            </p>
          ))}

        {section.facts && section.facts.length > 0 && (
          <dl
            className="mt-9 grid gap-x-10 gap-y-6 border-t pt-6 sm:grid-cols-3"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {section.facts.map((fact) => (
              <div key={fact.label}>
                <dt
                  className="text-[10px] tracking-[0.24em] uppercase text-white/40"
                  style={{ fontFamily: fonts.mono, fontWeight: 500 }}
                >
                  {fact.label}
                </dt>
                <dd className="mt-2 text-[14px] leading-[1.5] text-white/80" style={{ fontFamily: fonts.text }}>
                  <Flagged text={fact.value} fonts={fonts} />
                </dd>
              </div>
            ))}
          </dl>
        )}

        {section.list && section.list.length > 0 && (
          <>
            {IS_DEV && section.listNote && (
              <p className="mt-8 text-[12px] text-amber-300/80" style={{ fontFamily: fonts.mono }}>
                {section.listNote}
              </p>
            )}
            <ul className="mt-6 space-y-4">
              {section.list.map((item, i) => (
                <li
                  key={i}
                  className="border-l pl-5 text-[17px] leading-[1.6] text-white/75"
                  style={{ borderColor: "rgba(255,255,255,0.18)", fontFamily: fonts.text, fontWeight: 400 }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </motion.section>

      {slots.length > 0 &&
        (section.slotLayout === "gallery" ? (
          <SlotGallery slots={slots} dir={dir} fonts={fonts} />
        ) : (
          slots.map((slot) => (
            <SlotFrame key={slot.file} slot={slot} dir={dir} fonts={fonts} className={`mt-10 ${COLUMN}`} />
          ))
        ))}

      {section.carousel && (
        <div className={`mt-10 ${COLUMN}`}>
          <StoryCarousel dir={section.carousel.assetDir ?? dir} slides={section.carousel.slides} fonts={fonts} />
        </div>
      )}
    </>
  );
}

/* ───────────────── Carousel ─────────────────
 * Dependency-free: native CSS scroll-snap drives the drag/swipe and the
 * snap points, a ResizeObserver-free scroll listener drives the index, and
 * prev/next just scroll the container — so native momentum, trackpad and
 * touch behaviour all come for free instead of being reimplemented. */
function StoryCarousel({ dir, slides, fonts }: { dir: string; slides: CarouselSlide[]; fonts: Fonts }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.4,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    children.forEach((child, i) => {
      const dist = Math.abs(child.offsetLeft + child.offsetWidth / 2 - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setIndex(closest);
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const child = el.children[i] as HTMLElement | undefined;
    if (!child) return;
    el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused || !inView || slides.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => goTo((index + 1) % slides.length), 4500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, inView, index, slides.length]);

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        onScroll={onScroll}
        role="group"
        aria-roledescription="carousel"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") goTo(Math.min(index + 1, slides.length - 1));
          if (e.key === "ArrowLeft") goTo(Math.max(index - 1, 0));
        }}
        className="flex gap-5 overflow-x-auto scroll-pl-0 pb-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
        }}
      >
        {slides.map((slide, i) => (
          <figure
            key={slide.file}
            aria-hidden={i !== index}
            className="shrink-0"
            style={{ scrollSnapAlign: "start", width: "min(84%, 900px)" }}
          >
            <CarouselSlideMedia slide={slide} dir={dir} fonts={fonts} />
            <figcaption className="mt-3.5">
              <span
                className="text-[11px] tracking-[0.18em] uppercase text-white/50"
                style={{ fontFamily: fonts.mono, fontWeight: 500 }}
              >
                {slide.label}
              </span>
              <p className="mt-1.5 text-[14px] leading-[1.5] text-white/58" style={{ fontFamily: fonts.text }}>
                {slide.caption}
              </p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => goTo(Math.max(index - 1, 0))}
          disabled={index === 0}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 before:absolute before:-inset-[6px] before:content-[''] transition-colors duration-150 hover:border-white/35 hover:text-white disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:text-white/70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => goTo(Math.min(index + 1, slides.length - 1))}
          disabled={index === slides.length - 1}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/70 before:absolute before:-inset-[6px] before:content-[''] transition-colors duration-150 hover:border-white/35 hover:text-white disabled:opacity-25 disabled:hover:border-white/15 disabled:hover:text-white/70"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
        <span className="text-[11px] tabular-nums text-white/35" style={{ fontFamily: fonts.mono }}>
          {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function CarouselSlideMedia({ slide, dir, fonts }: { slide: CarouselSlide; dir: string; fonts: Fonts }) {
  const lb = useLightbox();
  const src = `/${dir}/${slide.file}`;

  if (!slide.ready) {
    return <SlotPlaceholder slot={{ ...slide, kind: "image", aspect: "4/3" }} aspect="4/3" fonts={fonts} />;
  }
  return (
    <div
      className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm p-5 md:p-8"
      style={{ background: STAGE_BG }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(src)}
        alt={slide.alt}
        onClick={() => lb?.open({ src, caption: slide.caption, stage: true })}
        loading="lazy"
        decoding="async"
        data-cursor="ZOOM"
        data-cursor-variant="zoom"
        className="max-h-full max-w-full cursor-none rounded-sm object-contain shadow-[0_20px_60px_-24px_rgba(10,25,50,0.5)]"
      />
    </div>
  );
}

/* First slot at full column width, the rest in pairs below it. */
function SlotGallery({ slots, dir, fonts }: { slots: StorySlot[]; dir: string; fonts: Fonts }) {
  const [first, ...rest] = slots;
  return (
    <>
      <SlotFrame slot={first} dir={dir} fonts={fonts} className={`mt-10 ${COLUMN}`} />
      <div className={`${COLUMN} mt-6 grid gap-6 md:grid-cols-2`}>
        {rest.map((slot) => (
          <SlotMedia key={slot.file} slot={slot} dir={dir} fonts={fonts} />
        ))}
      </div>
    </>
  );
}

function SlotFrame({
  slot,
  dir,
  fonts,
  eager = false,
  className = "",
}: {
  slot: StorySlot;
  dir: string;
  fonts: Fonts;
  eager?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: EASE }}
      className={className}
    >
      <SlotMedia slot={slot} dir={dir} fonts={fonts} eager={eager} />
    </motion.div>
  );
}

/* ═══════════════════ Shared ═══════════════════ */

function BackButton({ fonts }: { fonts: Fonts }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      <Link
        href="/"
        className="group inline-flex min-h-9 items-center gap-2 text-[13px] text-white/75 transition-colors duration-200 hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
        style={{ fontFamily: fonts.text }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        >
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
        <span>All work</span>
      </Link>
    </motion.div>
  );
}

function Label({ fonts, children }: { fonts: Fonts; children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] tracking-[0.2em] uppercase text-white/55"
      style={{ fontFamily: fonts.mono, fontWeight: 500 }}
    >
      {children}
    </p>
  );
}

function SlotMedia({
  slot,
  dir,
  fonts,
  eager = false,
}: {
  slot: StorySlot;
  dir: string;
  fonts: Fonts;
  eager?: boolean;
}) {
  const lb = useLightbox();
  const src = `/${dir}/${slot.file}`;
  const poster = slot.poster ? `/${dir}/${slot.poster}` : undefined;
  const aspect = slot.aspect ?? "16/10";

  return (
    <figure>
      {!slot.ready ? (
        <SlotPlaceholder slot={slot} aspect={aspect} fonts={fonts} />
      ) : slot.kind === "video" ? (
        <StoryVideo src={src} poster={poster} alt={slot.alt} aspect={aspect} eager={eager} />
      ) : slot.kind === "embed" ? (
        <iframe
          src={encodeURI(src)}
          title={slot.alt}
          loading={eager ? "eager" : "lazy"}
          scrolling="no"
          className="block w-full overflow-hidden rounded-sm border-0"
          style={{ aspectRatio: aspect, background: "transparent" }}
        />
      ) : slot.bare ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={encodeURI(src)}
          alt={slot.alt}
          onClick={() => lb?.open({ src, caption: slot.caption })}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          data-cursor="ZOOM"
          data-cursor-variant="zoom"
          className="block w-full cursor-none rounded-sm"
          style={{ aspectRatio: aspect, objectFit: "contain" }}
        />
      ) : (
        <div
          className="flex w-full items-center justify-center overflow-hidden rounded-sm p-6 md:p-10"
          style={{ aspectRatio: aspect, background: STAGE_BG }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={encodeURI(src)}
            alt={slot.alt}
            onClick={() => lb?.open({ src, caption: slot.caption, stage: true })}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            data-cursor="ZOOM"
            data-cursor-variant="zoom"
            className="max-h-full max-w-full cursor-none rounded-sm object-contain shadow-[0_20px_60px_-24px_rgba(10,25,50,0.5)]"
          />
        </div>
      )}
      {slot.caption && (
        <figcaption className="mt-3.5 text-[12px] text-white/50" style={{ fontFamily: fonts.mono }}>
          {slot.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* Reserved visual. Filename + production brief are dev-only so they can
   never leak into the published page. */
function SlotPlaceholder({ slot, aspect, fonts }: { slot: StorySlot; aspect: string; fonts: Fonts }) {
  return (
    <div
      role="img"
      aria-label={slot.alt}
      className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-sm px-6 text-center"
      style={{
        aspectRatio: aspect,
        border: "1px dashed rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.016)",
      }}
    >
      <p
        className="relative inline-flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-white/40"
        style={{ fontFamily: fonts.mono }}
      >
        {slot.kind === "video" && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        )}
        {slot.kind === "video" ? "Motion" : "Image"}
      </p>
      {IS_DEV && (
        <>
          <p className="relative mt-3 text-[13px] text-white/80" style={{ fontFamily: fonts.mono }}>
            {slot.file}
          </p>
          <p
            className="relative mt-2 max-w-[460px] text-[15px] leading-[1.35] text-white/45"
            style={{ fontFamily: "var(--font-caveat)" }}
          >
            {slot.brief}
          </p>
        </>
      )}
    </div>
  );
}

/* Muted autoplay loop. Lazy unless `eager` (cover). With reduced motion the
   poster is shown instead; without a poster the video waits for a click. */
function StoryVideo({
  src,
  poster,
  alt,
  aspect,
  eager,
}: {
  src: string;
  poster?: string;
  alt: string;
  aspect: string;
  eager: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(eager);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (eager) return;
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
  }, [eager]);

  if (reduceMotion && poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={encodeURI(poster)}
        alt={alt}
        className="block w-full rounded-sm"
        style={{ aspectRatio: aspect, objectFit: "cover" }}
      />
    );
  }

  return (
    <video
      ref={ref}
      src={inView ? encodeURI(src) : undefined}
      poster={poster ? encodeURI(poster) : undefined}
      autoPlay={!reduceMotion}
      controls={reduceMotion}
      loop
      muted
      playsInline
      preload={eager ? "auto" : "none"}
      aria-label={alt}
      className="block w-full rounded-sm"
      style={{ aspectRatio: aspect, objectFit: "cover" }}
    />
  );
}

/* Highlights “[confirm …]” tokens so unverified facts stay visible while editing. */
function Flagged({ text, fonts }: { text: string; fonts: Fonts }) {
  const parts = text.split(/(\[[^\]]+\])/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\[[^\]]+\]$/.test(part) ? (
          <span
            key={i}
            className="rounded-sm px-1 text-[0.85em] text-amber-300"
            style={{ fontFamily: fonts.mono, background: "rgba(252,211,77,0.08)" }}
          >
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}
