import type { Metadata } from "next";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: "Resume",
  description: `Resume for ${site.name}, ${site.role}.`,
};

export default function ResumePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold tracking-tight">Resume</h1>
      <p className="max-w-xl text-zinc-600 dark:text-zinc-400">
        Download a PDF copy below, or see the {" "}
        <a href="/about" className="underline underline-offset-4 hover:text-zinc-950 dark:hover:text-zinc-50">
          About
        </a>{" "}
        page for the same background in prose form.
      </p>
      <a
        href="/resume.pdf"
        download
        className="inline-flex w-fit items-center gap-2 border border-zinc-950 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Download PDF
      </a>
    </div>
  );
}
