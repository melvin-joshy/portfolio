"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { BuildProject, Media } from "@/data/projects";
import { MetaStrip } from "./MetaStrip";
import { ChapterTOC, type TOCItem } from "./ChapterTOC";
import { WireBox, WireNote } from "./Wireframe";
import { BODY_P, CAPTION_CLASS, COLUMN, FONTS, H1_CLASS, H1_STYLE, H2_CLASS, H2_STYLE } from "./projectStyle";

function paragraphs(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p
      key={i}
      className={`mt-4 ${BODY_P} first:mt-0`}
      style={{ fontFamily: FONTS.text, fontWeight: 400 }}
    >
      {p}
    </p>
  ));
}

function aspectKey(a?: string): "16/9" | "16/10" | "4/3" | "3/4" | "1/1" {
  if (a === "tall") return "3/4";
  if (a === "square") return "1/1";
  return "16/9";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────── BuildBody ─────────────────
 * Personal experiment / vibe-coded project.
 * Shares ClientBody's editorial typography & soft image card system.
 * Lighter narrative — no Problem/Approach/Goals — more hero + screens.
 * ──────────────────────────────────────────── */

export function BuildBody({ project }: { project: BuildProject }) {
  const tocItems: TOCItem[] = [
    { id: "why", label: "Why I built it" },
    ...(project.whatItDoes ? [{ id: "what", label: "What it does" }] : []),
    { id: "stack", label: "Stack" },
    { id: "screens", label: "Screens" },
    ...(project.insight ? [{ id: "insight", label: project.insightLabel ?? "One thing I got right" }] : []),
    ...(project.liveUrl || project.repoUrl ? [{ id: "links", label: "Live & Repo" }] : []),
  ];

  return (
    <div className="px-6 pb-32 pt-12 md:px-10">
      <ChapterTOC title={`${project.name} · Experiment`} items={tocItems} serifTitle={false} />
      <article className={COLUMN}>
        {/* Back to work */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <BackLink />
        </motion.div>

        {/* 01 · Headline + intro */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-10"
        >
          <Eyebrow>Experiment · {project.year}</Eyebrow>
          <h1 className={`mt-5 ${H1_CLASS}`} style={H1_STYLE}>
            {project.oneLiner || project.description}
          </h1>
          <p className={`mt-6 ${BODY_P}`} style={{ fontFamily: FONTS.text, fontWeight: 400 }}>
            {project.description}
          </p>
        </motion.header>

        {/* 02 · Cover — full-bleed, matches client / case-study templates */}
        <div className="mt-12">
          <Cover project={project} />
        </div>
      </article>

      {/* 03 · Meta strip — same width as body */}
      <div className={`mt-16 ${COLUMN}`}>
        <MetaStrip
          items={[
            { label: "Kind", value: "Personal experiment" },
            { label: "Stack", value: project.stack.slice(0, 3).join(" · ") },
            { label: "Status", value: project.status ?? (project.liveUrl ? "Live" : "Local") },
            { label: "Year", value: project.year },
          ]}
        />
      </div>

      {/* 04 · Why I built it */}
      <SectionColumn id="why">
        <SerifHeading>The itch</SerifHeading>
        <div className="mt-5">{paragraphs(project.whyIBuiltIt)}</div>
      </SectionColumn>

      {/* 05 · What it does */}
      {project.whatItDoes && (
        <SectionColumn id="what">
          <SerifHeading>What it does</SerifHeading>
          <div className="mt-5">{paragraphs(project.whatItDoes)}</div>
        </SectionColumn>
      )}

      {/* 05b · Stack chips */}
      <SectionColumn id="stack">
        <SerifHeading>Stack</SerifHeading>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase text-white/72"
              style={{
                fontFamily: FONTS.mono,
                borderColor: "rgba(255,255,255,0.14)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      </SectionColumn>

      {/* 06 · Screens gallery */}
      <SectionColumn id="screens">
        <SerifHeading>What it looks like</SerifHeading>
      </SectionColumn>
      <div className={`mt-10 ${COLUMN}`}>
        {project.gallery.length > 0 ? (
          <div className="flex flex-col gap-6">
            {project.gallery.map((m, i) => (
              m.src ? (
                <GalleryFullBleed key={i} media={m} />
              ) : (
                <WireBox key={i} aspect={aspectKey(m.aspect)} label={m.label ?? `Screen ${i + 1}`} hint="add src to gallery[]" />
              )
            ))}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6">
              <SoftImageCard>
                <WireBox aspect="16/9" label="Screen 01" hint="full-bleed product screenshot" />
              </SoftImageCard>
              <SoftImageCard>
                <WireBox aspect="16/9" label="Screen 02" hint="alternate state / interaction" />
              </SoftImageCard>
              <SoftImageCard>
                <WireBox aspect="16/9" label="Screen 03" hint="optional: short looping video" />
              </SoftImageCard>
            </div>
            <WireNote>vertical scroll of full-bleed shots — add to <code>gallery[]</code></WireNote>
          </>
        )}
      </div>

      {/* 06b · Insight / meta moment */}
      {project.insight && (
        <SectionColumn id="insight">
          <SerifHeading>{project.insightLabel ?? "One thing I got right"}</SerifHeading>
          <div className="mt-5">{paragraphs(project.insight)}</div>
        </SectionColumn>
      )}

      {/* 07 · Live / Repo buttons */}
      {(project.liveUrl || project.repoUrl) && (
        <div id="links" className={`${COLUMN} mt-16 flex flex-wrap gap-3 scroll-mt-24`}>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view →"
              className="group inline-flex cursor-none items-center gap-3 rounded-full border px-6 py-3 text-[11px] tracking-[0.25em] uppercase text-white/85 transition-colors duration-300 hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.2)", fontFamily: FONTS.mono }}
            >
              <span>Live</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
          {project.repoUrl && (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view →"
              className="group inline-flex cursor-none items-center gap-3 rounded-full border px-6 py-3 text-[11px] tracking-[0.25em] uppercase text-white/60 transition-colors duration-300 hover:text-white"
              style={{ borderColor: "rgba(255,255,255,0.14)", fontFamily: FONTS.mono }}
            >
              <span>Repo</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────────────── Primitives (mirror of ClientBody) ───────────────── */

function Cover({ project }: { project: BuildProject }) {
  if (project.cover) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.cover}
          alt={project.name}
          className="w-full"
          style={{ aspectRatio: "16/10", objectFit: "cover" }}
        />
      </>
    );
  }
  return (
    <div
      className="flex aspect-[16/10] w-full flex-col items-center justify-center text-center"
      style={{ background: project.bg }}
    >
      <p
        className="text-[11px] tracking-[0.3em] uppercase text-white/55"
        style={{ fontFamily: FONTS.mono }}
      >
        Hero shot / video
      </p>
      <p
        className="mt-2 text-[15px] text-white/45"
        style={{ fontFamily: "var(--font-caveat)" }}
      >
        big single visual — the &ldquo;poster&rdquo; for the build
      </p>
    </div>
  );
}

function SoftImageCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-[10px] p-3 md:p-5 ${className}`}
      style={{
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div className="overflow-hidden rounded-[6px]" style={{ background: "rgba(0,0,0,0.25)" }}>
        {children}
      </div>
    </div>
  );
}

function SectionColumn({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: EASE }}
      className="mx-auto mt-28 w-full max-w-[1040px] scroll-mt-24"
    >
      {children}
    </motion.section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] tracking-[0.2em] uppercase text-white/55"
      style={{ fontFamily: FONTS.mono, fontWeight: 500 }}
    >
      {children}
    </p>
  );
}

function SerifHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={H2_CLASS} style={H2_STYLE}>
      {children}
    </h2>
  );
}

function BackLink() {
  return (
    <Link
      href="/"
      className="group inline-flex min-h-9 items-center gap-2 text-[13px] text-white/75 transition-colors duration-200 hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
      style={{ fontFamily: FONTS.text }}
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
      <span>Back to work</span>
    </Link>
  );
}

function GalleryFullBleed({ media }: { media: Media }) {
  const caption = media.caption ?? media.label;
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={encodeURI(media.src)}
        alt={caption ?? ""}
        className="w-full block rounded-sm"
        style={{
          aspectRatio: media.aspect === "tall" ? "3/4" : media.aspect === "square" ? "1/1" : "16/9",
          objectFit: "cover",
        }}
      />
      {caption && (
        <figcaption className={CAPTION_CLASS} style={{ fontFamily: FONTS.mono }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
