import { notFound } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { ProjectTemplate } from "@/components/projects/ProjectTemplate";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.id }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  return <ProjectTemplate project={project} />;
}
