// Lightweight visitor tracking. Public pages use a single fetch()
// call per page view — the Supabase JS client is only loaded by the
// (lazy) analytics dashboard, never by regular visitors.
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from './config.js'

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|prerender|bingpreview|facebookexternalhit|whatsapp|telegram|discordbot/i

function uuid() {
  try {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID()
  } catch { /* fall through */ }
  return 'v' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36)
}

function shouldTrack() {
  if (!isConfigured() || typeof window === 'undefined') return false
  try {
    // Your own devices: set once you log into the dashboard.
    if (localStorage.getItem('va_optout') === '1') return false
    // Force tracking during local testing: localStorage.va_debug = '1'
    if (localStorage.getItem('va_debug') === '1') return true
  } catch { /* storage blocked: keep going, still a real visitor */ }
  const host = window.location.hostname
  if (host === 'localhost' || host === '127.0.0.1') return false
  if (navigator.webdriver) return false
  if (BOT_RE.test(navigator.userAgent)) return false
  return true
}

export function parseUA(ua) {
  let os = 'Other'
  if (/Windows NT/i.test(ua)) os = 'Windows'
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS'
  else if (/Android/i.test(ua)) os = 'Android'
  else if (/Mac OS X/i.test(ua)) os = 'macOS'
  else if (/CrOS/i.test(ua)) os = 'ChromeOS'
  else if (/Linux/i.test(ua)) os = 'Linux'

  let browser = 'Other'
  if (/Edg(e|A|iOS)?\//i.test(ua)) browser = 'Edge'
  else if (/OPR\/|Opera/i.test(ua)) browser = 'Opera'
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet'
  else if (/Firefox\/|FxiOS/i.test(ua)) browser = 'Firefox'
  else if (/Chrome\/|CriOS/i.test(ua)) browser = 'Chrome'
  else if (/Safari\//i.test(ua)) browser = 'Safari'

  let device = 'Desktop'
  if (/iPad|Tablet/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) device = 'Tablet'
  else if (/Mobi|iPhone|Android/i.test(ua)) device = 'Mobile'

  // iPadOS reports itself as a Mac; touch support gives it away.
  if (os === 'macOS' && navigator.maxTouchPoints > 1) { os = 'iOS'; device = 'Tablet' }
  return { os, browser, device }
}

const NO_GEO = { country: null, country_code: null, region: null, city: null, timezone: null, isp: null }

// Country/city lookup, one network call per session (cached in
// sessionStorage, including failures). The visitor's IP is used by
// the lookup service but never stored in the database.
async function getGeo() {
  try {
    const cached = sessionStorage.getItem('va_geo')
    if (cached) return JSON.parse(cached)
  } catch { /* ignore */ }
  let geo = NO_GEO
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch('https://ipwho.is/', { signal: ctrl.signal })
    clearTimeout(timer)
    const j = await res.json()
    if (j && j.success !== false) {
      geo = {
        country: j.country || null,
        country_code: j.country_code || null,
        region: j.region || null,
        city: j.city || null,
        timezone: j.timezone?.id || null,
        isp: j.connection?.isp || null,
      }
    }
  } catch { /* offline or blocked: record the view without location */ }
  try { sessionStorage.setItem('va_geo', JSON.stringify(geo)) } catch { /* ignore */ }
  return geo
}

function getIds() {
  let vid = 'anon', isNew = false, sid = 'anon', sessionStart = false
  try {
    vid = localStorage.getItem('va_vid')
    if (!vid) { vid = uuid(); localStorage.setItem('va_vid', vid); isNew = true }
  } catch { /* ignore */ }
  try {
    sid = sessionStorage.getItem('va_sid')
    if (!sid) { sid = uuid(); sessionStorage.setItem('va_sid', sid); sessionStart = true }
  } catch { /* ignore */ }
  return { vid, sid, isNew, sessionStart }
}

// External referrer, recorded once per session (hash navigation keeps
// document.referrer frozen, so repeating it would inflate the counts).
function getReferrer(sessionStart) {
  if (!sessionStart) return null
  try {
    if (!document.referrer) return null
    const u = new URL(document.referrer)
    if (u.hostname === window.location.hostname) return null
    return u.hostname.replace(/^www\./, '').slice(0, 190)
  } catch {
    return null
  }
}

let lastPath = null

export async function trackPageView(path) {
  if (!shouldTrack()) return
  if (path.startsWith('/analytics')) return // never count your own dashboard
  if (path === lastPath) return
  lastPath = path

  const { vid, sid, isNew, sessionStart } = getIds()
  const { os, browser, device } = parseUA(navigator.userAgent)
  const geo = await getGeo()

  const row = {
    visitor_id: vid.slice(0, 60),
    session_id: sid.slice(0, 60),
    is_new_visitor: isNew,
    path: path.slice(0, 290),
    referrer: getReferrer(sessionStart),
    browser,
    os,
    device,
    screen_w: Math.round(window.screen?.width) || null,
    screen_h: Math.round(window.screen?.height) || null,
    language: (navigator.language || '').slice(0, 32) || null,
    ...geo,
    user_agent: navigator.userAgent.slice(0, 490),
  }

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
      keepalive: true,
    })
  } catch { /* analytics must never break the site */ }
}

// Records a view on every route change. Lives in Layout.
export function usePageTracking() {
  const { pathname } = useLocation()
  useEffect(() => { trackPageView(pathname) }, [pathname])
}

// Cheap "is the owner logged in?" check for the nav — reads the
// Supabase session token from localStorage without loading the SDK.
export function hasStoredSession() {
  if (!isConfigured()) return false
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0]
    return Boolean(localStorage.getItem(`sb-${ref}-auth-token`))
  } catch {
    return false
  }
}
