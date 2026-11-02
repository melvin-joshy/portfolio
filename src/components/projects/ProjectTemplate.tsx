"use client";

import type { Project } from "@/data/projects";
import { getNextProjects } from "@/data/projects";
import { ProjectChrome } from "./ProjectChrome";
import { ClientBody } from "./ClientBody";
import { ClientStoryBody } from "./ClientStoryBody";
import { BuildBody } from "./BuildBody";
import { CaseStudyBody } from "./CaseStudyBody";
import { NextProjectCards } from "./NextProjectCard";

export function ProjectTemplate({ project }: { project: Project }) {
  const nexts = getNextProjects(project.id, 2);

  return (
    <ProjectChrome>
      {project.kind === "client" &&
        (project.story ? (
          <ClientStoryBody project={{ ...project, story: project.story }} />
        ) : (
          <ClientBody project={project} />
        ))}
      {project.kind === "build" && <BuildBody project={project} />}
      {project.kind === "case-study" && <CaseStudyBody project={project} />}
      {/* Every project page runs on the same 1040px column, so the next-project cards
          share its edge. The gutter sits on the outer element so the column is a full
          1040 of content. */}
      <div className="px-6 md:px-10">
        <div className="mx-auto w-full max-w-[1040px]">
          <NextProjectCards nexts={nexts} />
        </div>
      </div>
    </ProjectChrome>
  );
}
