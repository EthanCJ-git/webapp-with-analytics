-- Session list + per-session page timeline. Sessions are derived at read
-- time, same as `dashboard_summary` in 0002 -- no session_id is stored.
-- A session is identified by (visitor_hash, started_at); because a given
-- visitor's sessions never overlap in time (they're built by partitioning
-- that visitor's own events on a 30-minute gap), the pair (started_at,
-- ended_at) is enough to unambiguously refetch one session's events later.

create or replace function public.dashboard_sessions(days int, limit_count int default 25)
returns table (
  visitor_hash text,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds int,
  page_views bigint,
  entry_path text,
  source text,
  country text,
  device_type text
)
language sql
stable
security invoker
set search_path = ''
as $$
  with windowed as (
    select
      visitor_hash, created_at, path, referrer_domain,
      utm_source, country, device_type
    from public.events
    where created_at >= now() - (days || ' days')::interval
  ),
  marked as (
    select
      *,
      case
        when lag(created_at) over (partition by visitor_hash order by created_at) is null
          or created_at - lag(created_at) over (partition by visitor_hash order by created_at) > interval '30 minutes'
        then 1 else 0
      end as is_session_start
    from windowed
  ),
  numbered as (
    select
      *,
      sum(is_session_start) over (partition by visitor_hash order by created_at) as session_seq
    from marked
  )
  select
    visitor_hash,
    min(created_at) as started_at,
    max(created_at) as ended_at,
    extract(epoch from max(created_at) - min(created_at))::int as duration_seconds,
    count(*) as page_views,
    (array_agg(path order by created_at))[1] as entry_path,
    (array_agg(coalesce(utm_source, referrer_domain, 'direct') order by created_at))[1] as source,
    (array_agg(country order by created_at))[1] as country,
    (array_agg(device_type order by created_at))[1] as device_type
  from numbered
  group by visitor_hash, session_seq
  order by started_at desc
  limit limit_count;
$$;

create or replace function public.dashboard_session_events(
  p_visitor_hash text,
  p_started_at timestamptz,
  p_ended_at timestamptz
)
returns table (
  created_at timestamptz,
  path text,
  seconds_on_page int
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    created_at,
    path,
    extract(epoch from (
      lead(created_at) over (order by created_at) - created_at
    ))::int as seconds_on_page
  from public.events
  where visitor_hash = p_visitor_hash
    and created_at >= p_started_at
    and created_at <= p_ended_at
  order by created_at;
$$;

revoke execute on function public.dashboard_sessions(int, int) from public;
revoke execute on function public.dashboard_session_events(text, timestamptz, timestamptz) from public;

grant execute on function public.dashboard_sessions(int, int) to authenticated;
grant execute on function public.dashboard_session_events(text, timestamptz, timestamptz) to authenticated;
