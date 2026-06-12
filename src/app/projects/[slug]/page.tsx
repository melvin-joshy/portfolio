import { notFound, redirect } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { ProjectTemplate } from "@/components/projects/ProjectTemplate";

export function generateStaticParams() {
  // Projects with an externalUrl (e.g. Tempo) live off-site — no internal page.
  return projects.filter((p) => !p.externalUrl).map((p) => ({ slug: p.id }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();
  // External-only projects never render a case study — bounce to the live site.
  if (project.externalUrl) redirect(project.externalUrl);
  return <ProjectTemplate project={project} />;
}
