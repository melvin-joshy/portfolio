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
  const isStory = project.kind === "client" && !!project.story;

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
      {/* Story pages run on a single 1040px column, so the next-project cards
          match it instead of the wider default container every other project
          uses — otherwise the page ends on a visibly different edge. The gutter
          sits on the outer element so the column is a full 1040 of content. */}
      {isStory ? (
        <div className="px-6 md:px-10">
          <div className="mx-auto w-full max-w-[1040px]">
            <NextProjectCards nexts={nexts} />
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <NextProjectCards nexts={nexts} />
        </div>
      )}
    </ProjectChrome>
  );
}
