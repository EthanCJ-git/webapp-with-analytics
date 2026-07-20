import Link from "next/link";

const RANGES = [7, 30, 90] as const;

export function RangeSelector({ active }: { active: number }) {
  return (
    <div className="flex gap-2 text-sm">
      {RANGES.map((days) => (
        <Link
          key={days}
          href={`/dashboard?range=${days}`}
          className={
            days === active
              ? "rounded-md bg-zinc-950 px-3 py-1 text-white dark:bg-zinc-50 dark:text-zinc-950"
              : "rounded-md border border-black/10 px-3 py-1 text-zinc-600 hover:text-zinc-950 dark:border-white/10 dark:text-zinc-400 dark:hover:text-zinc-50"
          }
        >
          {days}d
        </Link>
      ))}
    </div>
  );
}
