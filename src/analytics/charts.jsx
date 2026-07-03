// Hand-rolled SVG charts for the analytics dashboard.
// Marks wear the series color; all text wears text tokens.
import { useEffect, useRef, useState } from 'react'

export const SERIES = {
  views: { label: 'Views', color: '#38bdf8' }, // site accent
  visitors: { label: 'Visitors', color: '#0284c7' }, // CVD-separated pair (ΔE 19.8 on #000)
}

const GRID = 'rgba(255, 255, 255, 0.07)'
const CROSSHAIR = 'rgba(255, 255, 255, 0.25)'

export function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 10000) return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 }).format(n)
  return n.toLocaleString()
}

function useWidth(ref, fallback = 640) {
  const [w, setW] = useState(0)
  useEffect(() => {
    if (!ref.current) return undefined
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return w || fallback
}

// Smallest "clean" step >= x, so axis ticks stay round integers.
function niceStep(x) {
  const steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500]
  for (const s of steps) if (s >= x) return s
  let mult = 1000
  for (;;) {
    for (const s of [1, 2, 2.5, 5]) if (s * mult >= x) return s * mult
    mult *= 10
  }
}

function Empty({ height, children }) {
  return (
    <div className="va-empty" style={{ height }}>
      {children || 'No visits in this range yet.'}
    </div>
  )
}

const dateFmt = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const dateFmtLong = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

// Views + visitors over time: 2px lines, 10%-opacity area on the lead
// series only, crosshair + one tooltip for both series, arrow-key nav.
export function TimeSeries({ points, height = 250 }) {
  const boxRef = useRef(null)
  const w = useWidth(boxRef)
  const [ix, setIx] = useState(null)

  const total = points.reduce((s, p) => s + p.views, 0)
  if (!points.length || total === 0) return <Empty height={height} />

  const pad = { t: 18, r: 18, b: 28, l: 42 }
  const innerW = w - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const n = points.length
  const maxViews = Math.max(...points.map((p) => p.views), ...points.map((p) => p.visitors))
  const tick = niceStep(Math.max(1, Math.ceil(maxViews / 4)))
  const yMax = tick * 4
  const x = (i) => (n === 1 ? pad.l + innerW / 2 : pad.l + (i * innerW) / (n - 1))
  const y = (v) => pad.t + (1 - v / yMax) * innerH
  const linePath = (key) => points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join('')
  const areaPath = `${linePath('views')}L${x(n - 1).toFixed(1)},${y(0)}L${x(0).toFixed(1)},${y(0)}Z`

  // ~6 date labels plus the last day; drop a stepped one that would crowd it.
  const step = Math.max(1, Math.ceil(n / 6))
  const xTicks = []
  for (let i = 0; i < n; i += step) if (n - 1 - i >= step / 2) xTicks.push(i)
  xTicks.push(n - 1)

  const toIndex = (clientX) => {
    const box = boxRef.current.getBoundingClientRect()
    const px = clientX - box.left - pad.l
    return Math.max(0, Math.min(n - 1, Math.round((px / Math.max(1, innerW)) * (n - 1))))
  }
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { setIx((v) => Math.max(0, (v ?? n - 1) - 1)); e.preventDefault() }
    else if (e.key === 'ArrowRight') { setIx((v) => Math.min(n - 1, (v ?? n - 1) + 1)); e.preventDefault() }
    else if (e.key === 'Home') { setIx(0); e.preventDefault() }
    else if (e.key === 'End') { setIx(n - 1); e.preventDefault() }
    else if (e.key === 'Escape') setIx(null)
  }

  const last = points[n - 1]
  const endLabelY = y(last.views) < pad.t + 16 ? y(last.views) + 20 : y(last.views) - 12
  const cur = ix != null ? points[ix] : null
  const tipLeft = cur ? x(ix) : 0
  const flip = cur && tipLeft > w * 0.55

  return (
    <div className="va-chart" ref={boxRef} style={{ height }}>
      <svg
        width={w}
        height={height}
        role="img"
        aria-label={`Daily traffic, ${n} days: ${total} views, peaking at ${maxViews}. Use arrow keys to inspect days.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setIx((v) => v ?? n - 1)}
        onBlur={() => setIx(null)}
        onPointerMove={(e) => setIx(toIndex(e.clientX))}
        onPointerLeave={() => setIx(null)}
      >
        {[1, 2, 3, 4].map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={w - pad.r} y1={y(t * tick)} y2={y(t * tick)} stroke={GRID} strokeWidth="1" />
            <text x={pad.l - 8} y={y(t * tick) + 4} textAnchor="end" className="va-axis">{fmtNum(t * tick)}</text>
          </g>
        ))}
        <line x1={pad.l} x2={w - pad.r} y1={y(0)} y2={y(0)} stroke={GRID} strokeWidth="1" />
        {xTicks.map((i) => (
          <text key={i} x={x(i)} y={height - 8} textAnchor={i === n - 1 ? 'end' : i === 0 ? 'start' : 'middle'} className="va-axis">
            {dateFmt.format(points[i].date)}
          </text>
        ))}

        <path d={areaPath} fill={SERIES.views.color} fillOpacity="0.1" />
        <path d={linePath('visitors')} fill="none" stroke={SERIES.visitors.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={linePath('views')} fill="none" stroke={SERIES.views.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* end markers with a 2px surface ring */}
        <circle cx={x(n - 1)} cy={y(last.visitors)} r="4.5" fill={SERIES.visitors.color} stroke="#000" strokeWidth="2" />
        <circle cx={x(n - 1)} cy={y(last.views)} r="4.5" fill={SERIES.views.color} stroke="#000" strokeWidth="2" />
        <text x={Math.min(x(n - 1), w - 10)} y={endLabelY} textAnchor="end" className="va-endlabel">{fmtNum(last.views)}</text>

        {cur && (
          <g pointerEvents="none">
            <line x1={x(ix)} x2={x(ix)} y1={pad.t} y2={y(0)} stroke={CROSSHAIR} strokeWidth="1" />
            <circle cx={x(ix)} cy={y(cur.visitors)} r="4.5" fill={SERIES.visitors.color} stroke="#000" strokeWidth="2" />
            <circle cx={x(ix)} cy={y(cur.views)} r="4.5" fill={SERIES.views.color} stroke="#000" strokeWidth="2" />
          </g>
        )}
      </svg>

      {cur && (
        <div className="va-tip" style={flip ? { right: w - tipLeft + 10 } : { left: tipLeft + 10 }}>
          <div className="va-tip-head">{dateFmtLong.format(cur.date)}</div>
          <div className="va-tip-row">
            <span className="va-tip-key" style={{ background: SERIES.views.color }} />
            <strong>{fmtNum(cur.views)}</strong>&nbsp;{SERIES.views.label}
          </div>
          <div className="va-tip-row">
            <span className="va-tip-key" style={{ background: SERIES.visitors.color }} />
            <strong>{fmtNum(cur.visitors)}</strong>&nbsp;{SERIES.visitors.label}
          </div>
        </div>
      )}
    </div>
  )
}

export function ChartLegend() {
  return (
    <div className="va-legend" aria-hidden="true">
      {Object.values(SERIES).map((s) => (
        <span key={s.label} className="va-legend-item">
          <span className="va-tip-key" style={{ background: s.color }} />
          {s.label}
        </span>
      ))}
    </div>
  )
}

// Views by local hour of day. Single measure: one hue, height encodes.
export function HourBars({ hours, height = 150 }) {
  const boxRef = useRef(null)
  const w = useWidth(boxRef)
  const [ix, setIx] = useState(null)

  const total = hours.reduce((a, b) => a + b, 0)
  if (total === 0) return <Empty height={height} />

  const pad = { t: 16, r: 8, b: 24, l: 8 }
  const innerW = w - pad.l - pad.r
  const innerH = height - pad.t - pad.b
  const max = Math.max(...hours)
  const slot = innerW / 24
  const barW = Math.min(24, Math.max(3, slot - Math.max(2, slot * 0.35)))
  const baseline = pad.t + innerH

  const bar = (v, i) => {
    const h = (v / max) * innerH
    if (h <= 0) return null
    const bx = pad.l + i * slot + (slot - barW) / 2
    const by = baseline - h
    const r = Math.min(4, barW / 2, h)
    return `M${bx},${baseline}L${bx},${by + r}Q${bx},${by} ${bx + r},${by}L${bx + barW - r},${by}Q${bx + barW},${by} ${bx + barW},${by + r}L${bx + barW},${baseline}Z`
  }
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') { setIx((v) => Math.max(0, (v ?? 23) - 1)); e.preventDefault() }
    else if (e.key === 'ArrowRight') { setIx((v) => Math.min(23, (v ?? -1) + 1)); e.preventDefault() }
    else if (e.key === 'Escape') setIx(null)
  }
  const peak = hours.indexOf(max)
  const tipX = ix != null ? pad.l + ix * slot + slot / 2 : 0

  return (
    <div className="va-chart" ref={boxRef} style={{ height }}>
      <svg
        width={w}
        height={height}
        role="img"
        aria-label={`Views by hour of day. Busiest hour ${peak}:00 with ${max} views. Use arrow keys to inspect hours.`}
        tabIndex={0}
        onKeyDown={onKey}
        onFocus={() => setIx((v) => v ?? peak)}
        onBlur={() => setIx(null)}
        onPointerLeave={() => setIx(null)}
      >
        <line x1={pad.l} x2={w - pad.r} y1={pad.t} y2={pad.t} stroke={GRID} strokeWidth="1" />
        <text x={w - pad.r} y={pad.t - 5} textAnchor="end" className="va-axis">{fmtNum(max)}</text>
        <line x1={pad.l} x2={w - pad.r} y1={baseline} y2={baseline} stroke={GRID} strokeWidth="1" />
        {[0, 6, 12, 18].map((h) => (
          <text key={h} x={pad.l + h * slot + slot / 2} y={height - 6} textAnchor="middle" className="va-axis">
            {String(h).padStart(2, '0')}
          </text>
        ))}
        {hours.map((v, i) => {
          const d = bar(v, i)
          return d ? <path key={i} d={d} fill={ix === i ? '#7dd3fc' : SERIES.views.color} /> : null
        })}
        {/* hit targets: the full slot, much bigger than the mark */}
        {hours.map((v, i) => (
          <rect
            key={`h${i}`}
            x={pad.l + i * slot}
            y={pad.t}
            width={slot}
            height={innerH}
            fill="transparent"
            onPointerMove={() => setIx(i)}
          />
        ))}
      </svg>
      {ix != null && (
        <div className="va-tip" style={tipX > w * 0.6 ? { right: w - tipX + 8 } : { left: tipX + 8 }}>
          <div className="va-tip-head">{String(ix).padStart(2, '0')}:00 – {String((ix + 1) % 24).padStart(2, '0')}:00</div>
          <div className="va-tip-row"><strong>{fmtNum(hours[ix])}</strong>&nbsp;views</div>
        </div>
      )}
    </div>
  )
}

// Horizontal bar list: one hue (nominal categories of one measure),
// values visible inline so no tooltip is needed.
export function BarList({ items, unit = 'views' }) {
  if (!items.length) return <Empty height={120} />
  const max = Math.max(...items.map((i) => i.value), 1)
  const total = items.reduce((s, i) => s + i.value, 0)
  return (
    <ul className="va-bars">
      {items.map((it) => (
        <li key={it.label} title={`${it.label} — ${it.value.toLocaleString()} ${unit} (${Math.round((it.value / total) * 100)}%)`}>
          <div className="va-bar-top">
            <span className="va-bar-label">{it.icon ? <span className="va-bar-icon">{it.icon}</span> : null}{it.label}</span>
            <span className="va-bar-value">{fmtNum(it.value)}</span>
          </div>
          <div className="va-bar-track">
            <div className="va-bar-fill" style={{ width: `${Math.max(1.5, (it.value / max) * 100)}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

// KPI tile: label / value / optional delta vs the previous period.
export function StatTile({ label, value, delta, hint }) {
  const dir = delta == null ? null : delta >= 0 ? 'up' : 'down'
  return (
    <div className="va-tile">
      <span className="va-tile-label">{label}</span>
      <span className="va-tile-value">{typeof value === 'number' ? fmtNum(value) : (value ?? '—')}</span>
      {delta != null && (
        <span className={`va-tile-delta ${dir}`}>
          <span aria-hidden="true">{dir === 'up' ? '▲' : '▼'}</span> {Math.abs(delta)}%
          <em> vs prev period</em>
        </span>
      )}
      {hint && <span className="va-tile-hint">{hint}</span>}
    </div>
  )
}
