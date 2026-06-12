import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getProject, projects } from "@/data/projects";
import { ProjectTemplate } from "@/components/projects/ProjectTemplate";

export function generateStaticParams() {
  // Projects with an externalUrl (e.g. Tempo) live off-site — no internal page.
  return projects.filter((p) => !p.externalUrl).map((p) => ({ slug: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};

  const title = `${project.name} — ${project.tag}`;
  const description = project.description;
  const url = `https://melvinjoshy.com/projects/${project.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
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
