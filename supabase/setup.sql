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
