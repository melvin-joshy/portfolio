"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { BuildProject, Media } from "@/data/projects";
import { MetaStrip } from "./MetaStrip";
import { ChapterTOC, type TOCItem } from "./ChapterTOC";
import { WireBox, WireNote } from "./Wireframe";

function paragraphs(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p
      key={i}
      className="mt-5 text-[17px] leading-[1.7] text-white/68 first:mt-0"
      style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
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
      <ChapterTOC title={`${project.name} — Experiment`} items={tocItems} />
      <article className="mx-auto max-w-[640px]">
        {/* Back to work */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mb-10"
        >
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-white/55 transition-colors duration-300 hover:text-white"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-0.5">←</span>
            <span>Back to work</span>
          </Link>
        </motion.div>

        {/* 01 · Headline + intro */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p
            className="text-[11px] tracking-[0.22em] uppercase text-white/45"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            Experiment · {project.year}
          </p>
          <h1
            className="mt-5 text-[clamp(32px,4vw,44px)] leading-[1.15] text-white"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "-0.01em" }}
          >
            {project.oneLiner || project.description}
          </h1>
          <p
            className="mt-7 text-[17px] leading-[1.7] text-white/68"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
          >
            {project.description}
          </p>
        </motion.header>

        {/* 02 · Cover in soft card */}
        <SoftImageCard className="mt-12">
          <Cover project={project} />
        </SoftImageCard>
      </article>

      {/* 03 · Meta strip — same width as body */}
      <div className="mx-auto mt-20 max-w-[640px]">
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
        <Eyebrow>Why I built it</Eyebrow>
        <SerifHeading>The itch</SerifHeading>
        <div className="mt-5">{paragraphs(project.whyIBuiltIt)}</div>
      </SectionColumn>

      {/* 05 · What it does */}
      {project.whatItDoes && (
        <SectionColumn id="what">
          <Eyebrow>What it does</Eyebrow>
          <div className="mt-5">{paragraphs(project.whatItDoes)}</div>
        </SectionColumn>
      )}

      {/* 05b · Stack chips */}
      <SectionColumn id="stack">
        <Eyebrow>Stack</Eyebrow>
        <div className="mt-5 flex flex-wrap gap-2">
          {project.stack.map((s) => (
            <span
              key={s}
              className="rounded-full border px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase text-white/72"
              style={{
                fontFamily: "var(--font-mono)",
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
        <Eyebrow>Screens</Eyebrow>
        <SerifHeading>What it looks like</SerifHeading>
      </SectionColumn>
      <div className="mx-auto mt-8 max-w-[640px]">
        {project.gallery.length > 0 ? (
          <div className="flex flex-col gap-6">
            {project.gallery.map((m, i) => (
              <SoftImageCard key={i}>
                {m.src ? (
                  <GalleryFullBleed media={m} />
                ) : (
                  <WireBox aspect={aspectKey(m.aspect)} label={m.label ?? `Screen ${i + 1}`} hint="add src to gallery[]" />
                )}
              </SoftImageCard>
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
          <Eyebrow>{project.insightLabel ?? "One thing I got right"}</Eyebrow>
          <div className="mt-5">{paragraphs(project.insight)}</div>
        </SectionColumn>
      )}

      {/* 07 · Live / Repo buttons */}
      {(project.liveUrl || project.repoUrl) && (
        <div id="links" className="mx-auto mt-16 flex max-w-[640px] flex-wrap gap-3 scroll-mt-24">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view →"
              className="group inline-flex cursor-none items-center gap-3 rounded-full border px-6 py-3 text-[11px] tracking-[0.25em] uppercase text-white/85 transition-colors duration-300 hover:bg-white hover:text-black"
              style={{ borderColor: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)" }}
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
              style={{ borderColor: "rgba(255,255,255,0.14)", fontFamily: "var(--font-mono)" }}
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
        style={{ fontFamily: "var(--font-mono)" }}
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
      className="mx-auto mt-24 max-w-[640px] scroll-mt-24"
    >
      {children}
    </motion.section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[11px] tracking-[0.22em] uppercase text-white/45"
      style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
    >
      {children}
    </p>
  );
}

function SerifHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mt-4 text-[clamp(22px,2.4vw,26px)] leading-[1.2] text-white"
      style={{ fontFamily: "var(--font-serif)", fontWeight: 500, letterSpacing: "-0.005em" }}
    >
      {children}
    </h2>
  );
}

function SerifBody({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mt-5 text-[17px] leading-[1.7] text-white/68"
      style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
    >
      {children}
    </p>
  );
}

function GalleryFullBleed({ media }: { media: Media }) {
  return (
    <figure>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.src}
        alt={media.caption ?? ""}
        className="w-full"
        style={{
          aspectRatio: media.aspect === "tall" ? "3/4" : media.aspect === "square" ? "1/1" : "16/9",
          objectFit: "cover",
        }}
      />
      {media.caption && (
        <figcaption
          className="px-4 py-3 text-[12px] text-white/50"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}
