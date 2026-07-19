import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "A selection of projects.",
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <ul className="flex flex-col gap-8">
        {projects.map((project) => (
          <li key={project.slug}>
            <Link href={`/projects/${project.slug}`} className="group flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-xl font-semibold tracking-tight underline-offset-4 group-hover:underline">
                  {project.title}
                </h2>
                <span className="shrink-0 font-mono text-xs text-zinc-500">
                  {project.year}
                </span>
              </div>
              <p className="text-zinc-600 dark:text-zinc-400">{project.summary}</p>
              <ul className="flex flex-wrap gap-2 pt-1 font-mono text-xs text-zinc-500">
                {project.tech.map((tech) => (
                  <li key={tech} className="border border-black/10 px-2 py-0.5 dark:border-white/10">
                    {tech}
                  </li>
                ))}
              </ul>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
