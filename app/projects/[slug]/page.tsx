import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return {};
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/projects"
        className="text-sm text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-50"
      >
        ← Projects
      </Link>

      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-3xl font-semibold tracking-tight">{project.title}</h1>
          <span className="shrink-0 font-mono text-xs text-zinc-500">{project.year}</span>
        </div>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">{project.summary}</p>
      </div>

      <ul className="flex flex-wrap gap-2 font-mono text-xs text-zinc-500">
        {project.tech.map((tech) => (
          <li key={tech} className="border border-black/10 px-2.5 py-1 dark:border-white/10">
            {tech}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4 text-zinc-700 dark:text-zinc-300">
        {project.description.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {project.links && project.links.length > 0 && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-black/10 pt-6 text-sm dark:border-white/10">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
