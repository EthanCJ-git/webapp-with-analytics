import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "About",
  description: site.tagline,
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-semibold tracking-tight">About</h1>
        <div className="flex flex-col gap-4 text-zinc-700 dark:text-zinc-300">
          {site.bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Skills</h2>
        <ul className="flex flex-wrap gap-2 font-mono text-xs">
          {site.skills.map((skill) => (
            <li
              key={skill}
              className="border border-black/10 px-2.5 py-1 dark:border-white/10"
            >
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 border-t border-black/10 pt-10 dark:border-white/10">
        <h2 className="text-lg font-semibold tracking-tight">Get in touch</h2>
        <p className="text-zinc-700 dark:text-zinc-300">
          The fastest way to reach me is email.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <a
            href={`mailto:${site.email}`}
            className="underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50"
          >
            {site.email}
          </a>
          {site.socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50"
            >
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
