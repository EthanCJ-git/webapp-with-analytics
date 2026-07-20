-- Dashboard aggregate queries, exposed as RPC functions so the owner
-- Server Component can call the exact SQL documented in DATA_MODEL.md
-- instead of pulling raw rows and aggregating in application code.
--
-- Every function is `security invoker` (Postgres's default), so RLS on
-- `events` still applies to the caller -- these are a read-query
-- convenience, not a privilege escalation. Execute is revoked from
-- `public`/`anon` and granted only to `authenticated`, matching the
-- table's own RLS policy.

create or replace function public.dashboard_summary(days int)
returns table (page_views bigint, unique_visitors bigint, sessions bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with windowed as (
    select visitor_hash, created_at
    from public.events
    where created_at >= now() - (days || ' days')::interval
  ),
  ordered as (
    select
      created_at,
      lag(created_at) over (
        partition by visitor_hash order by created_at
      ) as prev_at
    from windowed
  ),
  marked as (
    select
      case
        when prev_at is null or created_at - prev_at > interval '30 minutes'
        then 1 else 0
      end as is_session_start
    from ordered
  )
  select
    (select count(*) from windowed) as page_views,
    (select count(distinct visitor_hash) from windowed) as unique_visitors,
    (select count(*) filter (where is_session_start = 1) from marked) as sessions;
$$;

create or replace function public.dashboard_top_pages(days int, limit_count int default 10)
returns table (path text, views bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select path, count(*) as views
  from public.events
  where created_at >= now() - (days || ' days')::interval
  group by path
  order by views desc
  limit limit_count;
$$;

create or replace function public.dashboard_traffic_sources(days int)
returns table (source text, views bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(utm_source, referrer_domain, 'direct') as source, count(*) as views
  from public.events
  where created_at >= now() - (days || ' days')::interval
  group by 1
  order by views desc;
$$;

create or replace function public.dashboard_country_breakdown(days int)
returns table (country text, views bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(country, 'unknown') as country, count(*) as views
  from public.events
  where created_at >= now() - (days || ' days')::interval
  group by 1
  order by views desc;
$$;

create or replace function public.dashboard_device_mix(days int)
returns table (device_type text, views bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(device_type, 'unknown') as device_type, count(*) as views
  from public.events
  where created_at >= now() - (days || ' days')::interval
  group by 1
  order by views desc;
$$;

revoke execute on function public.dashboard_summary(int) from public;
revoke execute on function public.dashboard_top_pages(int, int) from public;
revoke execute on function public.dashboard_traffic_sources(int) from public;
revoke execute on function public.dashboard_country_breakdown(int) from public;
revoke execute on function public.dashboard_device_mix(int) from public;

grant execute on function public.dashboard_summary(int) to authenticated;
grant execute on function public.dashboard_top_pages(int, int) to authenticated;
grant execute on function public.dashboard_traffic_sources(int) to authenticated;
grant execute on function public.dashboard_country_breakdown(int) to authenticated;
grant execute on function public.dashboard_device_mix(int) to authenticated;
