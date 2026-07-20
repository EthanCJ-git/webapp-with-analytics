import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import { StatTile } from "@/components/dashboard/stat-tile";
import { BarList } from "@/components/dashboard/bar-list";
import { RangeSelector } from "@/components/dashboard/range-selector";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false },
};

const VALID_RANGES = [7, 30, 90];
const DEFAULT_RANGE = 30;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = VALID_RANGES.includes(Number(range)) ? Number(range) : DEFAULT_RANGE;

  const supabase = await createClient();

  const [summaryRes, topPagesRes, trafficRes, countriesRes, devicesRes] = await Promise.all([
    supabase
      .rpc("dashboard_summary", { days })
      .single<{ page_views: number; unique_visitors: number; sessions: number }>(),
    supabase.rpc("dashboard_top_pages", { days, limit_count: 10 }),
    supabase.rpc("dashboard_traffic_sources", { days }),
    supabase.rpc("dashboard_country_breakdown", { days }),
    supabase.rpc("dashboard_device_mix", { days }),
  ]);

  const stats = summaryRes.data ?? { page_views: 0, unique_visitors: 0, sessions: 0 };
  const topPages = (topPagesRes.data ?? []) as unknown as { path: string; views: number }[];
  const trafficSources = (trafficRes.data ?? []) as unknown as { source: string; views: number }[];
  const countries = (countriesRes.data ?? []) as unknown as { country: string; views: number }[];
  const devices = (devicesRes.data ?? []) as unknown as { device_type: string; views: number }[];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          <RangeSelector active={days} />
          <form action={logout}>
            <button
              type="submit"
              className="text-sm text-zinc-600 underline underline-offset-4 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Log out
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Page views" value={stats.page_views} />
        <StatTile label="Unique visitors" value={stats.unique_visitors} />
        <StatTile label="Sessions" value={stats.sessions} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <BarList
          title="Top pages"
          rows={topPages.map((row) => ({ label: row.path, value: row.views }))}
        />
        <BarList
          title="Traffic sources"
          rows={trafficSources.map((row) => ({ label: row.source, value: row.views }))}
        />
        <BarList
          title="Countries"
          rows={countries.map((row) => ({ label: row.country, value: row.views }))}
        />
        <BarList
          title="Devices"
          rows={devices.map((row) => ({ label: row.device_type, value: row.views }))}
        />
      </div>
    </div>
  );
}
