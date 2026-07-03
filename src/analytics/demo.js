// Plausible sample data so the dashboard can be previewed before
// Supabase is configured (and so its charts can be visually tested).

const DAY = 86400000

const weighted = (pairs) => {
  const total = pairs.reduce((s, p) => s + p[1], 0)
  let r = Math.random() * total
  for (const [v, w] of pairs) {
    r -= w
    if (r <= 0) return v
  }
  return pairs[0][0]
}

const PROFILES = [
  [{ os: 'Windows', browser: 'Chrome', device: 'Desktop' }, 28],
  [{ os: 'Windows', browser: 'Edge', device: 'Desktop' }, 9],
  [{ os: 'macOS', browser: 'Safari', device: 'Desktop' }, 12],
  [{ os: 'macOS', browser: 'Chrome', device: 'Desktop' }, 10],
  [{ os: 'iOS', browser: 'Safari', device: 'Mobile' }, 22],
  [{ os: 'Android', browser: 'Chrome', device: 'Mobile' }, 14],
  [{ os: 'iOS', browser: 'Safari', device: 'Tablet' }, 3],
  [{ os: 'Linux', browser: 'Firefox', device: 'Desktop' }, 2],
]

const PLACES = [
  [{ country: 'United States', code: 'US', city: 'Savannah', region: 'Georgia', tz: 'America/New_York' }, 16],
  [{ country: 'United States', code: 'US', city: 'Atlanta', region: 'Georgia', tz: 'America/New_York' }, 10],
  [{ country: 'United States', code: 'US', city: 'New York', region: 'New York', tz: 'America/New_York' }, 8],
  [{ country: 'United States', code: 'US', city: 'San Francisco', region: 'California', tz: 'America/Los_Angeles' }, 6],
  [{ country: 'India', code: 'IN', city: 'Mumbai', region: 'Maharashtra', tz: 'Asia/Kolkata' }, 9],
  [{ country: 'India', code: 'IN', city: 'Ahmedabad', region: 'Gujarat', tz: 'Asia/Kolkata' }, 7],
  [{ country: 'United Kingdom', code: 'GB', city: 'London', region: 'England', tz: 'Europe/London' }, 5],
  [{ country: 'Canada', code: 'CA', city: 'Toronto', region: 'Ontario', tz: 'America/Toronto' }, 4],
  [{ country: 'Germany', code: 'DE', city: 'Berlin', region: 'Berlin', tz: 'Europe/Berlin' }, 3],
  [{ country: 'Singapore', code: 'SG', city: 'Singapore', region: 'Singapore', tz: 'Asia/Singapore' }, 2],
]

const PATHS = [
  ['/', 30],
  ['/projects', 22],
  ['/projects/medieval-environment', 10],
  ['/projects/the-collision', 8],
  ['/projects/scad-distance-team-hub', 7],
  ['/about', 9],
  ['/experience', 8],
  ['/contact', 6],
]

const REFERRERS = [
  [null, 45],
  ['linkedin.com', 22],
  ['google.com', 14],
  ['github.com', 8],
  ['t.co', 4],
  ['instagram.com', 3],
  ['scad.edu', 3],
  ['bing.com', 1],
]

const HOURS = [
  [10, 6], [11, 7], [12, 8], [13, 7], [14, 8], [15, 9], [16, 9], [17, 10],
  [18, 10], [19, 11], [20, 12], [21, 11], [22, 8], [23, 5], [0, 3], [1, 2],
  [8, 4], [9, 5], [7, 2], [6, 1], [2, 1], [3, 1], [4, 1], [5, 1],
]

const LANGS = { US: 'en-US', GB: 'en-GB', CA: 'en-CA', IN: 'en-IN', DE: 'de-DE', SG: 'en-SG' }

export function demoRows(daysBack = 30) {
  const rows = []
  const now = Date.now()
  const visitorCount = 170 + Math.floor(Math.random() * 40)

  for (let v = 0; v < visitorCount; v++) {
    const vid = `demo-visitor-${v}`
    const profile = weighted(PROFILES)
    const place = weighted(PLACES)
    const sessionCount = weighted([[1, 62], [2, 25], [3, 13]])

    for (let s = 0; s < sessionCount; s++) {
      // Recent days slightly busier than old ones.
      const dayOffset = Math.pow(Math.random(), 1.4) * daysBack
      const start = new Date(now - dayOffset * DAY)
      start.setHours(weighted(HOURS), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60), 0)
      if (start.getTime() > now) start.setTime(now - Math.random() * 3600000)

      const sid = `demo-session-${v}-${s}`
      const referrer = weighted(REFERRERS)
      const viewCount = weighted([[1, 34], [2, 28], [3, 20], [4, 11], [5, 7]])
      let t = start.getTime()

      for (let p = 0; p < viewCount; p++) {
        rows.push({
          id: rows.length + 1,
          created_at: new Date(t).toISOString(),
          visitor_id: vid,
          session_id: sid,
          is_new_visitor: s === 0 && p === 0,
          path: weighted(PATHS),
          referrer: p === 0 ? referrer : null,
          browser: profile.browser,
          os: profile.os,
          device: profile.device,
          screen_w: profile.device === 'Mobile' ? 390 : 1920,
          screen_h: profile.device === 'Mobile' ? 844 : 1080,
          language: LANGS[place.code] || 'en-US',
          country: place.country,
          country_code: place.code,
          region: place.region,
          city: place.city,
          timezone: place.tz,
          isp: weighted([['Comcast', 3], ['AT&T', 2], ['Verizon', 2], ['Jio', 2], ['Airtel', 1], ['BT', 1]]),
          user_agent: 'demo',
        })
        t += (30 + Math.random() * 240) * 1000
      }
    }
  }

  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  return rows
}
