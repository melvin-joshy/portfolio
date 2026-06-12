"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Project } from "@/data/projects";

export function NextProjectCards({ nexts }: { nexts: Project[] }) {
  if (nexts.length === 0) return null;
  return (
    <section className="mt-32">
      <p
        className="text-[10px] tracking-[0.32em] uppercase text-white/35"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        Next
      </p>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {nexts.map((p) => (
          <NextCard key={p.id} project={p} />
        ))}
      </div>
    </section>
  );
}

function NextCard({ project }: { project: Project }) {
  const tag = project.tag.replace(/\s*·\s*\d{4}[–\-]?(?:Present|\d{4})?$/i, "");
  const external = project.externalUrl;

  const inner = (
    <>
      {/* Image / colour block — fixed aspect ratio */}
      <div
        className="relative w-full overflow-hidden rounded-sm"
        style={{ aspectRatio: "16/9", background: project.bg }}
      >
        {project.heroImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={encodeURI(project.heroImage)}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full pointer-events-none transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ objectFit: "cover" }}
          />
        )}
        {/* Subtle dark vignette so arrow stays readable */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.45) 100%)" }} />
        <ArrowRight
          className="absolute right-5 bottom-5 h-5 w-5 text-white/70 transition-transform duration-300 group-hover:translate-x-1"
        />
      </div>

      {/* Text below — editorial */}
      <div className="mt-4 px-1">
        <p
          className="text-[10px] tracking-[0.3em] uppercase text-white/40"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {tag}
        </p>
        <h3 className="mt-1 font-bebas text-[clamp(28px,3.5vw,48px)] leading-none tracking-wider text-white">
          {project.name}
        </h3>
        <p className="mt-2 text-[13px] leading-[1.6] text-white/58">
          {project.description}
        </p>
      </div>
    </>
  );

  // External projects (e.g. Tempo) open the live site in a new tab — no internal page.
  if (external) {
    return (
      <a
        href={external}
        target="_blank"
        rel="noopener noreferrer"
        data-cursor="visit ↗"
        className="group block cursor-none"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={`/projects/${project.id}`}
      data-cursor="view →"
      className="group block cursor-none"
    >
      {inner}
    </Link>
  );
}

/* Back-compat single-card export */
export function NextProjectCard({ next }: { next: Project }) {
  return <NextProjectCards nexts={[next]} />;
}
