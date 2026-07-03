// Pure client-side aggregation for the analytics dashboard.
// Row volume is portfolio-scale, so everything is computed in memory.

const DAY = 86400000

export function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayKey(d) {
  const x = new Date(d)
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${x.getFullYear()}-${m}-${day}`
}

export function flagEmoji(cc) {
  if (!cc || cc.length !== 2) return ''
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 127397 + c.charCodeAt(0)))
}

// Views per key (e.g. per path).
function countBy(rows, getKey, limit = 7) {
  const m = new Map()
  for (const r of rows) {
    const k = getKey(r)
    if (!k) continue
    m.set(k, (m.get(k) || 0) + 1)
  }
  return [...m.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({ label, value }))
}

// Unique visitors per key (so one heavy reader can't dominate).
function visitorsBy(rows, getKey, limit = 7) {
  const m = new Map()
  for (const r of rows) {
    const k = getKey(r)
    if (!k) continue
    if (!m.has(k)) m.set(k, new Set())
    m.get(k).add(r.visitor_id)
  }
  return [...m.entries()]
    .map(([label, set]) => ({ label, value: set.size }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
}

// First row of each session. Rows arrive newest-first, so the last
// write per session id is its oldest (= entry) view.
function sessionStarts(rows) {
  const m = new Map()
  for (const r of rows) m.set(r.session_id, r)
  return [...m.values()]
}

// Daily buckets from the range start (or oldest row) through today,
// gap-filled with zeroes. Uses a Date cursor so DST days stay correct.
export function seriesByDay(rows, days) {
  const end = startOfDay(new Date())
  let cursor
  if (days) {
    cursor = new Date(end)
    cursor.setDate(cursor.getDate() - (days - 1))
  } else {
    const oldest = rows.length ? new Date(rows[rows.length - 1].created_at) : end
    cursor = startOfDay(oldest)
  }
  const buckets = new Map()
  while (cursor.getTime() <= end.getTime()) {
    buckets.set(dayKey(cursor), { date: new Date(cursor), views: 0, visitors: new Set() })
    cursor.setDate(cursor.getDate() + 1)
  }
  for (const r of rows) {
    const b = buckets.get(dayKey(new Date(r.created_at)))
    if (b) {
      b.views += 1
      b.visitors.add(r.visitor_id)
    }
  }
  return [...buckets.values()].map((b) => ({ date: b.date, views: b.views, visitors: b.visitors.size }))
}

export function viewsByHour(rows) {
  const hours = new Array(24).fill(0)
  for (const r of rows) hours[new Date(r.created_at).getHours()] += 1
  return hours
}

const uniq = (xs) => new Set(xs).size

export function summarize(rows, prevRows, days) {
  const views = rows.length
  const visitors = uniq(rows.map((r) => r.visitor_id))
  const sessions = uniq(rows.map((r) => r.session_id))
  const newVisitors = uniq(rows.filter((r) => r.is_new_visitor).map((r) => r.visitor_id))
  const midnight = startOfDay(new Date()).getTime()
  const viewsToday = rows.filter((r) => new Date(r.created_at).getTime() >= midnight).length

  const pct = (cur, prev) => (prev > 0 ? Math.round(((cur - prev) / prev) * 100) : null)
  const deltas = prevRows
    ? {
        views: pct(views, prevRows.length),
        visitors: pct(visitors, uniq(prevRows.map((r) => r.visitor_id))),
        sessions: pct(sessions, uniq(prevRows.map((r) => r.session_id))),
        newVisitors: pct(newVisitors, uniq(prevRows.filter((r) => r.is_new_visitor).map((r) => r.visitor_id))),
      }
    : null

  const codeByCountry = new Map()
  for (const r of rows) {
    if (r.country && r.country_code && !codeByCountry.has(r.country)) codeByCountry.set(r.country, r.country_code)
  }
  const countries = visitorsBy(rows, (r) => r.country).map((c) => ({
    ...c,
    icon: flagEmoji(codeByCountry.get(c.label)),
  }))

  const cities = visitorsBy(rows, (r) => (r.city ? `${r.city}${r.country_code ? ', ' + r.country_code : ''}` : null))

  return {
    kpis: { views, visitors, sessions, newVisitors, viewsToday, topCountry: countries[0]?.label || null, deltas },
    byDay: seriesByDay(rows, days),
    byHour: viewsByHour(rows),
    pages: countBy(rows, (r) => r.path),
    referrers: countBy(sessionStarts(rows), (r) => r.referrer || 'Direct / none'),
    countries,
    cities,
    browsers: visitorsBy(rows, (r) => r.browser, 6),
    oses: visitorsBy(rows, (r) => r.os, 6),
    devices: visitorsBy(rows, (r) => r.device, 4),
    recent: rows.slice(0, 40),
  }
}
