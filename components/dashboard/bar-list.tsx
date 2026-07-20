export function BarList({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: number }[];
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <h2 className="font-mono text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
        {title}
      </h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">No data yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li key={row.label} className="relative">
              <div
                className="absolute inset-y-0 left-0 rounded bg-zinc-950/10 dark:bg-zinc-50/10"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
              <div className="relative flex items-center justify-between gap-4 px-2 py-1 text-sm">
                <span className="truncate">{row.label}</span>
                <span className="shrink-0 text-zinc-600 tabular-nums dark:text-zinc-400">
                  {row.value.toLocaleString()}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
