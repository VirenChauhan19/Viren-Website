import { useEffect, useRef, useState } from 'react'
import { profile, education, experience, projects } from '../data/content.js'
import { ariaAnswer, SUGGESTED_QUESTIONS } from './aria.js'

// ───────────────────── Shared shell ─────────────────────

function OverlayShell({ tint = 'ai', onClose, children }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`overlay-panel tinted-${tint}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="overlay-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  )
}

// ───────────────────── Project overlay ─────────────────────

export function ProjectOverlay({ slug, onClose }) {
  const p = projects.find((x) => x.slug === slug)
  if (!p) return null
  const tint = p.type === 'ai' ? 'ai' : 'game'
  const accent = p.type === 'ai' ? 'AI · APPLIED INTELLIGENCE' : 'GAME · INTERACTIVE'

  return (
    <OverlayShell tint={tint} onClose={onClose}>
      <div className={`overlay-tag ${p.type === 'ai' ? 'ai' : 'game'}`}>{accent} · {p.year}</div>
      <h2 className="overlay-title">{p.name}</h2>
      <p className="overlay-role">{p.role}</p>
      <p className="overlay-summary">{p.summary}</p>

      <div className="overlay-body">
        {(p.description || []).map((para, i) => <p key={i}>{para}</p>)}
      </div>

      {p.media && p.media.length > 0 && (
        <>
          <div className="overlay-section-title">Demo</div>
          {p.media.map((m, i) => (
            <div className="overlay-media" key={i}>
              {m.type === 'video' && (
                <video src={`/${m.src}`} controls autoPlay muted loop playsInline />
              )}
              {m.type === 'youtube' && (
                <iframe
                  src={`https://www.youtube.com/embed/${m.src}?modestbranding=1&rel=0`}
                  title={m.caption || p.name}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {m.type === 'image' && <img src={`/${m.src}`} alt={m.caption || p.name} />}
            </div>
          ))}
        </>
      )}

      {p.highlights && p.highlights.length > 0 && (
        <>
          <div className="overlay-section-title">Highlights</div>
          <ul className="overlay-highlights">
            {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        </>
      )}

      {p.tech && p.tech.length > 0 && (
        <>
          <div className="overlay-section-title">Stack</div>
          <div className="overlay-pills">
            {p.tech.map((t) => <span className="overlay-pill" key={t}>{t}</span>)}
          </div>
        </>
      )}

      {(p.live || p.repo) && (
        <div className="overlay-cta">
          {p.live && <a className="primary" href={p.live} target="_blank" rel="noreferrer">Live demo →</a>}
          {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">View code</a>}
        </div>
      )}
    </OverlayShell>
  )
}

// ───────────────────── About overlay ─────────────────────

export function AboutOverlay({ onClose }) {
  return (
    <OverlayShell tint="info" onClose={onClose}>
      <div className="overlay-tag info">PROFILE · ABOUT</div>
      <h2 className="overlay-title">{profile.name}</h2>
      <p className="overlay-role">{profile.title}</p>

      <div className="about-grid">
        <div className="about-photo">
          <img src={`/${profile.photo}`} alt={profile.name} />
        </div>
        <div className="about-text">
          <p>{profile.tagline}</p>
          {profile.about.map((para, i) => <p key={i}>{para}</p>)}
          <div className="about-meta">
            {education.map((e, i) => (
              <div className="row" key={i}>
                <span className="k">Education</span>
                <span>{e.degree} — {e.school}</span>
              </div>
            ))}
            <div className="row"><span className="k">Email</span><span>{profile.email}</span></div>
            <div className="row"><span className="k">GitHub</span>
              <span>
                <a href={profile.links.find((l) => l.label === 'GitHub')?.url} target="_blank" rel="noreferrer">
                  github.com/VirenChauhan19
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </OverlayShell>
  )
}

// ───────────────────── Trophy / experience overlay ─────────────────────

