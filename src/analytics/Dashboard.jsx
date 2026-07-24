// Presentational dashboard body: KPI tiles, charts, recent activity.
import { useMemo } from 'react'
import { summarize, flagEmoji } from './aggregate.js'
import { TimeSeries, HourBars, BarList, StatTile, ChartLegend } from './charts.jsx'

export const RANGES = [
  { key: '7', label: '7 days', days: 7 },
  { key: '30', label: '30 days', days: 30 },
  { key: '90', label: '90 days', days: 90 },
  { key: 'all', label: 'All time', days: null },
]

function ago(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 7 * 86400) return `${Math.floor(s / 86400)}d ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(iso))
}

function Card({ title, sub, aside, children, wide }) {
  return (
    <section className={`va-card ${wide ? 'wide' : ''}`}>
      <header className="va-card-head">
        <div>
          <h2 className="va-card-title">{title}</h2>
          {sub && <p className="va-card-sub">{sub}</p>}
        </div>
        {aside}
      </header>
      {children}
    </section>
  )
}

function RecentTable({ rows }) {
  return (
    <Card title="Recent activity" sub={rows.length ? `latest ${rows.length} page views` : null} wide>
      {rows.length === 0 ? (
        <div className="va-empty" style={{ height: 90 }}>Nothing here yet.</div>
      ) : (
        <div className="va-table" role="table" aria-label="Recent page views">
          <div className="va-tr va-thead" role="row">
            <span role="columnheader">When</span>
            <span role="columnheader">Visitor</span>
            <span role="columnheader">Page</span>
            <span role="columnheader">From</span>
            <span role="columnheader">Client</span>
          </div>
          {rows.map((r) => (
            <div className="va-tr" role="row" key={r.id}>
              <span className="va-td va-td-time" role="cell">{ago(r.created_at)}</span>
              <span className="va-td va-td-visitor" role="cell">
                {r.country_code && <span className="va-flag" aria-hidden="true">{flagEmoji(r.country_code)}</span>}
                {r.city ? `${r.city}, ` : ''}{r.country || 'Unknown location'}
                {r.is_new_visitor && <em className="va-new">new</em>}
              </span>
              <span className="va-td va-td-page" role="cell">{r.path}</span>
              <span className="va-td va-td-ref" role="cell">{r.referrer || 'N/A'}</span>
              <span className="va-td va-td-client" role="cell">{[r.device, r.browser, r.os].filter(Boolean).join(' · ')}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default function Dashboard({ rows, prevRows, days, loading }) {
  const s = useMemo(() => summarize(rows, prevRows, days), [rows, prevRows, days])

  return (
    <div className={`va-body ${loading ? 'loading' : ''}`}>
      <div className="va-kpis">
        <StatTile label="Page views" value={s.kpis.views} delta={s.kpis.deltas?.views} />
        <StatTile label="Unique visitors" value={s.kpis.visitors} delta={s.kpis.deltas?.visitors} />
        <StatTile label="Sessions" value={s.kpis.sessions} delta={s.kpis.deltas?.sessions} />
        <StatTile label="New visitors" value={s.kpis.newVisitors} delta={s.kpis.deltas?.newVisitors} />
        <StatTile label="Views today" value={s.kpis.viewsToday} />
        <StatTile label="Top country" value={s.kpis.topCountry || 'N/A'} />
      </div>

      <Card title="Traffic" sub="daily page views and unique visitors" aside={<ChartLegend />} wide>
        <TimeSeries points={s.byDay} />
      </Card>

      <div className="va-grid two">
        <Card title="Top pages" sub="by views"><BarList items={s.pages} /></Card>
        <Card title="Traffic sources" sub="by sessions"><BarList items={s.referrers} unit="sessions" /></Card>
        <Card title="Countries" sub="by unique visitors"><BarList items={s.countries} unit="visitors" /></Card>
        <Card title="Cities" sub="by unique visitors"><BarList items={s.cities} unit="visitors" /></Card>
      </div>

      <div className="va-grid three">
        <Card title="Browsers" sub="by unique visitors"><BarList items={s.browsers} unit="visitors" /></Card>
        <Card title="Operating systems" sub="by unique visitors"><BarList items={s.oses} unit="visitors" /></Card>
        <Card title="Devices" sub="by unique visitors"><BarList items={s.devices} unit="visitors" /></Card>
      </div>

      <Card title="Time of day" sub="views by hour, shown in your local time" wide>
        <HourBars hours={s.byHour} />
      </Card>

      <RecentTable rows={s.recent} />
    </div>
  )
}
