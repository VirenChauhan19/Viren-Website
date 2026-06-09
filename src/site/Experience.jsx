import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { experience } from '../data/content.js'
import { youtubeWatchUrl } from './asset.js'
import { useSpotlight } from './fx.js'

function TimelineItem({ exp, index }) {
  const [seen, setSeen] = useState(false)
  const spot = useSpotlight()
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
      <div className="tl-card" ref={spot.ref} onMouseMove={spot.onMouseMove}>
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

export default function Experience() {
  const timelineRef = useRef(null)
  const total = experience.length
  const activeCount = experience.filter((e) => e.dates && /present|upcoming/i.test(e.dates)).length

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
    <section id="experience" className="section experience">
      <div className="section-head reveal">
        <span className="kicker">experience</span>
        <h2 className="section-title">Track record</h2>
        <p className="section-sub">
          Leadership, operations, design, sport, and film. Everything I have built up so far.
        </p>
        <div className="exp-stats">
          <span className="exp-stat"><strong>{total}</strong> roles</span>
          <span className="exp-stat"><strong>{activeCount}</strong> active now</span>
          <span className="exp-stat">2016 <i>to</i> 2026</span>
        </div>
      </div>

      <ol className="timeline" ref={timelineRef}>
        {experience.map((exp, i) => (
          <TimelineItem key={i} exp={exp} index={i} />
        ))}
      </ol>
    </section>
  )
}
