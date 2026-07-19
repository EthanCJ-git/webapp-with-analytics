"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/content/site";

const links = [
  { href: "/about", label: "About" },
  { href: "/resume", label: "Resume" },
  { href: "/projects", label: "Projects" },
  { href: "/login", label: "Login" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-black/10 dark:border-white/10 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
      <div className="flex flex-col gap-6 px-6 py-6 md:sticky md:top-0 md:h-screen md:justify-between">
        <div className="flex flex-col gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            {site.name}
          </Link>
          <nav className="flex flex-row flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400 md:flex-col md:gap-3">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={
                    active
                      ? "text-zinc-950 dark:text-zinc-50"
                      : "transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
