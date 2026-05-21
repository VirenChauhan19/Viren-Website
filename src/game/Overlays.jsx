import { useEffect, useRef, useState } from 'react'
import { profile, education, experience, projects } from '../data/content.js'
import { ariaAnswer, SUGGESTED_QUESTIONS } from './aria.js'
import { assetUrl, youtubeThumb, youtubeWatchUrl } from './assets.js'
import { QUEST_BY_ID } from '../data/quests.js'

// ───────────────────── Shared shell ─────────────────────

function OverlayShell({ tint = 'ai', onClose, children, mode = '' }) {
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
        className={`overlay-panel tinted-${tint} ${mode}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="overlay-close" onClick={onClose} aria-label="Close">×</button>
        {children}
      </div>
    </div>
  )
}

// ───────────────────── Media renderer (with fallback) ─────────────────────

function MediaCard({ m, alt }) {
  const [failed, setFailed] = useState(false)

  if (m.type === 'youtube') {
    return (
      <a className="overlay-media yt-fallback" href={youtubeWatchUrl(m.src)} target="_blank" rel="noreferrer">
        <img
          src={youtubeThumb(m.src)}
          alt={m.caption || alt}
          onError={(e) => { e.currentTarget.style.display = 'none'; setFailed(true) }}
        />
        <div className="yt-play">{failed ? 'Open video' : 'Watch video'}</div>
      </a>
    )
  }

  if (m.type === 'video') {
    if (failed) {
      return (
        <a className="overlay-media video-fallback" href={assetUrl(m.src)} target="_blank" rel="noreferrer">
          <div className="vf-poster">
            <span>{m.caption || alt}</span>
            <strong>Open video</strong>
          </div>
        </a>
      )
    }
    return (
      <div className="overlay-media">
        <video
          src={assetUrl(m.src)}
          controls
          muted
          loop
          playsInline
          preload="metadata"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  if (m.type === 'image') {
    return (
      <div className="overlay-media">
        {!failed ? (
          <img src={assetUrl(m.src)} alt={m.caption || alt} onError={() => setFailed(true)} />
        ) : (
          <div className="media-error">Image unavailable.</div>
        )}
      </div>
    )
  }

  return null
}

// ───────────────────── Project overlay (Quest panel) ─────────────────────

function projectOutcome(p) {
  const outcomes = {
    'study-command-center':
      'A deployed study hub that turns course documents into searchable answers, calendar-ready deadlines, and a cleaner student workflow.',
    'la-ultra-running-plans':
      'A doctor-informed patient tool built for real-world care, with personalized running plans and progress management in one place.',
    'top-down-shooter':
      'A playable combat prototype showing responsive movement, wave pressure, enemy behavior, and tuned feedback.',
    peggle:
      'A physics-first arcade loop with ball bounce dynamics, peg clearing, score chasing, and precision-based level layouts.',
    '3d-environment':
      'A real-time environment study focused on composition, lighting, mood, and readable atmosphere inside a game engine.',
  }
  return outcomes[p.slug] || p.summary
}

export function ProjectOverlay({ slug, onClose }) {
  const p = projects.find((x) => x.slug === slug)
  if (!p) return null
  const tint = p.type === 'ai' ? 'ai' : 'game'
  const quest = QUEST_BY_ID[`project:${p.slug}`]
  const outcome = projectOutcome(p)
  const reward = quest?.reward || (p.type === 'ai' ? '+120 XP - Applied AI' : '+120 XP - Game Dev')

  return (
    <OverlayShell tint={tint} mode="mission-panel" onClose={onClose}>
      <div className={`mission-screen ${tint}`}>
        <div className="mission-topbar">
          <span>MISSION SELECT</span>
          <span>{p.type === 'ai' ? 'APPLIED AI' : 'GAME DEV'} / {p.year}</span>
        </div>

        <div className="mission-hero">
          <div>
            <div className="mission-kicker">{quest?.title || 'Portfolio Quest'}</div>
            <h2 className="overlay-title mission-title">{p.name}</h2>
            <p className="mission-objective">
              <span>Objective</span>
              {quest?.objective || p.summary}
            </p>
          </div>
          <div className="mission-rank">
            <span>RANK</span>
            <strong>{p.type === 'ai' ? 'A+' : 'S'}</strong>
          </div>
        </div>

        <div className="mission-meta-grid">
          <div><span>Role</span><strong>{p.role}</strong></div>
          <div><span>Reward</span><strong>{reward}</strong></div>
          <div><span>Tools Used</span><strong>{(p.tech || []).join(' / ')}</strong></div>
          <div><span>Status</span><strong>Ready for review</strong></div>
        </div>

        <div className="mission-columns">
          <section className="mission-section">
            <h3>What I built</h3>
            <p className="overlay-summary">{p.summary}</p>
            <div className="overlay-body">
              {(p.description || []).map((para, i) => <p key={i}>{para}</p>)}
            </div>
          </section>

          <section className="mission-section outcome">
            <h3>Result / outcome</h3>
            <p>{outcome}</p>
            {p.highlights && p.highlights.length > 0 && (
              <ul className="overlay-highlights">
                {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            )}
          </section>
        </div>

        {p.tech && p.tech.length > 0 && (
          <div className="mission-section compact">
            <h3>Loadout</h3>
            <div className="overlay-pills">
              {p.tech.map((t) => <span className="overlay-pill" key={t}>{t}</span>)}
            </div>
          </div>
        )}

        {p.media && p.media.length > 0 && (
          <div className="mission-section compact">
            <h3>Screenshots / videos</h3>
            <div className="mission-media-grid">
              {p.media.map((m, i) => <MediaCard key={i} m={m} alt={p.name} />)}
            </div>
          </div>
        )}

        {(p.live || p.repo) && (
          <div className="overlay-cta mission-actions">
            {p.live && <a className="primary" href={p.live} target="_blank" rel="noreferrer">Launch demo</a>}
            {p.repo && <a href={p.repo} target="_blank" rel="noreferrer">View code</a>}
          </div>
        )}
      </div>
    </OverlayShell>
  )
}

// ───────────────────── About (NPC dialogue) ─────────────────────

export function AboutOverlay({ onClose }) {
  const dialogue = [
    profile.tagline,
    ...profile.about,
  ]
  const [pageIdx, setPageIdx] = useState(0)
  const [typed, setTyped] = useState('')
  const typingTimerRef = useRef(null)
  const fullText = dialogue[pageIdx] || ''

  useEffect(() => {
    setTyped('')
    let i = 0
    const id = setInterval(() => {
      i += 1
      setTyped(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(id)
        typingTimerRef.current = null
      }
    }, 28)
    typingTimerRef.current = id
    return () => {
      clearInterval(id)
      typingTimerRef.current = null
    }
  }, [pageIdx, fullText])

  const advance = () => {
    if (typed.length < fullText.length) {
      if (typingTimerRef.current) {
        clearInterval(typingTimerRef.current)
        typingTimerRef.current = null
      }
      setTyped(fullText) // skip typing on first click
      return
    }
    if (pageIdx < dialogue.length - 1) setPageIdx(pageIdx + 1)
    else onClose()
  }

  const isLast = pageIdx === dialogue.length - 1

  return (
    <OverlayShell tint="info" onClose={onClose}>
      <div className="npc-dialogue" onClick={advance}>
        <div className="npc-portrait">
          <img src={assetUrl(profile.photo)} alt={profile.name} onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <div className="npc-portrait-fallback">V</div>
          <div className="npc-portrait-frame" />
        </div>
        <div className="npc-textbox">
          <div className="npc-name">
            <span className="dot" />
            {profile.name}
            <span className="npc-title">{profile.title}</span>
          </div>
          <div className="npc-text">{typed}<span className="npc-cursor" /></div>
          <div className="npc-foot">
            <span className="page-pips">
              {dialogue.map((_, i) => (
                <span key={i} className={`pip ${i === pageIdx ? 'active' : ''} ${i < pageIdx ? 'seen' : ''}`} />
              ))}
            </span>
            <button
              type="button"
              className="npc-next"
              onClick={(e) => {
                e.stopPropagation()
                advance()
              }}
            >
              {typed.length < fullText.length ? 'skip' : isLast ? 'continue' : 'next'}
            </button>
          </div>
        </div>
      </div>

      <div className="about-meta">
        {education.map((e, i) => (
          <div className="row" key={i}>
            <span className="k">EDU</span>
            <span>{e.degree}: {e.school} ({e.location})</span>
          </div>
        ))}
        <div className="row"><span className="k">MAIL</span><span>{profile.email}</span></div>
        <div className="row"><span className="k">REPO</span>
          <span>
            <a href={profile.links.find((l) => l.label === 'GitHub')?.url} target="_blank" rel="noreferrer">
              github.com/VirenChauhan19
            </a>
          </span>
        </div>
      </div>
    </OverlayShell>
  )
}

// ───────────────────── Mission Log (was Trophy / Experience) ─────────────────────

export function TrophyOverlay({ onClose }) {
  return (
    <OverlayShell tint="info" onClose={onClose}>
      <div className="mission-log-head">
        <div className="overlay-tag info">▌ MISSION LOG · CAREER</div>
        <h2 className="overlay-title">Mission Log</h2>
        <p className="overlay-role">Past deployments, leadership ops, and side quests.</p>
      </div>

      <ul className="mission-list">
        {experience.map((exp, i) => {
          const status = exp.dates && /present|upcoming/i.test(exp.dates) ? 'active' : 'complete'
          return (
            <li key={i} className={`mission ${status}`}>
              <div className="mission-marker">
                <div className="mission-marker-icon">{status === 'active' ? '●' : '✓'}</div>
              </div>
              <div className="mission-body">
                <div className="mission-status">
                  {status === 'active' ? 'ACTIVE' : 'CLEARED'} · {exp.dates}
                </div>
                <div className="mission-role">{exp.role}</div>
                <div className="mission-org">@ {exp.org}{exp.location ? ` · ${exp.location}` : ''}</div>
                {exp.detail && <div className="mission-detail">{exp.detail}</div>}
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul className="mission-bullets">
                    {exp.bullets.map((b, j) => <li key={j}>{b}</li>)}
                  </ul>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </OverlayShell>
  )
}

// ───────────────────── Showreel ─────────────────────

export function ShowreelOverlay({ onClose }) {
  const reels = experience.filter((e) => e.media && e.media.length > 0)
  return (
    <OverlayShell tint="info" onClose={onClose}>
      <div className="overlay-tag info">▶ SHOWREEL · FILM</div>
      <h2 className="overlay-title">Film & Video Work</h2>
      <p className="overlay-role">Documentary, ultramarathon, and impact-driven projects.</p>

      {reels.map((r, i) => (
        <div key={i} className="reel-block">
          <div className="overlay-section-title">{r.role}: {r.org} ({r.dates})</div>
          {r.detail && <p className="reel-detail">{r.detail}</p>}
          <div className="reel-grid">
            {r.media.map((m, j) => <MediaCard key={j} m={m} alt={r.role} />)}
          </div>
        </div>
      ))}
    </OverlayShell>
  )
}

// ───────────────────── Recruitment Terminal (was Contact) ─────────────────────

export function ContactOverlay({ onClose }) {
  const githubLink = profile.links.find((l) => l.label === 'GitHub')?.url
  const [printed, setPrinted] = useState('')
  const lines = [
    '> ESTABLISHING SECURE CHANNEL...',
    '> AUTH: recruiter@your-studio',
    '> TARGET: viren.chauhan@scad',
    '> STATUS: ONLINE · accepting transmissions',
    '',
    '   "Open to game-dev, applied-AI, and creative-tech roles."',
    '   "Based in Atlanta, GA. Reply window: ~24h."',
    '',
    '> AWAITING INPUT.',
  ].join('\n')

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 2
      setPrinted(lines.slice(0, i))
      if (i >= lines.length) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [lines])

  return (
    <OverlayShell tint="game" onClose={onClose}>
      <div className="terminal">
        <div className="terminal-head">
          <span className="dot red" /><span className="dot yel" /><span className="dot grn" />
          <span className="terminal-title">recruit.exe: RECRUITMENT TERMINAL</span>
        </div>
        <pre className="terminal-body">
{printed}<span className="terminal-cursor" />
        </pre>
      </div>

      <div className="overlay-cta" style={{ marginTop: 18 }}>
        <a className="primary" href={`mailto:${profile.email}?subject=Hello%20Viren%20-%20recruiting`}>
          ✉  TRANSMIT: {profile.email}
        </a>
        {githubLink && <a href={githubLink} target="_blank" rel="noreferrer">⌥  Open source / repo</a>}
      </div>

      <div className="overlay-section-title">▌ Quick facts</div>
      <ul className="overlay-highlights">
        <li>Based in Atlanta, GA · Studying at SCAD</li>
        <li>Open to game dev, applied-AI, and creative-tech internships / roles</li>
        <li>Fastest reply by email, typically within a day</li>
      </ul>
    </OverlayShell>
  )
}

// ───────────────────── Assistant chat overlay ─────────────────────

export function AriaOverlay({ onClose }) {
  const [messages, setMessages] = useState([
    {
      who: 'bot',
      text:
        "Hey, I'm Viren's Assistant. I'm baked into this site, running offline with a small retrieval engine over Viren's profile, projects, and experience. " +
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
              <div className="aria-name">Viren's Assistant</div>
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
                {m.src && <span className="src">source: {m.src}</span>}
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
                placeholder="Ask anything about Viren..."
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
