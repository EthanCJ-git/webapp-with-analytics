export function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <span className="font-mono text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
        {label}
      </span>
      <span className="text-3xl font-semibold tracking-tight tabular-nums">
        {value.toLocaleString()}
      </span>
    </div>
  );
}
