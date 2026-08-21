-- ============================================================
-- Visitor analytics for virenchauhan.com
--
-- Run this ONCE in your Supabase project:
--   Dashboard -> SQL Editor -> New query -> paste this file -> Run
--
-- What it creates:
--   * page_views table (one row per page view)
--   * Row Level Security so the public site key can only INSERT
--     views and only YOUR logged-in account can read them
-- ============================================================

create table if not exists public.page_views (
  id             bigint generated always as identity primary key,
  created_at     timestamptz not null default now(),

  -- anonymous ids generated in the browser (no raw IPs are stored)
  visitor_id     text not null,
  session_id     text not null,
  is_new_visitor boolean not null default false,

  path           text not null,
  referrer       text,

  browser        text,
  os             text,
  device         text,
  screen_w       integer,
  screen_h       integer,
  language       text,

  country        text,
  country_code   text,
  region         text,
  city           text,
  timezone       text,
  isp            text,

  user_agent     text
);

alter table public.page_views enable row level security;

-- The public site (anon key) may only record views: never read,
-- edit, or delete them. Length caps keep junk submissions out.
drop policy if exists "anyone can record a page view" on public.page_views;
create policy "anyone can record a page view"
  on public.page_views
  for insert
  to anon, authenticated
  with check (
    char_length(visitor_id) <= 64
    and char_length(session_id) <= 64
    and char_length(path) <= 300
    and (referrer   is null or char_length(referrer)   <= 200)
    and (user_agent is null or char_length(user_agent) <= 500)
    and (city       is null or char_length(city)       <= 120)
    and (country    is null or char_length(country)    <= 120)
  );

-- Only you can read the data. This must match the email of the
-- user you create under Authentication -> Users in Supabase.
drop policy if exists "owner can read page views" on public.page_views;
create policy "owner can read page views"
  on public.page_views
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'chauhan.viren08@gmail.com');

create index if not exists page_views_created_at_idx
  on public.page_views (created_at desc);

-- ------------------------------------------------------------
-- Defence in depth on the grants themselves.
--
-- The policies above are what actually protect the data, and they do work:
-- an anon request to read, update, or delete a row comes back with nothing,
-- because row level security denies by default when no policy matches.
--
-- But the anon role was still holding select, update and delete GRANTS on the
-- table, so those policies were the single thing standing between a public key
-- and the data. One careless policy edit later (a "for all", a "using (true)")
-- and there would be nothing underneath to catch it.
--
-- The browser only ever inserts. Reading is done by the owner through the
-- dashboard, which runs as the authenticated role, so anon needs nothing else.
-- Now a leak takes two independent mistakes instead of one.
revoke all on public.page_views from anon;
grant insert on public.page_views to anon;
