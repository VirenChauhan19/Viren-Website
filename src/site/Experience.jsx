import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { experience } from '../data/content.js'
import { youtubeWatchUrl } from './asset.js'

// Engineering signal first; the ops/sport track record follows.
const GROUPS = [
  { id: 'tech', label: 'Engineering & Design', desc: 'Shipped software and client design work.' },
  { id: 'ops', label: 'Operations, Sport & Leadership', desc: 'Big events, campus roles, and the endurance world that built the work ethic.' },
]

function TimelineItem({ exp, index }) {
  const [seen, setSeen] = useState(false)
  const active = exp.dates && /present|upcoming/i.test(exp.dates)
  const reels = (exp.media || []).filter((m) => m.type === 'youtube')

  return (
    <motion.li
      className={`tl-item ${active ? 'active' : ''} ${seen ? 'seen' : ''}`}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1], delay: Math.min(index * 0.04, 0.2) }}
      onViewportEnter={() => setSeen(true)}
    >
      <span className="tl-node" />
      <div className="tl-card">
        <div className="tl-top">
          <span className="tl-dates">{exp.dates || ''}</span>
          {active && <span className="tl-badge">ACTIVE</span>}
        </div>
        <h3 className="tl-role">{exp.role}</h3>
        <div className="tl-org">
          {exp.org}
          {exp.location ? ` · ${exp.location}` : ''}
        </div>

        {exp.detail && <p className="tl-detail">{exp.detail}</p>}
        {exp.bullets && exp.bullets.length > 0 && (
          <ul className="tl-bullets">
            {exp.bullets.map((b, j) => (
              <li key={j}>{b}</li>
            ))}
          </ul>
        )}
        {reels.length > 0 && (
          <div className="tl-media">
            {reels.map((m, j) => (
              <a
                key={j}
                href={youtubeWatchUrl(m.src)}
                target="_blank"
                rel="noreferrer"
                className="watch-link"
              >
                ▶ {m.caption || 'Watch'}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.li>
  )
}

function Timeline({ items }) {
  const timelineRef = useRef(null)

  // Fill the timeline line with accent as the section scrolls past (no re-render).
  useEffect(() => {
    const el = timelineRef.current
    if (!el) return undefined
    const onScroll = () => {
      const r = el.getBoundingClientRect()
      const frac = Math.max(0, Math.min(1, (window.innerHeight * 0.5 - r.top) / Math.max(1, r.height)))
      el.style.setProperty('--fill', frac.toFixed(3))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <ol className="timeline" ref={timelineRef}>
      {items.map((exp, i) => (
        <TimelineItem key={`${exp.role}-${exp.org}`} exp={exp} index={i} />
      ))}
    </ol>
  )
}

export default function Experience() {
  const total = experience.length
  const activeCount = experience.filter((e) => e.dates && /present|upcoming/i.test(e.dates)).length

  return (
    <section id="experience" className="section experience">
      <div className="section-head reveal">
        <span className="kicker">experience</span>
        <h2 className="section-title">Track record</h2>
        <p className="section-sub">
          Engineering and design first, then everything else that built the work ethic: events,
          operations, sport, and film.
        </p>
        <div className="exp-stats">
          <span className="exp-stat"><strong>{total}</strong> roles</span>
          <span className="exp-stat"><strong>{activeCount}</strong> active now</span>
          <span className="exp-stat">2016 <i>to</i> 2026</span>
        </div>
      </div>

      {GROUPS.map((g) => {
        const items = experience.filter((e) => (e.group || 'ops') === g.id)
        if (items.length === 0) return null
        return (
          <div key={g.id} className="tl-group">
            <div className="tl-group-head reveal">
              <h3>{g.label}</h3>
              <span className="tl-group-desc">{g.desc}</span>
            </div>
            <Timeline items={items} />
          </div>
        )
      })}
    </section>
  )
}
