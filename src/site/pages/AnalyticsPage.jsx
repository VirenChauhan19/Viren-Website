// Private visitor-analytics dashboard, lazy-loaded at /#/analytics.
// Regular visitors never download this chunk (or the Supabase SDK).
import { useCallback, useEffect, useState } from 'react'
import Page from '../Page.jsx'
import { SUPABASE_URL, SUPABASE_ANON_KEY, isConfigured } from '../../analytics/config.js'
import { startOfDay } from '../../analytics/aggregate.js'
import Dashboard, { RANGES } from '../../analytics/Dashboard.jsx'
import '../../analytics/analytics.css'

const DAY = 86400000

let sbPromise = null
function getSupabase() {
  if (!sbPromise) {
    sbPromise = import('@supabase/supabase-js').then((m) =>
      m.createClient(SUPABASE_URL, SUPABASE_ANON_KEY),
    )
  }
  return sbPromise
}

function SetupPanel() {
  return (
    <div className="va-panel">
      <h2 className="va-panel-title">One-time setup</h2>
      <p className="va-panel-sub">
        Tracking is off until the site is connected to its (free) Supabase database.
        Five steps, ~10 minutes:
      </p>
      <ol className="va-steps">
        <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer">supabase.com</a>.</li>
        <li>In the project&apos;s <b>SQL Editor</b>, paste and run the file <code>supabase/setup.sql</code> from this repo.</li>
        <li>Under <b>Authentication → Users</b>, add yourself as a user (email + password). Use the email inside <code>setup.sql</code> — only that account can read the data.</li>
        <li>Under <b>Project Settings → API</b>, copy the <b>Project URL</b> and <b>anon public key</b> into <code>src/analytics/config.js</code>.</li>
        <li>Commit and push. Once deployed, sign in here and the numbers start flowing.</li>
      </ol>
    </div>
  )
}

function LoginPanel() {
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const sb = await getSupabase()
      const { error } = await sb.auth.signInWithPassword({ email, password: pw })
      if (error) setErr(error.message)
      else {
        try { localStorage.setItem('va_optout', '1') } catch { /* ignore */ }
        window.dispatchEvent(new Event('va-auth'))
      }
    } catch (e2) {
      setErr(e2.message || 'Could not reach Supabase.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="va-panel va-login">
      <h2 className="va-panel-title">Just me back here</h2>
      <p className="va-panel-sub">This is where I peek at the site&apos;s visitor stats. If you&apos;re me — welcome back. If not, the projects page is way more fun.</p>
      <form onSubmit={submit}>
        <label>
          <span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label>
          <span>Password</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
        </label>
        {err && <p className="va-error" role="alert">{err}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}

export default function AnalyticsPage() {
  const configured = isConfigured()
  const [session, setSession] = useState(undefined) // undefined = still checking
  const [rangeKey, setRangeKey] = useState('30')
  const [data, setData] = useState({ rows: [], prevRows: null })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [optout, setOptout] = useState(() => {
    try { return localStorage.getItem('va_optout') === '1' } catch { return false }
  })

  const range = RANGES.find((r) => r.key === rangeKey)

  // Session bootstrap + keep the nav's owner-tab in sync.
  useEffect(() => {
    if (!configured) { setSession(null); return undefined }
    let sub
    getSupabase().then((sb) => {
      sb.auth.getSession().then(({ data: d }) => setSession(d.session ?? null))
      const res = sb.auth.onAuthStateChange((_evt, s) => {
        setSession(s ?? null)
        window.dispatchEvent(new Event('va-auth'))
      })
      sub = res.data.subscription
    })
    return () => sub?.unsubscribe()
  }, [configured])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const days = range.days
      // Calendar-day boundaries so the KPIs, deltas, and the daily chart
      // all agree: "30 days" = today plus the previous 29 whole days.
      let splitAt = null
      let sinceMs = null
      if (days) {
        const start = startOfDay(new Date())
        start.setDate(start.getDate() - (days - 1))
        splitAt = start.getTime()
        const prevStart = new Date(start)
        prevStart.setDate(prevStart.getDate() - days)
        sinceMs = prevStart.getTime() // previous period, for the deltas
      }
      const sb = await getSupabase()
      const sinceIso = sinceMs != null ? new Date(sinceMs).toISOString() : null
      let all = []
      for (let from = 0; from < 10000; from += 1000) {
        let q = sb.from('page_views').select('*').order('created_at', { ascending: false }).range(from, from + 999)
        if (sinceIso) q = q.gte('created_at', sinceIso)
        const { data: chunk, error: err } = await q
        if (err) throw err
        all = all.concat(chunk)
        if (chunk.length < 1000) break
      }
      if (splitAt != null) {
        const rows = []
        const prevRows = []
        for (const r of all) (new Date(r.created_at).getTime() >= splitAt ? rows : prevRows).push(r)
        setData({ rows, prevRows })
      } else {
        setData({ rows: all, prevRows: null })
      }
    } catch (e) {
      const msg = e.message || String(e)
      setError(/relation .* does not exist/i.test(msg)
        ? `${msg} — run supabase/setup.sql in your Supabase SQL Editor.`
        : msg)
    } finally {
      setLoading(false)
    }
  }, [range.days])

  const active = configured && Boolean(session)

  useEffect(() => {
    if (active) load()
  }, [active, load])

  // Light auto-refresh so the "Recent activity" feed feels live.
  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => { if (!document.hidden) load() }, 60000)
    return () => clearInterval(id)
  }, [active, load])

  const toggleOptout = () => {
    setOptout((v) => {
      try { localStorage.setItem('va_optout', v ? '0' : '1') } catch { /* ignore */ }
      return !v
    })
  }

  const signOut = async () => {
    const sb = await getSupabase()
    await sb.auth.signOut()
    window.dispatchEvent(new Event('va-auth'))
  }

  return (
    <Page className="va-page">
      <section className="va-wrap">
        <header className="va-head">
          <span className="kicker">analytics</span>
          <h1 className="section-title">Visitor <span className="hl-cyan">Analytics</span></h1>
          <p className="section-sub">
            Who&apos;s opening virenchauhan.com — where they&apos;re from, what they read, and how they got here.
          </p>
        </header>

        {!configured && <SetupPanel />}
        {configured && session === undefined && <div className="va-boot">Connecting…</div>}
        {configured && session === null && <LoginPanel />}

        {active && (
          <>
            <div className="va-toolbar">
              <div className="va-chips" role="group" aria-label="Date range">
                {RANGES.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    className={`va-chip ${rangeKey === r.key ? 'on' : ''}`}
                    aria-pressed={rangeKey === r.key}
                    onClick={() => setRangeKey(r.key)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <div className="va-tools">
                <button type="button" className="va-ghostbtn" onClick={load} disabled={loading}>
                  {loading ? 'Refreshing…' : '⟳ Refresh'}
                </button>
                <label className="va-switch" title="Keeps your own browsing on this device out of the stats">
                  <input type="checkbox" checked={optout} onChange={toggleOptout} />
                  <span className="va-switch-track" aria-hidden="true" />
                  Ignore my visits
                </label>
                <button type="button" className="va-ghostbtn" onClick={signOut}>Sign out</button>
              </div>
            </div>

            {error && <p className="va-error va-error-wide" role="alert">Couldn&apos;t load data: {error}</p>}

            <Dashboard rows={data.rows} prevRows={data.prevRows} days={range.days} loading={loading} />
          </>
        )}
      </section>
    </Page>
  )
}
