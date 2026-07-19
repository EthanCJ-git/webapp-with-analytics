export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-3xl px-6 py-6 text-sm text-zinc-500 dark:text-zinc-500">
        © {year}. Built with Next.js, deployed on Vercel.
      </div>
    </footer>
  );
}
