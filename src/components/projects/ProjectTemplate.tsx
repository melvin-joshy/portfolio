"use client";

import type { Project } from "@/data/projects";
import { getNextProjects } from "@/data/projects";
import { ProjectChrome } from "./ProjectChrome";
import { ClientBody } from "./ClientBody";
import { BuildBody } from "./BuildBody";
import { CaseStudyBody } from "./CaseStudyBody";
import { NextProjectCards } from "./NextProjectCard";

export function ProjectTemplate({ project }: { project: Project }) {
  const nexts = getNextProjects(project.id, 2);

  return (
    <ProjectChrome>
      {project.kind === "client" && <ClientBody project={project} />}
      {project.kind === "build" && <BuildBody project={project} />}
      {project.kind === "case-study" && <CaseStudyBody project={project} />}
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <NextProjectCards nexts={nexts} />
      </div>
    </ProjectChrome>
  );
}
