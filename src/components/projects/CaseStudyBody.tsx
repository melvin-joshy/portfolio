"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CaseStudyProject } from "@/data/projects";
import { Chapter } from "./Chapter";
import { MetaStrip } from "./MetaStrip";
import { ChapterTOC, type TOCItem } from "./ChapterTOC";
import { WireNote } from "./Wireframe";
import { ScribbleUnderline } from "../ScribbleUnderline";
import { LightboxProvider, useLightbox } from "./Lightbox";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CaseStudyBody({ project }: { project: CaseStudyProject }) {
  return (
    <LightboxProvider>
      <CaseStudyBodyInner project={project} />
    </LightboxProvider>
  );
}

function CaseStudyBodyInner({ project }: { project: CaseStudyProject }) {
  const tocItems: TOCItem[] = [
    { id: "overview", label: "Overview" },
    ...project.chapters.map((c, i) => ({
      id: `chapter-${i + 1}`,
      label: c.title,
    })),
    { id: "reflection", label: "Reflection" },
    ...(project.outcome ? [{ id: "outcome", label: "Outcome" }] : []),
  ];

  return (
    <div className="px-6 pb-32 pt-12 md:px-10">
      {/* Right-edge TOC — collapses to dash markers, expands on hover (desktop only) */}
      <ChapterTOC title={`${project.name} · Case Study`} items={tocItems} />

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

        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <p
            className="text-[11px] tracking-[0.22em] uppercase text-white/58"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            {project.tag}
          </p>
          <h1
            className="mt-5 text-[clamp(32px,4vw,44px)] leading-[1.15] text-white"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "-0.01em" }}
          >
            {project.problem}
          </h1>
          <p
            className="mt-7 text-[12px] tracking-[0.22em] uppercase text-white/35"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            01 / {String(project.chapters.length).padStart(2, "0")} chapters
          </p>
        </motion.header>

        {/* Cover */}
        {project.cover ? (
          <CoverImage src={project.cover} alt={project.name} />
        ) : (
          <SoftImageCard className="mt-12">
            <div
              className="flex aspect-[16/10] w-full flex-col items-center justify-center text-center"
              style={{ background: project.bg }}
            >
              <p
                className="text-[11px] tracking-[0.3em] uppercase text-white/55"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Cover image
              </p>
              <p
                className="mt-2 text-[15px] text-white/45"
                style={{ fontFamily: "var(--font-caveat)" }}
              >
                editorial hero — sets the tone for the read
              </p>
            </div>
          </SoftImageCard>
        )}
      </article>

      {/* Meta strip — same narrow column as body (matches client / build templates) */}
      <div className="mx-auto mt-20 max-w-[640px]">
        <MetaStrip
          items={[
            { label: "Role", value: project.role },
            ...(project.team ? [{ label: "Team", value: project.team }] : []),
            { label: "Duration", value: project.duration },
            { label: "Year", value: project.year },
            ...(project.tools && project.tools.length > 0
              ? [{ label: "Tools", value: project.tools.join(" · ") }]
              : []),
          ]}
        />
      </div>

      {/* Chapter column — same 640px center axis as the cover */}
      <div className="relative mx-auto mt-8 max-w-[640px]">
        <div className="min-w-0">
          <div id="overview" className="scroll-mt-24" />
          {project.chapters.map((c, i) => (
            <Chapter key={i} chapter={c} index={i} id={`chapter-${i + 1}`} />
          ))}

          {/* Reflection */}
          <motion.section
            id="reflection"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="scroll-mt-24 border-t py-14"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          >
            <p
              className="text-[11px] tracking-[0.22em] uppercase text-white/58"
              style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
            >
              Reflection
            </p>
            {project.reflection ? (
              <p
                className="mt-5 text-[17px] leading-[1.7] text-white/75"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 400, fontStyle: "italic" }}
              >
                {project.reflection}
              </p>
            ) : (
              <WireNote>add <code>reflection</code> in <code>src/data/projects.ts</code></WireNote>
            )}
          </motion.section>

          {/* Outcome */}
          {project.outcome && (
            <motion.section
              id="outcome"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: EASE }}
              className="scroll-mt-24 border-t py-14"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              {project.id === "aura" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={encodeURI("/Aura mascot.webp")}
                  alt="Aura mascot"
                  className="mb-6"
                  style={{
                    width: 54,
                    height: 54,
                    objectFit: "cover",
                    display: "block",
                    borderRadius: 13,
                    boxShadow: "0 8px 24px -8px rgba(58,74,143,0.5)",
                  }}
                />
              )}
              <p
                className="text-[11px] tracking-[0.22em] uppercase text-white/58"
                style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
              >
                Outcome
              </p>
              <p
                className="mt-5 text-[17px] leading-[1.7] text-white/68"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
              >
                {project.outcome}
              </p>
            </motion.section>
          )}

          {/* Behance CTA */}
          {project.behanceUrl && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="border-t pt-10"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <a
                href={project.behanceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2.5"
              >
                <ScribbleUnderline offsetY={4}>
                  <span
                    className="text-[11px] tracking-[0.22em] uppercase text-white/70 transition-colors duration-300 group-hover:text-white"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    View full case study on Behance
                  </span>
                </ScribbleUnderline>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-white/45 transition-all duration-300 group-hover:translate-x-1 group-hover:text-white"
                  aria-hidden="true"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function CoverImage({ src, alt }: { src: string; alt: string }) {
  const lb = useLightbox();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(src)}
      alt={alt}
      onClick={() => lb?.open({ src })}
      data-cursor="ZOOM"
      data-cursor-variant="zoom"
      className="mt-12 w-full cursor-none rounded-sm"
      style={{ aspectRatio: "16/10", objectFit: "cover" }}
    />
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
