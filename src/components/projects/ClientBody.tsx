"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ClientProject, Media, SolutionBlock } from "@/data/projects";
import { MetaStrip } from "./MetaStrip";
import { ChapterTOC, type TOCItem } from "./ChapterTOC";
import { WireBox, WireNote, WireText } from "./Wireframe";
import { LightboxProvider, useLightbox } from "./Lightbox";
import { BRAND } from "@/lib/brand";
import { BODY_P, COLUMN, FONTS, H1_CLASS, H1_STYLE, H2_CLASS, H2_STYLE } from "./projectStyle";

function aspectKey(a?: string): "16/9" | "16/10" | "4/3" | "3/4" | "1/1" {
  if (a === "tall") return "3/4";
  if (a === "square") return "1/1";
  return "16/10";
}

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────── Problem image — inline, zoomable ───────────────── */

function ProblemImage({ src }: { src: string }) {
  const lb = useLightbox();
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={encodeURI(src)}
      alt=""
      onClick={() => lb?.open({ src })}
      data-cursor="ZOOM"
      data-cursor-variant="zoom"
      className="mx-auto mt-10 w-full max-w-[1040px] cursor-none rounded-sm block"
      style={{ display: "block" }}
    />
  );
}

/* ───────────────── ClientBody ─────────────────
 * Reference: robertkan.com/projects/clubsneu
 * Single 1040px column in the CrewsLink story system: Geist, mono labels, flush media.
 * Dark version — paper-like image surfaces sit on near-black canvas.
 * ─────────────────────────────────────────────── */

