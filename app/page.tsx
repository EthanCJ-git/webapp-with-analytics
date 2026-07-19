import Link from "next/link";
import { site } from "@/content/site";

export default function Home() {
  return (
    <div className="flex h-full min-h-[60vh] flex-col justify-center gap-6">
      <p className="font-mono text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-500">
        {site.role}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        {site.headline}
      </h1>
      <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        {site.tagline}
      </p>
      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/projects"
          className="border border-zinc-950 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          View projects
        </Link>
        <Link
          href={`mailto:${site.email}`}
          className="border border-zinc-950 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-950 hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black"
        >
          Get in touch
        </Link>
      </div>
    </div>
  );
}
