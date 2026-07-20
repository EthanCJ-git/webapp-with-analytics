import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = {
  title: "Session detail",
  robots: { index: false },
};

export default async function SessionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ hash: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { hash } = await params;
  const { start, end } = await searchParams;

  if (!start || !end) {
    notFound();
  }

  const supabase = await createClient();
  const { data } = await supabase.rpc("dashboard_session_events", {
    p_visitor_hash: hash,
    p_started_at: start,
    p_ended_at: end,
  });

  const events = (data ?? []) as unknown as {
    created_at: string;
    path: string;
    seconds_on_page: number | null;
  }[];

  if (events.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Dashboard
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">Session</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {new Date(start).toLocaleString()} · {events.length} page
          {events.length === 1 ? "" : "s"}
        </p>
      </div>

      <ol className="flex flex-col divide-y divide-black/10 dark:divide-white/10">
        {events.map((event, index) => (
          <li
            key={`${event.created_at}-${index}`}
            className="flex items-center justify-between gap-4 py-3 text-sm"
          >
            <span className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-zinc-500">{index + 1}</span>
              <span>{event.path}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-3 text-zinc-600 dark:text-zinc-400">
              <span className="text-xs tabular-nums">
                {new Date(event.created_at).toLocaleTimeString()}
              </span>
              <span className="tabular-nums">
                {event.seconds_on_page === null
                  ? "exited here"
                  : formatDuration(event.seconds_on_page)}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
