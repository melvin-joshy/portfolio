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
  return (
    <Link
      href={`/projects/${project.id}`}
      data-cursor="view →"
      className="group relative block cursor-none overflow-hidden rounded-sm border p-8 transition-colors duration-300 md:p-10"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: project.bg,
      }}
    >
      <p
        className="text-[10px] tracking-[0.3em] uppercase text-white/55"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {project.tag} · {project.year}
      </p>
      <h3
        className="mt-3 font-bebas text-[clamp(34px,4vw,56px)] leading-none tracking-wider text-white"
      >
        {project.name}
      </h3>
      <p className="mt-5 text-[14px] leading-[1.6] text-white/55">
        {project.description}
      </p>
      <ArrowRight
        className="absolute right-6 top-1/2 h-5 w-5 -translate-y-1/2 text-white/60 transition-transform duration-300 group-hover:translate-x-1 md:right-8"
      />
    </Link>
  );
}

/* Back-compat single-card export */
export function NextProjectCard({ next }: { next: Project }) {
  return <NextProjectCards nexts={[next]} />;
}
