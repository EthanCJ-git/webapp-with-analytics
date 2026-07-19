export type Project = {
  slug: string;
  title: string;
  summary: string;
  description: string[];
  tech: string[];
  year: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "portfolio-analytics",
    title: "This site",
    summary:
      "A personal portfolio with a hand-rolled, privacy-first analytics pipeline instead of a third-party tracking script.",
    description: [
      "Built on Next.js App Router with the public pages statically rendered from local content — no database on the read path. Visits are recorded through a single edge API route that hashes the visitor's IP and user agent with a server-side salt (SHA-256), so returning-visitor recognition works without cookies, client-side storage, or a consent banner.",
      "A Supabase Postgres table with row-level security stores events; the owner-only dashboard reads aggregates directly through RLS with no hand-written authorization code. Sessions are derived at query time with a window-function query rather than stored, keeping the write path a single unconditional insert.",
    ],
    tech: ["Next.js", "TypeScript", "Tailwind CSS", "Supabase", "Postgres"],
    year: "2026",
    links: [{ label: "Source", href: "https://github.com/EthanCJ-git" }],
  },
  {
    slug: "project-two",
    title: "Project Two",
    summary: "Replace with a real project — one or two sentences on what it does and why it exists.",
    description: [
      "Replace with a longer description: the problem, your role, and the interesting technical decisions.",
    ],
    tech: ["Tech", "Stack", "Here"],
    year: "2025",
    links: [],
  },
  {
    slug: "project-three",
    title: "Project Three",
    summary: "Replace with a real project — one or two sentences on what it does and why it exists.",
    description: [
      "Replace with a longer description: the problem, your role, and the interesting technical decisions.",
    ],
    tech: ["Tech", "Stack", "Here"],
    year: "2024",
    links: [],
  },
];