export function TrophyOverlay({ onClose }) {
  return (
    <OverlayShell tint="info" onClose={onClose}>
      <div className="overlay-tag info">EXPERIENCE · TIMELINE</div>
      <h2 className="overlay-title">Trophy Cabinet</h2>
      <p className="overlay-role">Work, leadership, and the long-form stuff.</p>

      <ul className="timeline">
        {experience.map((exp, i) => (
          <li key={i}>
            <div className="t-role">{exp.role}</div>
            <div className="t-org">{exp.org}</div>
            <div className="t-dates">
              {exp.dates}{exp.location ? ` · ${exp.location}` : ''}
            </div>
            {exp.detail && <div className="t-detail">{exp.detail}</div>}
            {exp.bullets && exp.bullets.length > 0 && (
              <ul className="t-bullets">
                {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </OverlayShell>
  )
}

// ───────────────────── Showreel overlay ─────────────────────

export function ShowreelOverlay({ onClose }) {
  // Pull experience entries that have media (the film/video ones).
  const reels = experience.filter((e) => e.media && e.media.length > 0)
  return (
    <OverlayShell tint="info" onClose={onClose}>
      <div className="overlay-tag info">SHOWREEL · FILM</div>
      <h2 className="overlay-title">Film & Video Work</h2>
      <p className="overlay-role">Documentary, ultramarathon, and impact-driven projects.</p>

      {reels.map((r, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <div className="overlay-section-title">{r.role} — {r.org} ({r.dates})</div>
          {r.detail && <p style={{ color: 'var(--ink-dim)', fontSize: 14, lineHeight: 1.55, margin: '4px 0 12px' }}>{r.detail}</p>}
          {r.media.map((m, j) => (
            <div className="overlay-media" key={j}>
              {m.type === 'youtube' && (
                <iframe
                  src={`https://www.youtube.com/embed/${m.src}?modestbranding=1&rel=0`}
                  title={m.caption || r.role}
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
              {m.type === 'video' && <video src={`/${m.src}`} controls playsInline />}
              {m.type === 'image' && <img src={`/${m.src}`} alt={m.caption || r.role} />}
            </div>
          ))}
        </div>
      ))}
    </OverlayShell>
  )
}

// ───────────────────── Contact overlay ─────────────────────

export function ContactOverlay({ onClose }) {
  const githubLink = profile.links.find((l) => l.label === 'GitHub')?.url
  return (
    <OverlayShell tint="game" onClose={onClose}>
      <div className="overlay-tag game">CONTACT · OPEN A LINE</div>
      <h2 className="overlay-title">Let's work together.</h2>
      <p className="overlay-summary">
        Recruiting for game dev or applied AI roles? I'd love to hear about it.
        Drop a line below or reach out directly.
      </p>

      <div className="overlay-cta" style={{ marginTop: 8 }}>
        <a className="primary" href={`mailto:${profile.email}?subject=Hello%20Viren`}>
          ✉  Email {profile.email}
        </a>
        {githubLink && <a href={githubLink} target="_blank" rel="noreferrer">⌥  GitHub</a>}
      </div>

      <div className="overlay-section-title">Quick facts</div>
      <ul className="overlay-highlights">
        <li>Based in Atlanta, GA · Studying at SCAD</li>
        <li>Open to game dev, applied-AI, and creative-tech internships / roles</li>
        <li>Fastest reply by email — typically within a day</li>
      </ul>
    </OverlayShell>
  )
}

// ───────────────────── ARIA chat overlay ─────────────────────

export function AriaOverlay({ onClose }) {
  const [messages, setMessages] = useState([
    {
      who: 'bot',
      text:
        "Hey — I'm ARIA. I'm an AI assistant baked into this site, running offline with a small retrieval engine over Viren's profile, projects, and experience. " +
        "Ask me anything you'd ask in an interview.",
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const inputRef = useRef(null)
  const logRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight
    }
  }, [messages, typing])

  function send(text) {
    const q = (text ?? input).trim()
    if (!q) return
    setMessages((m) => [...m, { who: 'user', text: q }])
    setInput('')
    setTyping(true)

    // Simulated thinking delay for character — bounded between 350–900ms.
    const delay = 350 + Math.min(550, q.length * 12)
    setTimeout(() => {
      const ans = ariaAnswer(q)
      setMessages((m) => [...m, { who: 'bot', text: ans.text, src: ans.src }])
      setTyping(false)
    }, delay)
  }

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="overlay-panel tinted-ai" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose} aria-label="Close">×</button>
        <div className="aria-shell">
          <div className="aria-head">
            <div className="aria-avatar" />
            <div>
              <div className="aria-name">ARIA</div>
              <div className="aria-status">
                <span className="dot" />
                ONLINE · retrieval engine v0.4 · offline-first
              </div>
            </div>
          </div>

          <div className="aria-log" ref={logRef}>
            {messages.map((m, i) => (
              <div key={i} className={`aria-msg ${m.who}`}>
                {m.text}
                {m.src && <span className="src">↳ source: {m.src}</span>}
              </div>
            ))}
            {typing && (
              <div className="aria-typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          <div>
            <div className="aria-suggest">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button key={q} onClick={() => send(q)} disabled={typing}>{q}</button>
              ))}
            </div>
            <form
              className="aria-input"
              onSubmit={(e) => {
                e.preventDefault()
                send()
              }}
            >
              <input
                ref={inputRef}
                placeholder="Ask anything about Viren…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={typing}
                maxLength={240}
              />
              <button type="submit" disabled={typing || !input.trim()}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
