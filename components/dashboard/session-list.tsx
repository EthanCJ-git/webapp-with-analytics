import Link from "next/link";
import { formatDuration } from "@/lib/format";

type Session = {
  visitor_hash: string;
  started_at: string;
  ended_at: string;
  duration_seconds: number;
  page_views: number;
  entry_path: string;
  source: string;
  country: string | null;
  device_type: string | null;
};

export function SessionList({ sessions }: { sessions: Session[] }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-black/10 px-4 py-3 dark:border-white/10">
      <h2 className="font-mono text-xs tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
        Recent sessions
      </h2>
      {sessions.length === 0 ? (
        <p className="text-sm text-zinc-500">No sessions yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
          {sessions.map((session) => (
            <li key={`${session.visitor_hash}-${session.started_at}`}>
              <Link
                href={`/dashboard/sessions/${session.visitor_hash}?${new URLSearchParams({
                  start: session.started_at,
                  end: session.ended_at,
                })}`}
                className="flex items-center justify-between gap-4 py-2 text-sm hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate">{session.entry_path}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(session.started_at).toLocaleString()} · {session.source}
                    {session.country ? ` · ${session.country}` : ""}
                    {session.device_type ? ` · ${session.device_type}` : ""}
                  </span>
                </span>
                <span className="shrink-0 text-right text-zinc-600 tabular-nums dark:text-zinc-400">
                  <span className="block">
                    {session.page_views} page{session.page_views === 1 ? "" : "s"}
                  </span>
                  <span className="block text-xs">{formatDuration(session.duration_seconds)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