export function ClientBody({ project }: { project: ClientProject }) {
  const tocItems: TOCItem[] = [
    { id: "overview", label: "Overview" },
    { id: "challenge", label: "The Problem" },
    { id: "goals", label: "Goals" },
    { id: "approach", label: "Approach" },
    ...(project.solutionBlocks
      ? project.solutionBlocks.map((b, i) => ({
          id: `solution-${b.index ?? String(i + 1).padStart(2, "0")}`,
          label: b.title,
        }))
      : [{ id: "solution", label: "The Solution" }]),
    ...(project.gallery.length > 0 ? [{ id: "final-designs", label: "Final Designs" }] : []),
    { id: "impact", label: "Impact" },
    { id: "reflection", label: "Reflection" },
  ];

  return (
    <LightboxProvider>
    <div className="px-6 pb-32 pt-12 md:px-10">
      <ChapterTOC title={`${project.name} · ${project.client}`} items={tocItems} serifTitle={false} />
      {/* ── Narrow editorial column ── */}
      <article className={COLUMN}>
        {/* Back to work — above headline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <BackLink />
        </motion.div>

        {/* 01 · Headline + intro paragraph */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mt-10"
        >
          <h1 className={H1_CLASS} style={H1_STYLE}>
            {project.description}
          </h1>
          {project.overview ? (
            <div className="mt-6">{paragraphs(project.overview)}</div>
          ) : (
            <p className={`mt-6 ${BODY_P}`} style={{ fontFamily: FONTS.text, fontWeight: 400 }}>
              From {project.year}, as {project.role.toLowerCase()}, I worked with{" "}
              <em className="not-italic underline decoration-dotted decoration-white/30 underline-offset-4">
                {project.client}
              </em>{" "}
              to ship the work below.
            </p>
          )}
        </motion.header>

        {/* 02 · Cover */}
        <div className="mt-12">
          <Cover project={project} />
        </div>
      </article>

      {/* 03 · Meta strip — same narrow column as body */}
      <div className={`mt-16 ${COLUMN}`}>
        <MetaStrip
          items={[
            { label: "Client", value: project.client },
            { label: "Role", value: project.role },
            { label: "Scope", value: project.scope.join(" · ") },
            { label: "Year", value: project.year },
          ]}
        />
      </div>

      {/* 04 · Context & Research */}
      <SectionColumn id="overview">
        <SerifHeading>The starting point</SerifHeading>
        {project.overview ? (
          <div className="mt-5">{paragraphs(project.overview)}</div>
        ) : (
          <SerifBody>{project.problem}</SerifBody>
        )}
      </SectionColumn>

      {/* 05 · Goals */}
      <SectionColumn id="goals">
        <SerifHeading>What we set out to do</SerifHeading>
        {project.goals && project.goals.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {project.goals.map((g, i) => (
              <li
                key={i}
                className="border-l pl-5 text-[17px] leading-[1.6] text-white/75"
                style={{ borderColor: "rgba(255,255,255,0.18)", fontFamily: FONTS.text, fontWeight: 400 }}
              >
                {g}
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="flex items-center gap-4">
                  <span className="inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-white/20" />
                  <span
                    className="h-3 flex-1 rounded-sm"
                    style={{
                      width: i === 2 ? "60%" : "100%",
                      background: "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
                    }}
                  />
                </li>
              ))}
            </ul>
            <WireNote>add <code>goals[]</code> — 3–5 short bullets</WireNote>
          </>
        )}
      </SectionColumn>

      {/* 06 · Problem statement */}
      <SectionColumn id="challenge">
        <SerifHeading>{project.problem.split(".")[0]}</SerifHeading>
        <div className="mt-5">{paragraphs(project.problem.slice(project.problem.indexOf(".") + 1).trim())}</div>
      </SectionColumn>

      {/* 06b · Problem image — inline, full-bleed, zoomable */}
      {project.problemImage && <ProblemImage src={project.problemImage} />}

      {/* 07 · Approach */}
      <SectionColumn id="approach">
        <SerifHeading>{project.approach.split(".")[0]}</SerifHeading>
        <div className="mt-5">{paragraphs(project.approach.slice(project.approach.indexOf(".") + 1).trim())}</div>
      </SectionColumn>

      {/* 08 · Solution blocks — each section carries its own id for TOC anchoring */}
      <SolutionBlocks project={project} />

      {/* 09 · Final Designs gallery — only when populated */}
      {project.gallery.length > 0 && (
        <>
          <SectionColumn id="final-designs">
                <SerifHeading>The shipped work</SerifHeading>
            <p className="sr-only">Final design gallery</p>
          </SectionColumn>
          <div className={`mt-10 ${COLUMN}`}>
            <div className="flex flex-col gap-6">
              {project.gallery.map((m, i) => (
                <AnnotatedImage key={i} media={m} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 10 · Impact / Outcome */}
      <SectionColumn id="impact">
        <SerifHeading>The outcome</SerifHeading>
        <SerifBody>{project.outcome}</SerifBody>
      </SectionColumn>

      {/* 11 · Metrics inline (smaller, lives inside narrow column) */}
      <div className={`mt-9 ${COLUMN}`}>
        {project.metrics && project.metrics.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-x-10 gap-y-8 border-t pt-8 sm:grid-cols-3"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {project.metrics.map((m, i) => (
              <div key={i}>
                <p
                  className="text-[clamp(32px,4vw,44px)] leading-[1.05] text-white"
                  style={{ fontFamily: FONTS.text, fontWeight: 500, letterSpacing: "-0.02em" }}
                >
                  {m.value}
                </p>
                <p
                  className="mt-2 text-[13px] leading-[1.4] text-white/50"
                  style={{ fontFamily: FONTS.text, fontWeight: 400 }}
                >
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              className="grid grid-cols-1 gap-x-10 gap-y-8 border-t pt-8 sm:grid-cols-3"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div
                    className="h-9 rounded-sm"
                    style={{
                      width: "70%",
                      background: "linear-gradient(90deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)",
                    }}
                  />
                  <div
                    className="mt-3 h-3 rounded-sm"
                    style={{
                      width: "55%",
                      background: "linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                    }}
                  />
                </div>
              ))}
            </div>
            <WireNote>add <code>metrics[]</code> — quantified wins</WireNote>
          </>
        )}
      </div>

      {/* 12 · Reflection & Results — multiple short sub-paragraphs (Robert Kan pattern) */}
      <article id="reflection" className={`${COLUMN} mt-28 scroll-mt-24`}>
        <SerifHeading>Reflection & Results</SerifHeading>
        {project.reflection ? (
          <div className="mt-5">{paragraphs(project.reflection)}</div>
        ) : (
          <>
            <SerifHeading>Distribution can break a product</SerifHeading>
            <SerifBody>
              <span className="text-white/50">
                Write one short reflection paragraph here. Then add 1–2 more sub-headings + paragraphs below,
                each capturing a distinct lesson from the project.
              </span>
            </SerifBody>
            <div className="mt-10">
              <SerifHeading>Don&apos;t be afraid to iterate</SerifHeading>
              <SerifBody>
                <span className="text-white/50">Second reflection — split <code>reflection</code> on
                  &ldquo;\n\n&rdquo; to render multiple paragraphs.</span>
              </SerifBody>
            </div>
            <WireNote>
              add <code>reflection</code> — multi-paragraph string. Each &ldquo;\n\n&rdquo; starts a new block.
            </WireNote>
          </>
        )}
      </article>
    </div>
    </LightboxProvider>
  );
}

/* ───────────────── Primitives ───────────────── */

function Cover({ project }: { project: ClientProject }) {
  const lb = useLightbox();
  if (project.cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={project.cover}
        alt={project.name}
        onClick={() => lb?.open({ src: project.cover! })}
        data-cursor="ZOOM"
        data-cursor-variant="zoom"
        className="w-full block cursor-none rounded-sm"
        style={{ aspectRatio: "16/10", objectFit: "cover" }}
      />
    );
  }
  return (
    <div
      className="flex aspect-[16/10] w-full flex-col items-center justify-center text-center"
      style={{ background: project.bg }}
    >
      <p className="text-[11px] tracking-[0.3em] uppercase text-white/55" style={{ fontFamily: "var(--font-mono)" }}>
        Cover image
      </p>
      <p className="mt-2 text-[15px] text-white/45" style={{ fontFamily: "var(--font-caveat)" }}>
        set <code>cover</code> in src/data/projects.ts
      </p>
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

function SerifHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={H2_CLASS} style={H2_STYLE}>
      {children}
    </h2>
  );
}

function SerifBody({ children }: { children: React.ReactNode }) {
  return (
    <p className={`mt-5 ${BODY_P}`} style={{ fontFamily: FONTS.text, fontWeight: 400 }}>
      {children}
    </p>
  );
}

function paragraphs(text: string) {
  return text.split(/\n\n+/).map((p, i) => (
    <p key={i} className={`mt-4 ${BODY_P} first:mt-0`} style={{ fontFamily: FONTS.text, fontWeight: 400 }}>
      {p}
    </p>
  ));
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

/* ─────── Solution blocks ─────── */

function SolutionBlocks({ project }: { project: ClientProject }) {
  const blocks: SolutionBlock[] =
    project.solutionBlocks ?? [
      { index: "01", title: "First decision", body: "" },
      { index: "02", title: "Second decision", body: "" },
      { index: "03", title: "Third decision", body: "" },
    ];
  return (
    <>
      {blocks.map((b, i) => (
        <SolutionBlockView key={i} block={b} fallbackIndex={i} hasContent={!!project.solutionBlocks} />
      ))}
      {!project.solutionBlocks && (
        <div className={`mt-6 ${COLUMN}`}>
          <WireNote>add <code>solutionBlocks[]</code> — each one a decision / chapter</WireNote>
        </div>
      )}
    </>
  );
}

function SolutionBlockView({
  block,
  fallbackIndex,
  hasContent,
}: {
  block: SolutionBlock;
  fallbackIndex: number;
  hasContent: boolean;
}) {
  const idx = block.index ?? String(fallbackIndex + 1).padStart(2, "0");
  return (
    <>
      <SectionColumn id={`solution-${idx}`}>
        <SerifHeading>{block.title}</SerifHeading>
        {block.body ? (
          <div className="mt-5">{paragraphs(block.body)}</div>
        ) : hasContent ? null : (
          <div className="mt-5">
            <WireText lines={3} />
          </div>
        )}
      </SectionColumn>
      <div className={`mt-10 ${COLUMN}`}>
        {block.media && block.media.length > 0 ? (
          <div className="flex flex-col gap-6">
            {block.media.map((m, i) => (
              <AnnotatedImage key={i} media={m} />
            ))}
          </div>
        ) : (
          <WireBox aspect="16/10" label={`${idx} · ${block.title}`} hint="screenshot goes here" />
        )}
      </div>
    </>
  );
}

function AnnotatedImage({ media }: { media: Media }) {
  const lb = useLightbox();
  return (
    <figure className="relative">
      {media.label && (
        <div className="flex items-center gap-2 pb-2 pt-1">
          {media.status === "iteration" && <StatusDot color={BRAND.red} symbol="✕" />}
          {media.status === "final" && <StatusDot color="#3a8f62" symbol="✓" />}
          <p
            className="text-[11px] tracking-[0.18em] uppercase text-white/50"
            style={{ fontFamily: FONTS.mono, fontWeight: 500 }}
          >
            {media.label}
          </p>
        </div>
      )}
      {media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={encodeURI(media.src)}
          alt={media.caption ?? ""}
          onClick={() => lb?.open({ src: media.src, caption: media.caption })}
          data-cursor="ZOOM"
          data-cursor-variant="zoom"
          className="w-full block cursor-none rounded-sm"
          style={{
            objectFit: media.fit === "contain" ? "contain" : "cover",
          }}
        />
      ) : (
        <WireBox aspect={aspectKey(media.aspect)} label={media.label ?? "Image"} hint="add src to media[]" />
      )}
      {media.annotations && media.annotations.length > 0 && (
        <ul className="mt-3.5 space-y-2" style={{ fontFamily: FONTS.mono }}>
          {media.annotations.map((a) => (
            <li key={a.n} className="flex items-center gap-3 text-[12px] text-white/50">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-[10px] text-white"
                style={{ background: BRAND.red }}
              >
                {a.n}
              </span>
              <span>{a.text}</span>
            </li>
          ))}
        </ul>
      )}
      {media.caption && !media.label && (
        <figcaption
          className="mt-3.5 text-[12px] text-white/50"
          style={{ fontFamily: FONTS.mono }}
        >
          {media.caption}
        </figcaption>
      )}
    </figure>
  );
}

function StatusDot({ color, symbol }: { color: string; symbol: string }) {
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white"
      style={{ background: color }}
    >
      {symbol}
    </span>
  );
}
