"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ClientProject, Media, SolutionBlock } from "@/data/projects";
import { MetaStrip } from "./MetaStrip";
import { ChapterTOC, type TOCItem } from "./ChapterTOC";
import { WireBox, WireNote, WireText } from "./Wireframe";
import { LightboxProvider, useLightbox } from "./Lightbox";

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
      className="mx-auto mt-8 w-full max-w-[640px] cursor-zoom-in rounded-[4px] block"
      style={{ display: "block" }}
    />
  );
}

/* ───────────────── ClientBody ─────────────────
 * Reference: robertkan.com/projects/clubsneu
 * Narrow editorial column, serif body, mono eyebrows, soft image cards.
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
      <ChapterTOC title={`${project.name} — ${project.client}`} items={tocItems} />
      {/* ── Narrow editorial column ── */}
      <article className="mx-auto max-w-[640px]">
        {/* Back to work — above headline */}
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

        {/* 01 · Headline + intro paragraph */}
        <motion.header
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <h1
            className="text-[clamp(32px,4vw,44px)] leading-[1.15] text-white"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 400, letterSpacing: "-0.01em" }}
          >
            {project.description}
          </h1>
          {project.overview ? (
            <div className="mt-7">{paragraphs(project.overview, true)}</div>
          ) : (
            <p
              className="mt-7 text-[17px] leading-[1.7] text-white/68"
              style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
            >
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
      <div className="mx-auto mt-20 max-w-[640px]">
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
        <Eyebrow>Context & Research</Eyebrow>
        <SerifHeading>The starting point</SerifHeading>
        {project.overview ? (
          <div className="mt-5">{paragraphs(project.overview, true)}</div>
        ) : (
          <SerifBody>{project.problem}</SerifBody>
        )}
      </SectionColumn>

      {/* 05 · Goals */}
      <SectionColumn id="goals">
        <SerifHeading>What we set out to do</SerifHeading>
        {project.goals && project.goals.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {project.goals.map((g, i) => (
              <li
                key={i}
                className="flex gap-4 text-[16px] leading-[1.7] text-white/72"
                style={{ fontFamily: "var(--font-serif)", fontWeight: 300 }}
              >
                <span className="mt-[10px] inline-block h-[5px] w-[5px] shrink-0 rounded-full bg-[#c0392b]" />
                <span>{g}</span>
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
        <Eyebrow>Problem</Eyebrow>
        <SerifHeading>{project.problem.split(".")[0]}</SerifHeading>
        <div>{paragraphs(project.problem.slice(project.problem.indexOf(".") + 1).trim(), true)}</div>
      </SectionColumn>

      {/* 06b · Problem image — inline, full-bleed, zoomable */}
      {project.problemImage && <ProblemImage src={project.problemImage} />}

      {/* 07 · Approach */}
      <SectionColumn id="approach">
        <Eyebrow>Solution</Eyebrow>
        <SerifHeading>{project.approach.split(".")[0]}</SerifHeading>
        <div>{paragraphs(project.approach.slice(project.approach.indexOf(".") + 1).trim(), true)}</div>
      </SectionColumn>

      {/* 08 · Solution blocks — each section carries its own id for TOC anchoring */}
      <SolutionBlocks project={project} />

      {/* 09 · Final Designs gallery — only when populated */}
      {project.gallery.length > 0 && (
        <>
          <SectionColumn id="final-designs">
            <Eyebrow>Final Designs</Eyebrow>
            <SerifHeading>The shipped work</SerifHeading>
            <p className="sr-only">Final design gallery</p>
          </SectionColumn>
          <div className="mx-auto mt-2 max-w-[640px]">
            <div className="flex flex-col gap-8">
              {project.gallery.map((m, i) => (
                <AnnotatedImage key={i} media={m} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* 10 · Impact / Outcome */}
      <SectionColumn id="impact">
        <Eyebrow>Impact</Eyebrow>
        <SerifHeading>The outcome</SerifHeading>
        <SerifBody>{project.outcome}</SerifBody>
      </SectionColumn>

      {/* 11 · Metrics inline (smaller, lives inside narrow column) */}
      <div className="mx-auto mt-10 max-w-[640px]">
        {project.metrics && project.metrics.length > 0 ? (
          <div
            className="grid gap-6 border-y py-8 sm:grid-cols-2 md:grid-cols-3"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {project.metrics.map((m, i) => (
              <div key={i}>
                <p
                  className="text-[clamp(28px,3vw,40px)] leading-none text-white"
                  style={{ fontFamily: "var(--font-serif)", fontWeight: 500, letterSpacing: "-0.02em" }}
                >
                  {m.value}
                </p>
                <p
                  className="mt-3 text-[10px] tracking-[0.22em] uppercase text-white/50"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div
              className="grid gap-6 border-y py-8 sm:grid-cols-2 md:grid-cols-3"
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
      <article id="reflection" className="mx-auto mt-24 max-w-[640px] scroll-mt-24">
        <Eyebrow>Reflection & Results</Eyebrow>
        {project.reflection ? (
          paragraphs(project.reflection, true)
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
        className="w-full block cursor-zoom-in rounded-[4px]"
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

function Pill({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <span
      className="rounded-[6px] border px-3 py-1.5 text-[11px] tracking-[0.18em] uppercase text-white/72"
      style={{
        fontFamily: mono ? "var(--font-mono)" : "var(--font-inter)",
        borderColor: "rgba(255,255,255,0.14)",
        background: "rgba(255,255,255,0.025)",
      }}
    >
      {children}
    </span>
  );
}

function paragraphs(text: string, serif = false) {
  return text.split(/\n\n+/).map((p, i) => (
    <p
      key={i}
      className="mt-5 text-[17px] leading-[1.7] text-white/68 first:mt-0"
      style={{
        fontFamily: serif ? "var(--font-serif)" : "var(--font-inter)",
        fontWeight: serif ? 300 : 400,
      }}
    >
      {p}
    </p>
  ));
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
        <div className="mx-auto mt-6 max-w-[640px]">
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
        <Eyebrow>Decision · {idx}</Eyebrow>
        <SerifHeading>{block.title}</SerifHeading>
        {block.body ? (
          <div>{paragraphs(block.body, true)}</div>
        ) : hasContent ? null : (
          <div className="mt-5">
            <WireText lines={3} />
          </div>
        )}
      </SectionColumn>
      <div className="mx-auto mt-8 max-w-[640px]">
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
          {media.status === "iteration" && <StatusDot color="#c0392b" symbol="✕" />}
          {media.status === "final" && <StatusDot color="#3a8f62" symbol="✓" />}
          <p
            className="text-[10px] tracking-[0.22em] uppercase text-white/45"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {media.label}
          </p>
        </div>
      )}
      {media.src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          alt={media.caption ?? ""}
          onClick={() => lb?.open({ src: media.src, caption: media.caption })}
          className="w-full block cursor-zoom-in rounded-[4px]"
          style={{
            objectFit: media.fit === "contain" ? "contain" : "cover",
          }}
        />
      ) : (
        <WireBox aspect={aspectKey(media.aspect)} label={media.label ?? "Image"} hint="add src to media[]" />
      )}
      {media.annotations && media.annotations.length > 0 && (
        <ul className="space-y-2 px-4 py-3" style={{ fontFamily: "var(--font-mono)" }}>
          {media.annotations.map((a) => (
            <li key={a.n} className="flex items-center gap-3 text-[12px] text-white/65">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-sm text-[10px] text-white"
                style={{ background: "#c0392b" }}
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
          className="px-4 py-3 text-[12px] text-white/50"
          style={{ fontFamily: "var(--font-mono)" }}
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
