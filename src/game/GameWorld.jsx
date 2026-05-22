import { useEffect, useRef, useState, useCallback } from 'react'
import {
  PLAYER_SPAWN,
  STATION_BLOCKS,
  WORLD_W,
  WORLD_H,
  TILES,
  isWall,
  isStationBlocked,
  nearestInteractable,
} from './world.js'
import {
  TILE_W,
  TILE_H,
  HALF_W,
  HALF_H,
  WORLD_ISO_W,
  WORLD_ISO_H,
  WORLD_OFFSET_X,
  isoProject,
  isoUnproject,
  isoTileCenter,
  drawExtrudedBox,
} from './iso.js'
import {
  drawSky,
  drawFloor,
  drawWalls,
  drawStation,
  drawPlayer,
  drawDroneNPC,
  drawAmbientDust,
  drawForegroundAtmosphere,
  drawDataShard,
  drawScanPulse,
  drawQuestMarker,
  COLORS,
} from './render.js'
import {
  ProjectOverlay,
  AboutOverlay,
  TrophyOverlay,
  ContactOverlay,
  ShowreelOverlay,
  AriaOverlay,
} from './Overlays.jsx'
import { SkillTreeOverlay } from './SkillTree.jsx'
import { QuestTracker, QuestCompleted } from './QuestSystem.jsx'
import { QUESTS, QUEST_BY_ID, loadCompletedQuests, saveCompletedQuests } from '../data/quests.js'
import { profile, projects } from '../data/content.js'
import { startAudio, sfx, getSettings, updateSettings, loadSettings } from './audio.js'

const QUALITY_DPR = { low: 1.25, medium: 1.6, high: 2 }

const PLAYER_SPEED = 5.5 // tiles per second
const PLAYER_HALF = 0.18 // collision half-extent in tile units
const CAMERA_LERP = 0.14
const SCAN_RADIUS_TILES = 7.5
const SCAN_TRAVEL_MS = 1500
const SCAN_GLOW_LINGER_MS = 900
const SCAN_GLOW_RAMP_MS = 220
const PROJECT_QUEST_IDS = projects.map((p) => `project:${p.slug}`)
const SHARD_STORAGE_KEY = 'viren_exe_data_shards_v1'
const DATA_SHARDS = [
  { id: 'ai-core', col: 11.5, row: 8.5, kind: 'ai', name: 'AI Core Fragment' },
  { id: 'calendar-key', col: 18.5, row: 8.2, kind: 'ai', name: 'Calendar Key' },
  { id: 'arcade-token', col: 10.4, row: 18.6, kind: 'game', name: 'Arcade Token' },
  { id: 'physics-chip', col: 16.4, row: 18.8, kind: 'game', name: 'Physics Chip' },
  { id: 'recruit-signal', col: 24.7, row: 17.2, kind: 'career', name: 'Recruit Signal' },
]
const WORLD_TICKER = [
  'Start with Meet Viren, then follow the guided path.',
  'Desktop gives the strongest walkthrough: keyboard movement, hover, and a wider map.',
  "Viren's Assistant can answer questions about projects, experience, and skills.",
  'Project stations are grouped by applied AI, creative tech, and game development.',
  'Use Contact Viren when you are ready to move from review to conversation.',
]

// ── Progression: XP → ranks. Reviewing a station = +100, a data shard = +15. ──
const XP_PER_STATION = 100
const XP_PER_SHARD = 15
const RANKS = [
  { title: 'Visitor', at: 0 },
  { title: 'Recruiter', at: 100 },
  { title: 'Scout', at: 250 },
  { title: 'Analyst', at: 450 },
  { title: 'Advocate', at: 700 },
  { title: 'Hire-Ready', at: 1000 },
]

function rankFor(xp) {
  let idx = 0
  for (let i = 0; i < RANKS.length; i++) if (xp >= RANKS[i].at) idx = i
  const cur = RANKS[idx]
  const next = RANKS[idx + 1] || null
  const base = cur.at
  const span = next ? next.at - base : 1
  const progress = next ? Math.min(1, (xp - base) / span) : 1
  return { level: idx + 1, title: cur.title, progress, next, xp }
}

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function scanStationIntensity(scanAge, stationDist) {
  if (!Number.isFinite(scanAge) || stationDist > SCAN_RADIUS_TILES) return 0
  const reachAt = (stationDist / SCAN_RADIUS_TILES) * SCAN_TRAVEL_MS
  const elapsed = scanAge - reachAt
  if (elapsed < 0 || elapsed > SCAN_GLOW_LINGER_MS) return 0
  if (elapsed < SCAN_GLOW_RAMP_MS) return elapsed / SCAN_GLOW_RAMP_MS
  const fadeStart = SCAN_GLOW_LINGER_MS - SCAN_GLOW_RAMP_MS
  if (elapsed > fadeStart) return Math.max(0, (SCAN_GLOW_LINGER_MS - elapsed) / SCAN_GLOW_RAMP_MS)
  return 1
}

function loadCollectedShards() {
  try {
    const raw = localStorage.getItem(SHARD_STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? new Set(arr) : new Set()
  } catch {
    return new Set()
  }
}

function saveCollectedShards(set) {
  try {
    localStorage.setItem(SHARD_STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore disabled storage */
  }
}

function ObjectiveFeed({ items }) {
  if (!items.length) return null
  return (
    <div className="objective-feed" aria-live="polite">
      {items.map((item) => (
        <div className={`objective-toast ${item.kind}`} key={item.id}>
          <span className="ot-kicker">{item.kicker}</span>
          <span className="ot-title">{item.title}</span>
          {item.detail && <span className="ot-detail">{item.detail}</span>}
        </div>
      ))}
    </div>
  )
}

function FunHud({ xp, shards, totalShards, ticker, onScan }) {
  const rank = rankFor(xp)
  return (
    <div className="fun-hud">
      <div className="xp-block">
        <div className="xp-top">
          <span className="xp-lvl">LVL {rank.level}</span>
          <span className="xp-title">{rank.title}</span>
          <span className="xp-num">{xp} XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${rank.progress * 100}%` }} />
        </div>
        <div className="xp-next">
          {rank.next ? `${rank.next.at - xp} XP to ${rank.next.title}` : 'Max rank · Hire-Ready'}
        </div>
      </div>
      <div className="fun-stat">
        <span>Intel</span>
        <strong>{shards}/{totalShards}</strong>
      </div>
      <button className="scan-btn" onClick={onScan}>
        <span>Q</span>
        Scan
      </button>
      <div className="world-ticker">{ticker}</div>
    </div>
  )
}

function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || (navigator && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
}

// ──────────────────── Loading screen ────────────────────

const LOADING_STEPS = [
  'Initializing engine',
  'Loading isometric world',
  'Mounting portfolio stations',
  "Booting Viren's Assistant",
  'Calibrating lighting & atmosphere',
  'Entering the studio',
]

function LoadingScreen({ onDone }) {
  const [pct, setPct] = useState(0)
  const [step, setStep] = useState(0)
  const [out, setOut] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    let raf = 0
    let start = 0
    const dur = 2600
    const tick = (t) => {
      if (!start) start = t
      const e = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - e, 2.2)
      setPct(Math.round(eased * 100))
      setStep(Math.min(LOADING_STEPS.length - 1, Math.floor(e * LOADING_STEPS.length)))
      if (e < 1) {
        raf = requestAnimationFrame(tick)
      } else if (!doneRef.current) {
        doneRef.current = true
        setOut(true)
        setTimeout(onDone, 520)
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDone])

  return (
    <div className={`loading-screen ${out ? 'loading-out' : ''}`}>
      <div className="ls-vignette" />
      <div className="ls-inner">
        <div className="ls-logo">VIREN<span>.exe</span></div>
        <div className="ls-tag">PLAYABLE PORTFOLIO</div>
        <div className="ls-bar"><div className="ls-fill" style={{ width: `${pct}%` }} /></div>
        <div className="ls-row">
          <span className="ls-step">{LOADING_STEPS[step]}…</span>
          <span className="ls-pct">{String(pct).padStart(3, '0')}%</span>
        </div>
      </div>
    </div>
  )
}

// ──────────────────── Press start gate ────────────────────

function PressStartScreen({ onStart }) {
  useEffect(() => {
    const go = () => onStart()
    window.addEventListener('keydown', go)
    window.addEventListener('pointerdown', go)
    return () => {
      window.removeEventListener('keydown', go)
      window.removeEventListener('pointerdown', go)
    }
  }, [onStart])

  return (
    <div className="press-start">
      <div className="ps-scrim" />
      <div className="ps-vignette" />
      <div className="ps-inner">
        <div className="ps-kicker">PLAYABLE PORTFOLIO</div>
        <h1 className="ps-logo">VIREN<span>.exe</span></h1>
        <div className="ps-tag">{profile.title}</div>
        <div className="ps-prompt">PRESS ANY KEY</div>
      </div>
      <div className="ps-grain" />
    </div>
  )
}

// ──────────────────── Title / main menu (cinematic) ────────────────────

function TitleScreen({ hasProgress, progressLabel, onPlay, onContinue, onJump, onSettings, onCredits }) {
  const items = [
    { id: 'play', label: hasProgress ? 'New Tour' : 'New Game', hint: 'Begin the guided studio tour', action: onPlay },
    hasProgress && { id: 'continue', label: 'Continue', hint: progressLabel, action: onContinue },
    { id: 'freeroam', label: 'Free Roam', hint: 'Skip the intro and explore', action: () => onJump(null) },
    { id: 'settings', label: 'Settings', hint: 'Audio · motion · graphics', action: onSettings },
    { id: 'credits', label: 'Credits', hint: 'Who built this', action: onCredits },
  ].filter(Boolean)

  const [sel, setSel] = useState(0)
  const rootRef = useRef(null)
  const pointerRef = useRef({ x: 0, y: 0, tx: 0, ty: 0 })
  const rafRef = useRef(0)

  // Very subtle cinematic parallax on the content block.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onPointer = (e) => {
      pointerRef.current.tx = (e.clientX / window.innerWidth - 0.5) * 2
      pointerRef.current.ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const loop = () => {
      const motion = getSettings().motion
      const p = pointerRef.current
      const tx = motion ? p.tx : 0
      const ty = motion ? p.ty : 0
      p.x += (tx - p.x) * 0.06
      p.y += (ty - p.y) * 0.06
      root.style.setProperty('--mx', p.x.toFixed(4))
      root.style.setProperty('--my', p.y.toFixed(4))
      rafRef.current = requestAnimationFrame(loop)
    }
    window.addEventListener('pointermove', onPointer)
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onPointer)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const activate = (item) => {
    sfx.select()
    item.action()
  }

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowdown' || k === 's') {
        e.preventDefault()
        setSel((i) => { const n = (i + 1) % items.length; sfx.move(); return n })
      } else if (k === 'arrowup' || k === 'w') {
        e.preventDefault()
        setSel((i) => { const n = (i - 1 + items.length) % items.length; sfx.move(); return n })
      } else if (k === 'enter' || k === ' ') {
        e.preventDefault()
        if (items[sel]) activate(items[sel])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items, sel])

  return (
    <div className="cine-title" ref={rootRef}>
      <div className="cine-bar top" />
      <div className="cine-bar bottom" />
      <div className="cine-scrim" />
      <div className="cine-vignette" />
      <div className="cine-grain" />

      <div className="cine-content">
        <div className="cine-kicker"><span className="pulse" /> PLAYABLE PORTFOLIO</div>
        <h1 className="cine-logo">VIREN<span>.exe</span></h1>
        <div className="cine-tagline">{profile.title}</div>

        <nav className="cine-menu" aria-label="Main menu">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`cine-item ${i === sel ? 'active' : ''} ${it.id === 'continue' ? 'accent' : ''}`}
              style={{ '--i': i }}
              onMouseEnter={() => { if (i !== sel) { setSel(i); sfx.hover() } }}
              onFocus={() => setSel(i)}
              onClick={() => activate(it)}
            >
              <span className="ci-bar" />
              <span className="ci-label">{it.label}</span>
              <span className="ci-hint">{it.hint}</span>
            </button>
          ))}
        </nav>

        <div className="cine-hint">
          <span><span className="kk">↑</span><span className="kk">↓</span> Navigate</span>
          <span><span className="kk">↵</span> Select</span>
        </div>
      </div>

      <div className="cine-version">BUILD v0.7.0 · © {new Date().getFullYear()} VIREN CHAUHAN</div>
    </div>
  )
}

// ──────────────────── Settings + Credits ────────────────────

function Toggle({ on, onChange }) {
  return (
    <button className={`cm-toggle ${on ? 'on' : ''}`} onClick={() => { sfx.tick(); onChange(!on) }} role="switch" aria-checked={on}>
      <span className="cm-knob" />
    </button>
  )
}

function SettingsOverlay({ settings, onChange, onClose }) {
  return (
    <div className="cine-modal-wrap" onClick={onClose}>
      <div className="cine-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cm-head">
          <h2>Settings</h2>
          <button className="cm-back" onClick={onClose}>← Back</button>
        </div>

        <div className="cm-row">
          <span className="cm-label">Master Volume</span>
          <input
            className="cm-range"
            type="range" min="0" max="100"
            value={Math.round(settings.master * 100)}
            onChange={(e) => onChange({ master: Number(e.target.value) / 100 })}
          />
          <span className="cm-val">{Math.round(settings.master * 100)}</span>
        </div>

        <div className="cm-row">
          <span className="cm-label">Music</span>
          <Toggle on={settings.music} onChange={(v) => onChange({ music: v })} />
        </div>

        <div className="cm-row">
          <span className="cm-label">Sound Effects</span>
          <Toggle on={settings.sfx} onChange={(v) => { onChange({ sfx: v }); if (v) setTimeout(() => sfx.hover(), 30) }} />
        </div>

        <div className="cm-row">
          <span className="cm-label">Reduce Motion</span>
          <Toggle on={!settings.motion} onChange={(v) => onChange({ motion: !v })} />
        </div>

        <div className="cm-row">
          <span className="cm-label">Graphics Quality</span>
          <div className="cm-seg">
            {['low', 'medium', 'high'].map((q) => (
              <button
                key={q}
                className={settings.quality === q ? 'on' : ''}
                onClick={() => { sfx.tick(); onChange({ quality: q }) }}
              >
                {q[0].toUpperCase() + q.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <p className="cm-note">Settings are saved to this browser.</p>
      </div>
    </div>
  )
}

function CreditsOverlay({ onClose }) {
  return (
    <div className="cine-modal-wrap" onClick={onClose}>
      <div className="cine-modal credits" onClick={(e) => e.stopPropagation()}>
        <div className="cm-head">
          <h2>Credits</h2>
          <button className="cm-back" onClick={onClose}>← Back</button>
        </div>
        <div className="credits-body">
          <div className="cr-block">
            <span className="cr-role">Design · Code · Art</span>
            <span className="cr-name">Viren Chauhan</span>
          </div>
          <div className="cr-block">
            <span className="cr-role">Discipline</span>
            <span className="cr-name">{profile.title}</span>
          </div>
          <div className="cr-block">
            <span className="cr-role">Engine</span>
            <span className="cr-name">Hand-built isometric canvas renderer · React · Web Audio</span>
          </div>
          <div className="cr-block">
            <span className="cr-role">Music & SFX</span>
            <span className="cr-name">Procedurally synthesized in-browser</span>
          </div>
          <div className="cr-thanks">Thanks for playing — now go hire him.</div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────── Pause menu ────────────────────

function PauseMenu({ active, onResume, onSettings, onCredits, onQuit }) {
  const items = [
    { id: 'resume', label: 'Resume', action: onResume },
    { id: 'settings', label: 'Settings', action: onSettings },
    { id: 'credits', label: 'Credits', action: onCredits },
    { id: 'quit', label: 'Quit to Title', action: onQuit, accent: true },
  ]
  const [sel, setSel] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    const onKey = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'arrowdown' || k === 's') {
        e.preventDefault()
        setSel((i) => { sfx.move(); return (i + 1) % items.length })
      } else if (k === 'arrowup' || k === 'w') {
        e.preventDefault()
        setSel((i) => { sfx.move(); return (i - 1 + items.length) % items.length })
      } else if (k === 'enter') {
        e.preventDefault()
        items[sel]?.action()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, items, sel])

  return (
    <div className="pause-menu">
      <div className="pause-scrim" />
      <div className="pause-panel">
        <div className="pause-head">
          <span className="pause-kicker"><span className="pulse" /> PAUSED</span>
          <h2>VIREN<span>.exe</span></h2>
        </div>
        <nav className="pause-nav">
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`pause-item ${i === sel ? 'active' : ''} ${it.accent ? 'accent' : ''}`}
              onMouseEnter={() => { if (i !== sel) { setSel(i); sfx.hover() } }}
              onClick={() => it.action()}
            >
              <span className="pi-bar" />
              <span className="pi-label">{it.label}</span>
            </button>
          ))}
        </nav>
        <div className="pause-hint">
          <span><span className="kk">Esc</span> Resume</span>
          <span><span className="kk">↑</span><span className="kk">↓</span> Navigate · <span className="kk">↵</span> Select</span>
        </div>
      </div>
    </div>
  )
}

// ──────────────────── Celebration UI ────────────────────

function LevelUpBanner({ level, title }) {
  return (
    <div className="levelup-banner" aria-live="polite">
      <div className="lu-ring" />
      <div className="lu-inner">
        <span className="lu-kicker">◆ RANK UP ◆</span>
        <span className="lu-level">LEVEL {level}</span>
        <span className="lu-title">{title}</span>
      </div>
    </div>
  )
}

function FinalBanner() {
  return (
    <div className="final-banner" aria-live="polite">
      <div className="fb-inner">
        <span className="fb-kicker">ALL PROJECTS REVIEWED</span>
        <span className="fb-title">FINAL MISSION UNLOCKED</span>
        <span className="fb-sub">Reach the Contact station to complete the tour</span>
      </div>
    </div>
  )
}

function VictoryScreen({ stats, onTitle, onContact }) {
  return (
    <div className="victory">
      <div className="vic-rays" />
      <div className="vic-grain" />
      <div className="vic-card">
        <span className="vic-kicker"><span className="pulse" /> MISSION COMPLETE</span>
        <h1 className="vic-title">TOUR<span>COMPLETE</span></h1>
        <p className="vic-flavor">You explored the entire studio and unlocked every mission. Here is your final report.</p>
        <div className="vic-stats">
          <div className="vs"><span>Final Rank</span><strong>{stats.title}</strong></div>
          <div className="vs"><span>Level</span><strong>{stats.level}</strong></div>
          <div className="vs"><span>Stations</span><strong>{stats.stations}/{stats.totalStations}</strong></div>
          <div className="vs"><span>Intel Found</span><strong>{stats.shards}/{stats.totalShards}</strong></div>
          <div className="vs wide"><span>Total XP</span><strong>{stats.xp}</strong></div>
        </div>
        <div className="vic-actions">
          <button className="vic-btn primary" onClick={onContact}>Contact Viren →</button>
          <button className="vic-btn" onClick={onTitle}>Return to Title</button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────── Intro card ────────────────────

function TypewriterBriefing({ text, objective, fastForwardToken, onDone }) {
  const [body, setBody] = useState('')
  const [goal, setGoal] = useState('')
  const doneRef = useRef(false)

  useEffect(() => {
    setBody('')
    setGoal('')
    doneRef.current = false

    let bodyIndex = 0
    let goalIndex = 0
    let goalTimer = 0
    let finishTimer = 0

    const bodyTimer = setInterval(() => {
      bodyIndex += 1
      setBody(text.slice(0, bodyIndex))

      if (bodyIndex >= text.length) {
        clearInterval(bodyTimer)
        goalTimer = window.setInterval(() => {
          goalIndex += 1
          setGoal(objective.slice(0, goalIndex))

          if (goalIndex >= objective.length) {
            clearInterval(goalTimer)
            finishTimer = window.setTimeout(() => {
              if (!doneRef.current) {
                doneRef.current = true
                onDone()
              }
            }, 220)
          }
        }, 20)
      }
    }, 24)

    return () => {
      clearInterval(bodyTimer)
      clearInterval(goalTimer)
      clearTimeout(finishTimer)
    }
  }, [text, objective, onDone])

  useEffect(() => {
    if (!fastForwardToken || doneRef.current) return
    setBody(text)
    setGoal(objective)
    doneRef.current = true
    onDone()
  }, [fastForwardToken, text, objective, onDone])

  const bodyDone = body.length >= text.length
  const goalDone = goal.length >= objective.length

  return (
    <>
      <p className="intro-type">
        {body}
        {!bodyDone && <span className="type-cursor" />}
      </p>
      <div className="intro-objective">
        {bodyDone && goal}
        {bodyDone && !goalDone && <span className="type-cursor gold" />}
      </div>
    </>
  )
}

function IntroScreen({ onStart }) {
  const pages = [
    {
      tag: 'WELCOME TO VIREN.exe',
      name: "Viren's Assistant",
      text: "I'm Viren's Assistant. This portfolio is an interactive studio tour: a guided way to review Viren's projects, skills, experience, and contact path.",
      objective: 'Goal: follow the highlights without getting lost in the interface.',
    },
    {
      tag: 'HOW TO NAVIGATE',
      name: "Viren's Assistant",
      text: 'Move to a glowing station and press E. Each station opens one focused piece of the portfolio. XP simply tracks what you have reviewed.',
      objective: 'Tip: press Q for guidance when the next station is not obvious.',
    },
    {
      tag: 'BEST EXPERIENCE',
      name: "Viren's Assistant",
      text: 'This works on a phone, but it was designed for desktop. On mobile, use the quick path panel to jump straight to the important sections.',
      objective: 'First recommended stop: Meet Viren.',
    },
  ]
  const [pageIdx, setPageIdx] = useState(0)
  const [typingDone, setTypingDone] = useState(false)
  const [fastForwardToken, setFastForwardToken] = useState(0)
  const page = pages[pageIdx]
  const isLast = pageIdx === pages.length - 1
  useEffect(() => {
    setTypingDone(false)
  }, [pageIdx])

  const next = () => {
    if (!typingDone) return
    if (isLast) onStart()
    else setPageIdx((i) => i + 1)
  }
  const fastForward = (e) => {
    e.stopPropagation()
    setFastForwardToken((v) => v + 1)
  }
  const skipBriefing = (e) => {
    e.stopPropagation()
    onStart()
  }

  return (
    <div className="intro" onClick={next}>
      <div className={`intro-card ${typingDone ? 'ready' : ''}`} key={pageIdx} onClick={(e) => e.stopPropagation()}>
        <div className="intro-scene" aria-hidden>
          <div className="intro-map">
            <span className="node home" />
            <span className="node ai" />
            <span className="node game" />
            <span className="node final" />
          </div>
          <div className="intro-avatar">
            <span className="eye" />
            <span className="eye" />
          </div>
        </div>

        <div className="intro-tag"><span className="pulse" /> <span>{page.tag}</span></div>
        <div className="intro-dialogue">
          <div className="speaker">{page.name}</div>
          <TypewriterBriefing
            text={page.text}
            objective={page.objective}
            fastForwardToken={fastForwardToken}
            onDone={() => setTypingDone(true)}
          />
        </div>

        <div className="intro-skip-row">
          {!typingDone && (
            <button type="button" className="intro-mini" onClick={fastForward}>
              Fast text
            </button>
          )}
          <button type="button" className="intro-mini" onClick={skipBriefing}>
            Skip intro
          </button>
        </div>

        <div className="intro-after">
          <div className="intro-controls">
            <div className="row">
              <div className="keys"><span className="kk">W</span><span className="kk">A</span><span className="kk">S</span><span className="kk">D</span></div>
              <span className="lab">move</span>
            </div>
            <div className="row">
              <div className="keys"><span className="kk">↑</span><span className="kk">↓</span><span className="kk">←</span><span className="kk">→</span></div>
              <span className="lab">also works</span>
            </div>
            <div className="row"><span className="kk">E</span><span className="lab">open station</span></div>
            <div className="row"><span className="kk">Q</span><span className="lab">show guidance</span></div>
          </div>

          <div className="intro-pips">
            {pages.map((_, i) => <span key={i} className={i === pageIdx ? 'active' : ''} />)}
          </div>

          <button className="intro-start" onClick={next}>
            {isLast ? 'Start guided tour' : 'Continue'}
            <span className="arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────── Minimap ────────────────────

function Minimap({ playerRef, completedSet }) {
  const ref = useRef(null)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0a0c12'
      ctx.fillRect(0, 0, w, h)
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1)

      const sx = w / WORLD_W
      const sy = h / WORLD_H

      ctx.fillStyle = 'rgba(94, 232, 255, 0.06)'
      ctx.fillRect(0, 2 * sy, w, 8 * sy)
      ctx.fillStyle = 'rgba(255, 154, 90, 0.06)'
      ctx.fillRect(0, 13 * sy, w, 7 * sy)

      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
      for (let r = 0; r < WORLD_H; r++) {
        for (let c = 0; c < WORLD_W; c++) {
          if (isWall(c, r)) ctx.fillRect(c * sx, r * sy, sx, sy)
        }
      }

      for (const s of STATION_BLOCKS) {
        const completed = completedSet.has(s.key)
        const color =
          completed ? '#6cf5a9' :
          s.accent === 'cyan' ? COLORS.cyan :
          s.accent === 'warm' ? COLORS.warm :
          s.accent === 'green' ? COLORS.green : COLORS.gold
        ctx.fillStyle = color
        ctx.fillRect(s.col * sx, s.row * sy, sx * 2, sy * 2)
      }

      const p = playerRef.current
      if (p) {
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(p.col * sx, p.row * sy, 2.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(p.col * sx, p.row * sy, 5, 0, Math.PI * 2)
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [playerRef, completedSet])

  return (
    <div className="minimap" aria-hidden>
      <div className="minimap-label">WORLD MAP</div>
      <canvas ref={ref} className="minimap-canvas" />
    </div>
  )
}

// ──────────────────── Virtual joystick (mobile) ────────────────────

function VirtualJoystick({ onMove }) {
  const baseRef = useRef(null)
  const stickRef = useRef(null)
  const activeRef = useRef(false)
  const idRef = useRef(null)

  useEffect(() => {
    const base = baseRef.current
    if (!base) return
    const r = 50
    const reset = () => {
      activeRef.current = false
      idRef.current = null
      if (stickRef.current) stickRef.current.style.transform = `translate(-50%, -50%)`
      onMove(0, 0)
    }
    const startAt = (touch) => {
      activeRef.current = true
      idRef.current = touch.identifier ?? 'mouse'
      moveTo(touch.clientX, touch.clientY)
    }
    const moveTo = (clientX, clientY) => {
      const rect = base.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let dx = clientX - cx
      let dy = clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > r) { dx = (dx / dist) * r; dy = (dy / dist) * r }
      if (stickRef.current) stickRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
      const deadzone = 10
      const m = Math.max(0, Math.sqrt(dx * dx + dy * dy) - deadzone) / (r - deadzone)
      const angle = Math.atan2(dy, dx)
      onMove(Math.cos(angle) * m, Math.sin(angle) * m)
    }
    const onTouchStart = (e) => { if (activeRef.current) return; e.preventDefault(); startAt(e.changedTouches[0]) }
    const onTouchMove = (e) => {
      if (!activeRef.current) return
      const t = Array.from(e.changedTouches).find((x) => x.identifier === idRef.current) || e.changedTouches[0]
      moveTo(t.clientX, t.clientY)
    }
    const onTouchEnd = (e) => {
      const t = Array.from(e.changedTouches).find((x) => x.identifier === idRef.current)
      if (!t && idRef.current !== 'mouse') return
      reset()
    }
    base.addEventListener('touchstart', onTouchStart, { passive: false })
    base.addEventListener('touchmove', onTouchMove, { passive: false })
    base.addEventListener('touchend', onTouchEnd)
    base.addEventListener('touchcancel', onTouchEnd)
    return () => {
      base.removeEventListener('touchstart', onTouchStart)
      base.removeEventListener('touchmove', onTouchMove)
      base.removeEventListener('touchend', onTouchEnd)
      base.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [onMove])

  return (
    <div className="touch-joy" ref={baseRef} aria-hidden>
      <div className="base" />
      <div className="stick" ref={stickRef} />
    </div>
  )
}

// ──────────────────── Main game component ────────────────────

function MobileGuide({ completedSet, nextQuest, finalUnlocked, onOpen }) {
  const [expanded, setExpanded] = useState(true)
  const nextId = finalUnlocked ? 'contact' : nextQuest?.id
  const fallbackIds = ['about', 'skills', 'project:study-command-center', 'project:top-down-shooter', 'trophy', 'contact']
  const actionIds = [nextId, ...fallbackIds]
    .filter(Boolean)
    .filter((id, index, arr) => arr.indexOf(id) === index)
    .filter((id) => QUEST_BY_ID[id])
    .slice(0, 4)
  const done = QUESTS.filter((q) => completedSet.has(q.id)).length

  if (!expanded) {
    return (
      <button className="mobile-guide-pill" onClick={() => setExpanded(true)}>
        Desktop recommended
      </button>
    )
  }

  return (
    <aside className="mobile-guide" aria-label="Mobile guidance">
      <div className="mobile-guide-head">
        <div>
          <span>Best on desktop</span>
          <strong>Use quick path on mobile</strong>
        </div>
        <button onClick={() => setExpanded(false)}>Close</button>
      </div>
      <p>
        The full studio is built for keyboard, hover, and a wider screen. On this phone, jump straight to the strongest sections.
      </p>
      <div className="mobile-guide-actions">
        {actionIds.map((id) => (
          <button
            key={id}
            className={completedSet.has(id) ? 'done' : ''}
            onClick={() => onOpen(id)}
          >
            <span>{completedSet.has(id) ? 'Reviewed' : id === nextId ? 'Next' : 'Open'}</span>
            <strong>{QUEST_BY_ID[id].title}</strong>
          </button>
        ))}
      </div>
      <div className="mobile-guide-progress">
        <span>{done} of {QUESTS.length} reviewed</span>
        <span>XP is progress, not the product</span>
      </div>
    </aside>
  )
}

export default function GameWorld() {
  const canvasRef = useRef(null)
  const playerRef = useRef({
    col: PLAYER_SPAWN.col, row: PLAYER_SPAWN.row,
    dir: 'down', anim: 0, moving: false,
  })
  const cameraRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef({})
  const joyRef = useRef({ x: 0, y: 0 })
  const interactRef = useRef(null)
  const pausedRef = useRef(true)
  const rafRef = useRef(0)
  const lastTRef = useRef(performance.now())
  const dronePosRef = useRef({ col: 6, row: 11, phase: 0 })
  // Juice: transient particles, floating text, and screen shake live here so
  // the rAF loop can animate them without React re-renders.
  const fxRef = useRef({ particles: [], texts: [], shake: 0, flash: 0 })
  const levelRef = useRef(1)

  const [phase, setPhase] = useState('loading')
  const [overlay, setOverlay] = useState(null)
  const [menuOverlay, setMenuOverlay] = useState(null) // 'settings' | 'credits' | null
  const [paused, setPaused] = useState(false)
  const [settings, setSettings] = useState(() => loadSettings())
  const dprCapRef = useRef(QUALITY_DPR[loadSettings().quality] || 2)
  const closeOverlayRef = useRef(null)
  const [nearbyKey, setNearbyKey] = useState(null)
  const [nearbyMeta, setNearbyMeta] = useState(null)
  const [isTouch, setIsTouch] = useState(false)
  const [completedSet, setCompletedSet] = useState(() => loadCompletedQuests())
  const [pendingCompletion, setPendingCompletion] = useState(null)
  const [trackerCollapsed, setTrackerCollapsed] = useState(false)
  const [hoveredStationKey, setHoveredStationKey] = useState(null)
  const [objectiveFeed, setObjectiveFeed] = useState([])
  const [collectedShards, setCollectedShards] = useState(() => loadCollectedShards())
  const collectedShardsRef = useRef(collectedShards)
  const [scanPulseAt, setScanPulseAt] = useState(0)
  const [tickerIndex, setTickerIndex] = useState(0)
  const [levelUp, setLevelUp] = useState(null) // { level, title }
  const [finalBanner, setFinalBanner] = useState(false)
  const [victory, setVictory] = useState(false)

  // Refs mirroring render-relevant state so the rAF loop can mount ONCE and
  // never tear down. Reading these from state in the loop's dependency array
  // would restart the loop on every hover/proximity change → frame hitches.
  const phaseRef = useRef('loading')
  const nearbyKeyRef = useRef(null)
  const hoveredStationKeyRef = useRef(null)
  const completedSetRef = useRef(completedSet)
  const scanPulseAtRef = useRef(0)

  useEffect(() => {
    const touch = isTouchDevice()
    setIsTouch(touch)
    if (touch) setTrackerCollapsed(true)
    // Baseline rank from any saved progress so resuming doesn't fire a level-up.
    const stations = QUESTS.filter((q) => completedSet.has(q.id)).length
    levelRef.current = rankFor(stations * XP_PER_STATION + collectedShards.size * XP_PER_SHARD).level
  }, [])

  useEffect(() => { collectedShardsRef.current = collectedShards }, [collectedShards])
  useEffect(() => { phaseRef.current = phase }, [phase])
  useEffect(() => { hoveredStationKeyRef.current = hoveredStationKey }, [hoveredStationKey])
  useEffect(() => { completedSetRef.current = completedSet }, [completedSet])
  useEffect(() => { scanPulseAtRef.current = scanPulseAt }, [scanPulseAt])

  // Apply settings: graphics quality → DPR cap (re-trigger resize), reduce
  // motion → body class that disables CSS animations.
  useEffect(() => {
    dprCapRef.current = QUALITY_DPR[settings.quality] || 2
    window.dispatchEvent(new Event('resize'))
    document.body.classList.toggle('reduce-motion', !settings.motion)
  }, [settings.quality, settings.motion])

  const changeSettings = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      updateSettings(next)
      return next
    })
  }, [])

  useEffect(() => {
    pausedRef.current =
      phase !== 'play' || overlay !== null || pendingCompletion !== null || paused || menuOverlay !== null
  }, [phase, overlay, pendingCompletion, paused, menuOverlay])

  const pushObjective = useCallback((item) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const nextItem = { id, ...item }
    setObjectiveFeed((items) => [...items.slice(-2), nextItem])
    setTimeout(() => {
      setObjectiveFeed((items) => items.filter((x) => x.id !== id))
    }, item.duration || 4200)
  }, [])

  const resetMovementInput = useCallback(() => {
    keysRef.current = {}
    joyRef.current.x = 0
    joyRef.current.y = 0
    playerRef.current.moving = false
  }, [])

  // ──── Juice helpers (particles / floating text / shake) ────
  const spawnBurst = useCallback((col, row, color, count = 16, power = 1) => {
    const fx = fxRef.current
    const c = isoTileCenter(col, row)
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = (40 + Math.random() * 130) * power
      fx.particles.push({
        x: c.x, y: c.y - 14,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 70 * power,
        life: 1, max: 0.7 + Math.random() * 0.5,
        size: 2 + Math.random() * 2,
        color,
      })
    }
  }, [])

  const spawnText = useCallback((col, row, text, color, big = false) => {
    const c = isoTileCenter(col, row)
    fxRef.current.texts.push({ x: c.x, y: c.y - 36, text, color, life: 1, big })
  }, [])

  const computeXp = useCallback(() => {
    const stations = QUESTS.filter((q) => completedSetRef.current.has(q.id)).length
    return stations * XP_PER_STATION + collectedShardsRef.current.size * XP_PER_SHARD
  }, [])

  // After any XP gain, check for a rank up and fire the celebration.
  const checkProgress = useCallback(() => {
    const xp = computeXp()
    const rank = rankFor(xp)
    if (rank.level > levelRef.current) {
      levelRef.current = rank.level
      setLevelUp({ level: rank.level, title: rank.title })
      sfx.levelup()
      fxRef.current.shake = 16
      fxRef.current.flash = 1
      spawnText(playerRef.current.col, playerRef.current.row, 'LEVEL UP', COLORS.gold, true)
      spawnBurst(playerRef.current.col, playerRef.current.row, COLORS.gold, 30, 1.4)
      setTimeout(() => setLevelUp(null), 2200)
    }
  }, [computeXp, spawnText, spawnBurst])

  const startPlay = useCallback(() => {
    setPhase('play')
    pushObjective({
      kind: 'new',
      kicker: 'GUIDED TOUR',
      title: 'Start with Meet Viren',
      detail: 'Use the path panel or walk to a glowing station.',
    })
  }, [pushObjective])

  // Enter the world directly from the title menu, optionally opening a station.
  const enterWorld = useCallback((overlayId = null) => {
    setPhase('play')
    if (overlayId) setOverlay(overlayId)
    else {
      pushObjective({
        kind: 'new',
        kicker: 'EXPLORE',
        title: 'You are in the studio',
        detail: 'Walk to a glowing station and press E, or follow the path panel.',
      })
    }
  }, [pushObjective])

  const triggerScan = useCallback(() => {
    const now = performance.now()
    sfx.scan()
    setScanPulseAt(now)
    pushObjective({
      kind: 'new',
      kicker: 'GUIDANCE',
      title: 'Nearby stations highlighted',
      detail: 'Follow the brightest markers or use the mobile quick path.',
      duration: 3200,
    })
  }, [pushObjective])

  useEffect(() => {
    if (phase !== 'play' || overlay || pendingCompletion) resetMovementInput()
  }, [phase, overlay, pendingCompletion, resetMovementInput])

  useEffect(() => {
    if (phase !== 'play') return undefined
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % WORLD_TICKER.length)
    }, 5200)
    return () => clearInterval(id)
  }, [phase])

  // ──── Keyboard input ────
  useEffect(() => {
    const resetOnHidden = () => {
      if (document.hidden) resetMovementInput()
    }
    const down = (e) => {
      const k = e.key.toLowerCase()
      if (k === 'escape') {
        e.preventDefault()
        if (menuOverlay) { sfx.back(); setMenuOverlay(null); return }
        if (overlay) { closeOverlayRef.current?.(); return }
        if (pendingCompletion) { sfx.back(); setPendingCompletion(null); return }
        if (phase === 'play') {
          const willPause = !paused
          if (willPause) sfx.pause(); else sfx.resume()
          setPaused(willPause)
          resetMovementInput()
        }
        return
      }
      const tag = (e.target && e.target.tagName) || ''
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', 'q', ' '].includes(k)) {
        e.preventDefault()
      }
      const blocked = overlay || pendingCompletion || paused || menuOverlay
      keysRef.current[k] = true
      if (k === 'q' && phase === 'play' && !blocked) {
        triggerScan()
      }
      if (k === 'e' || k === ' ') {
        if (phase === 'play' && !blocked && interactRef.current) {
          openStation(interactRef.current)
        }
      }
    }
    const up = (e) => {
      const k = e.key.toLowerCase()
      keysRef.current[k] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', resetMovementInput)
    document.addEventListener('visibilitychange', resetOnHidden)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', resetMovementInput)
      document.removeEventListener('visibilitychange', resetOnHidden)
    }
  }, [phase, overlay, pendingCompletion, paused, menuOverlay, triggerScan, resetMovementInput])

  // ──── Resize handling ────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      // Cap DPR: this is a fill-heavy renderer, and 3× phone displays would
      // otherwise push ~9× the pixels for no visible gain. The cap is also the
      // graphics-quality lever (low/medium/high) from Settings.
      const dpr = Math.min(window.devicePixelRatio || 1, dprCapRef.current)
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      const ctx = canvas.getContext('2d')
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // ──── Collision in tile coords ────
  const stationFromPointer = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    const screenX = clientX - rect.left
    const screenY = clientY - rect.top
    const world = isoUnproject(screenX + cameraRef.current.x, screenY + cameraRef.current.y)

    let best = null
    let bestDist = Infinity
    for (const s of STATION_BLOCKS) {
      const centerCol = s.col + 1
      const centerRow = s.row + 1
      const insideFootprint =
        world.col >= s.col - 0.35 &&
        world.col <= s.col + 2.35 &&
        world.row >= s.row - 0.35 &&
        world.row <= s.row + 2.55
      const d = Math.hypot(centerCol - world.col, centerRow - world.row)
      if ((insideFootprint || d < 1.85) && d < bestDist) {
        best = s
        bestDist = d
      }
    }
    return best
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onMove = (e) => {
      if (phase !== 'play' || overlay || pendingCompletion || isTouch) {
        setHoveredStationKey(null)
        canvas.style.cursor = ''
        return
      }
      const station = stationFromPointer(e.clientX, e.clientY)
      setHoveredStationKey(station?.key || null)
      canvas.style.cursor = station ? 'pointer' : ''
    }

    const onLeave = () => {
      setHoveredStationKey(null)
      canvas.style.cursor = ''
    }

    const onClick = (e) => {
      if (phase !== 'play' || overlay || pendingCompletion || isTouch) return
      const station = stationFromPointer(e.clientX, e.clientY)
      if (station) openStation(station)
    }

    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', onClick)
    return () => {
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [phase, overlay, pendingCompletion, stationFromPointer, isTouch])

  function collidesAt(col, row) {
    const half = PLAYER_HALF
    const corners = [
      [col - half, row - half],
      [col + half, row - half],
      [col - half, row + half],
      [col + half, row + half],
    ]
    for (const [cc, rr] of corners) {
      const c = Math.floor(cc)
      const r = Math.floor(rr)
      if (isWall(c, r)) return true
      if (isStationBlocked(c, r)) return true
    }
    return false
  }

  function openStation(s) {
    sfx.open()
    setOverlay(s.key)
  }

  // ──── On overlay close, mark quest complete if applicable ────
  const handleCloseOverlay = useCallback(() => {
    const wasOverlay = overlay
    sfx.close()
    setOverlay(null)
    if (wasOverlay && QUEST_BY_ID[wasOverlay] && !completedSet.has(wasOverlay)) {
      const next = new Set(completedSet)
      next.add(wasOverlay)
      setCompletedSet(next)
      completedSetRef.current = next // keep ref in sync for immediate XP math
      saveCompletedQuests(next)
      const completedQuest = QUEST_BY_ID[wasOverlay]
      const wasProjectsDoneBefore = PROJECT_QUEST_IDS.every((id) => completedSet.has(id))
      const allProjectsDone = PROJECT_QUEST_IDS.every((id) => next.has(id))
      const nextProjectId = PROJECT_QUEST_IDS.find((id) => !next.has(id))
      const nextProjectQuest = nextProjectId ? QUEST_BY_ID[nextProjectId] : null

      pushObjective({
        kind: wasOverlay.startsWith('project:') ? 'complete' : 'achievement',
        kicker: wasOverlay.startsWith('project:') ? 'PROJECT REVIEWED' : 'QUEST UPDATED',
        title: completedQuest.title,
        detail: allProjectsDone
          ? 'Final step unlocked: Contact Viren.'
          : nextProjectQuest
            ? `Next suggested review: ${nextProjectQuest.title}`
            : 'Next step available in the guided path.',
      })

      // Juice: reward burst + floating XP at the player.
      spawnBurst(playerRef.current.col, playerRef.current.row, COLORS.green, 26, 1.2)
      spawnText(playerRef.current.col, playerRef.current.row, `+${XP_PER_STATION} XP`, COLORS.green, true)
      fxRef.current.shake = Math.max(fxRef.current.shake, 8)
      checkProgress()

      // Climax beats.
      if (wasOverlay === 'contact' && allProjectsDone) {
        fxRef.current.shake = 20
        fxRef.current.flash = 1
        spawnBurst(playerRef.current.col, playerRef.current.row, COLORS.gold, 44, 1.8)
        sfx.victory()
        setTimeout(() => setVictory(true), 360)
        return
      } else if (allProjectsDone && !wasProjectsDoneBefore) {
        fxRef.current.shake = 14
        fxRef.current.flash = 0.8
        setFinalBanner(true)
        setTimeout(() => setFinalBanner(false), 3200)
        setTimeout(() => { sfx.complete(); setPendingCompletion(wasOverlay) }, 120)
        return
      }

      // Small delay so the close animation can play first
      setTimeout(() => { sfx.complete(); setPendingCompletion(wasOverlay) }, 120)
    }
  }, [overlay, completedSet, pushObjective, checkProgress, spawnBurst, spawnText])

  // Expose the latest close handler to imperative callers (Escape key).
  useEffect(() => { closeOverlayRef.current = handleCloseOverlay }, [handleCloseOverlay])

  const quitToTitle = useCallback(() => {
    sfx.back()
    setPaused(false)
    setMenuOverlay(null)
    setOverlay(null)
    setPendingCompletion(null)
    resetMovementInput()
    setPhase('title')
  }, [resetMovementInput])

  const resumePlay = useCallback(() => {
    sfx.resume()
    setPaused(false)
  }, [])

  // ──── Game loop ────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTRef.current) / 1000)
      lastTRef.current = now

      // Update player + interactable (only when not paused)
      if (!pausedRef.current) {
        // Input vector in SCREEN cardinal directions. We rotate 45° into tile space
        // so the visual movement matches what the player presses.
        let sx = 0
        let sy = 0
        const k = keysRef.current
        if (k['w'] || k['arrowup']) sy -= 1
        if (k['s'] || k['arrowdown']) sy += 1
        if (k['a'] || k['arrowleft']) sx -= 1
        if (k['d'] || k['arrowright']) sx += 1
        sx += joyRef.current.x
        sy += joyRef.current.y
        const mag = Math.sqrt(sx * sx + sy * sy)
        if (mag > 1) { sx /= mag; sy /= mag }
        // Rotate screen-space input into tile-space movement:
        //   dCol =  sx + sy  (right + down both increase col)
        //   dRow = -sx + sy  (down increases row, right decreases row)
        const dCol = (sx + sy)
        const dRow = (-sx + sy)
        const moveMag = Math.sqrt(dCol * dCol + dRow * dRow)
        const moving = moveMag > 0.05
        const p = playerRef.current
        if (moving) {
          // Direction inferred from the dominant SCREEN axis (intuitive sprite facing).
          if (Math.abs(sx) > Math.abs(sy)) p.dir = sx > 0 ? 'right' : 'left'
          else p.dir = sy > 0 ? 'down' : 'up'
        }
        // Movement (axis separated for sliding).
        const step = PLAYER_SPEED * dt
        const normCol = moveMag > 0 ? dCol / moveMag : 0
        const normRow = moveMag > 0 ? dRow / moveMag : 0
        const stepCol = normCol * step * moveMag
        const stepRow = normRow * step * moveMag
        const newCol = p.col + stepCol
        if (!collidesAt(newCol, p.row)) p.col = newCol
        const newRow = p.row + stepRow
        if (!collidesAt(p.col, newRow)) p.row = newRow
        p.col = clamp(p.col, 1.2, WORLD_W - 1.2)
        p.row = clamp(p.row, 1.2, WORLD_H - 1.2)
        p.anim = (p.anim + (moving ? dt * 6 : 0)) % 4
        p.moving = moving

        // Nearby interactable
        const near = nearestInteractable(p.col, p.row, 2.0)
        interactRef.current = near
        const nk = near?.key || null
        if (nk !== nearbyKeyRef.current) {
          if (nk) sfx.proximity() // soft ping when entering a station's range
          nearbyKeyRef.current = nk
          setNearbyKey(nk)
          setNearbyMeta(near || null)
        }

        // Drone NPC patrol: simple oscillation between two waypoints.
        dronePosRef.current.phase += dt * 0.6
        const phaseT = (Math.sin(dronePosRef.current.phase) + 1) / 2
        dronePosRef.current.col = 5 + phaseT * 22
        dronePosRef.current.row = 11.5 + Math.sin(dronePosRef.current.phase * 1.7) * 0.5

        for (const shard of DATA_SHARDS) {
          if (collectedShardsRef.current.has(shard.id)) continue
          const dist = Math.hypot(p.col - shard.col, p.row - shard.row)
          if (dist < 0.75) {
            const next = new Set(collectedShardsRef.current)
            next.add(shard.id)
            collectedShardsRef.current = next
            setCollectedShards(next)
            saveCollectedShards(next)
            sfx.pickup()
            spawnBurst(shard.col, shard.row, COLORS.cyan, 20, 1)
            spawnText(shard.col, shard.row, `+${XP_PER_SHARD} XP`, COLORS.cyan)
            fxRef.current.shake = Math.max(fxRef.current.shake, 5)
            pushObjective({
              kind: 'complete',
              kicker: 'DATA SHARD FOUND',
              title: shard.name,
              detail: `+${XP_PER_SHARD} XP - ${next.size}/${DATA_SHARDS.length} world secrets recovered.`,
              duration: 3000,
            })
            checkProgress()
          }
        }
      }

      // Camera (always interpolating so it settles after overlay closes)
      const viewW = canvas.clientWidth
      const viewH = canvas.clientHeight
      let targetX
      let targetY
      let camLerp = CAMERA_LERP
      if (phaseRef.current !== 'play') {
        // Cinematic menu camera: slow drifting pan/orbit across the studio so
        // the world feels alive behind the title screen, like a AAA main menu.
        const ct = now / 1000
        const cx = WORLD_ISO_W * (0.5 + 0.2 * Math.sin(ct * 0.045))
        const cy = WORLD_ISO_H * (0.46 + 0.14 * Math.cos(ct * 0.035))
        targetX = cx - viewW / 2
        targetY = cy - viewH / 2
        camLerp = 0.02 // slower, smoother cinematic glide
      } else {
        const playerIso = isoProject(playerRef.current.col - 0.5, playerRef.current.row - 0.5)
        targetX = playerIso.x + HALF_W - viewW / 2
        targetY = playerIso.y + HALF_H - viewH / 2
      }
      cameraRef.current.x += (targetX - cameraRef.current.x) * camLerp
      cameraRef.current.y += (targetY - cameraRef.current.y) * camLerp

      // Clamp camera so we don't pan past the world bounds (with margin).
      const margin = 80
      const minX = -margin
      const maxX = WORLD_ISO_W + margin - viewW
      const minY = -200 // allow sky room above
      const maxY = WORLD_ISO_H + margin - viewH
      if (maxX > minX) cameraRef.current.x = clamp(cameraRef.current.x, minX, maxX)
      else cameraRef.current.x = (WORLD_ISO_W - viewW) / 2
      if (maxY > minY) cameraRef.current.y = clamp(cameraRef.current.y, minY, maxY)
      else cameraRef.current.y = (WORLD_ISO_H - viewH) / 2

      // ── Render
      // Screen shake: decaying random offset added to the camera.
      const fx = fxRef.current
      let shakeX = 0
      let shakeY = 0
      if (fx.shake > 0.2) {
        shakeX = (Math.random() - 0.5) * fx.shake
        shakeY = (Math.random() - 0.5) * fx.shake
        fx.shake *= Math.pow(0.0025, dt) // ~exponential decay, framerate independent
      } else {
        fx.shake = 0
      }
      const camX = cameraRef.current.x + shakeX
      const camY = cameraRef.current.y + shakeY
      const t = now

      drawSky(ctx, viewW, viewH, t)
      drawFloor(ctx, camX, camY, viewW, viewH, t)

      // Build depth-sorted item list
      const items = []
      // Walls
      for (let r = 0; r < WORLD_H; r++) {
        for (let c = 0; c < WORLD_W; c++) {
          if (TILES[r][c] === 'h') {
            items.push({
              depth: c + r + 1,
              kind: 'wall',
              col: c, row: r,
            })
          }
        }
      }
      // Stations
      for (const s of STATION_BLOCKS) {
        items.push({
          depth: s.col + s.row + 2, // center of 2×2
          kind: 'station',
          station: s,
        })
      }
      // Player
      items.push({
        depth: playerRef.current.col + playerRef.current.row,
        kind: 'player',
      })
      // Drone NPC
      items.push({
        depth: dronePosRef.current.col + dronePosRef.current.row,
        kind: 'drone',
      })
      items.sort((a, b) => a.depth - b.depth)

      for (const it of items) {
        if (it.kind === 'wall') {
          ctx.save()
          ctx.translate(-camX, -camY)
          drawExtrudedBox(ctx, it.col, it.row, 1, 1, 28, {
            top: COLORS.wallTop,
            rightFace: COLORS.wallSide,
            leftFace: COLORS.wallSideDark,
            edge: 'rgba(94, 232, 255, 0.07)',
          })
          ctx.restore()
        } else if (it.kind === 'station') {
          const isNear = interactRef.current && interactRef.current.key === it.station.key
          const isHovered = hoveredStationKeyRef.current === it.station.key
          const scanAge = scanPulseAtRef.current ? t - scanPulseAtRef.current : Infinity
          const stationDist = Math.hypot(
            playerRef.current.col - (it.station.col + 1),
            playerRef.current.row - (it.station.row + 1),
          )
          const scanBoost = scanStationIntensity(scanAge, stationDist)
          drawStation(ctx, it.station, camX, camY, t, isNear || isHovered, completedSetRef.current.has(it.station.key), scanBoost)
        } else if (it.kind === 'player') {
          const playerIsoP = isoProject(playerRef.current.col - 0.5, playerRef.current.row - 0.5)
          drawPlayer(
            ctx,
            playerIsoP.x + HALF_W - camX,
            playerIsoP.y + HALF_H - camY,
            playerRef.current.dir,
            playerRef.current.anim,
            playerRef.current.moving,
            t,
          )
        } else if (it.kind === 'drone') {
          const d = dronePosRef.current
          const dIso = isoProject(d.col - 0.5, d.row - 0.5)
          drawDroneNPC(
            ctx,
            dIso.x + HALF_W - camX,
            dIso.y + HALF_H - camY,
            t,
          )
        }
      }

      for (const shard of DATA_SHARDS) {
        if (!collectedShardsRef.current.has(shard.id)) {
          drawDataShard(ctx, shard, camX, camY, t)
        }
      }

      const scanAge = scanPulseAtRef.current ? t - scanPulseAtRef.current : Infinity
      if (scanAge >= 0 && scanAge < SCAN_TRAVEL_MS) {
        drawScanPulse(ctx, playerRef.current, camX, camY, scanAge)
      }

      // Quest markers (drawn on top, but skip when overlay is open or station is the active one)
      if (phaseRef.current === 'play') {
        for (const s of STATION_BLOCKS) {
          if (!QUEST_BY_ID[s.key]) continue
          const isCompleted = completedSetRef.current.has(s.key)
          const isNear = interactRef.current && interactRef.current.key === s.key
          const isHovered = hoveredStationKeyRef.current === s.key
          if (isNear || isHovered) continue // floating label already covers info
          const stationDist = Math.hypot(
            playerRef.current.col - (s.col + 1),
            playerRef.current.row - (s.row + 1),
          )
          drawQuestMarker(ctx, s, camX, camY, t, isCompleted, scanStationIntensity(scanAge, stationDist))
        }
      }

      // ── FX layer: particles + floating text (world-space, camera-offset) ──
      if (fx.particles.length) {
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (let i = fx.particles.length - 1; i >= 0; i--) {
          const p = fx.particles[i]
          p.life -= dt / p.max
          if (p.life <= 0) { fx.particles.splice(i, 1); continue }
          p.vy += 220 * dt // gravity
          p.vx *= 0.96
          p.x += p.vx * dt
          p.y += p.vy * dt
          ctx.globalAlpha = Math.max(0, p.life)
          ctx.fillStyle = p.color
          const s = p.size * (0.4 + p.life * 0.6)
          ctx.fillRect(p.x - camX - s / 2, p.y - camY - s / 2, s, s)
        }
        ctx.restore()
      }
      if (fx.texts.length) {
        ctx.save()
        ctx.textAlign = 'center'
        for (let i = fx.texts.length - 1; i >= 0; i--) {
          const tx = fx.texts[i]
          tx.life -= dt / 1.1
          if (tx.life <= 0) { fx.texts.splice(i, 1); continue }
          tx.y -= 34 * dt
          const a = Math.min(1, tx.life * 1.6)
          const px = tx.x - camX
          const py = tx.y - camY
          ctx.globalAlpha = a
          ctx.font = tx.big ? '800 22px ui-monospace, Menlo, Consolas, monospace' : '800 14px ui-monospace, Menlo, Consolas, monospace'
          ctx.lineWidth = 3
          ctx.strokeStyle = 'rgba(0,0,0,0.6)'
          ctx.strokeText(tx.text, px, py)
          ctx.fillStyle = tx.color
          ctx.fillText(tx.text, px, py)
        }
        ctx.restore()
      }

      drawAmbientDust(ctx, viewW, viewH, t)
      drawForegroundAtmosphere(ctx, viewW, viewH, t)

      // Full-screen flash (level up / victory) — fades fast.
      if (fx.flash > 0.01) {
        ctx.save()
        ctx.globalAlpha = fx.flash * 0.5
        ctx.fillStyle = '#fff'
        ctx.fillRect(0, 0, viewW, viewH)
        ctx.restore()
        fx.flash *= Math.pow(0.0005, dt)
      } else {
        fx.flash = 0
      }

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
    // Loop mounts once. All render-relevant state is read through refs above,
    // so the rAF loop is never torn down and rebuilt mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const joyMove = useCallback((x, y) => { joyRef.current.x = x; joyRef.current.y = y }, [])

  // ──── Overlay routing ────
  const renderOverlay = () => {
    if (!overlay) return null
    if (overlay === 'aria') return <AriaOverlay onClose={handleCloseOverlay} />
    if (overlay === 'about') return <AboutOverlay onClose={handleCloseOverlay} />
    if (overlay === 'trophy') return <TrophyOverlay onClose={handleCloseOverlay} />
    if (overlay === 'contact') return <ContactOverlay onClose={handleCloseOverlay} />
    if (overlay === 'showreel') return <ShowreelOverlay onClose={handleCloseOverlay} />
    if (overlay === 'skills') return <SkillTreeOverlay onClose={handleCloseOverlay} />
    if (overlay.startsWith('project:')) {
      return <ProjectOverlay slug={overlay.slice(8)} onClose={handleCloseOverlay} />
    }
    return null
  }

  const finalMissionUnlocked = PROJECT_QUEST_IDS.every((id) => completedSet.has(id))
  const xpTotal = QUESTS.filter((q) => completedSet.has(q.id)).length * 100 + collectedShards.size * 15
  const nextQuest = QUESTS.find((q) => !completedSet.has(q.id))

  return (
    <div className="stage">
      <canvas ref={canvasRef} className="game-canvas" />

      <div className="vignette" />
      <div className="scanlines" />

      {phase === 'play' && (
        <div className="hud">
          <div className="hud-top">
            <div className="hud-brand">
              <span className="dot" />
              <div>
                <div className="name">VIREN.exe</div>
                <div className="sub">{profile.title}</div>
              </div>
            </div>
            <FunHud
              xp={xpTotal}
              shards={collectedShards.size}
              totalShards={DATA_SHARDS.length}
              ticker={WORLD_TICKER[tickerIndex]}
              onScan={triggerScan}
            />
            <Minimap playerRef={playerRef} completedSet={completedSet} />
          </div>

          <QuestTracker
            activeKey={nearbyKey}
            completedSet={completedSet}
            finalUnlocked={finalMissionUnlocked}
            collapsed={trackerCollapsed}
            onToggleCollapsed={() => { sfx.tick(); setTrackerCollapsed((v) => !v) }}
            onQuestClick={(id) => { sfx.open(); setOverlay(id) }}
          />
          {isTouch && (
            <MobileGuide
              completedSet={completedSet}
              nextQuest={nextQuest}
              finalUnlocked={finalMissionUnlocked}
              onOpen={(id) => { sfx.open(); setOverlay(id) }}
            />
          )}
          <ObjectiveFeed items={objectiveFeed} />

          <div className="hud-bottom">
            {nearbyMeta ? (
              <div className="hud-prompt">
                <span className="key">E</span>
                <span className="label">{completedSet.has(nearbyMeta.key) ? 'revisit' : 'open'}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span className="title">{nearbyMeta.label}</span>
              </div>
            ) : (
              <div className="hud-controls-hint">
                <span><span className="k">W</span><span className="k">A</span><span className="k">S</span><span className="k">D</span> walk</span>
                <span><span className="k">E</span> open</span>
                <span><span className="k">Q</span> guide</span>
                <span className="route-chip"><span className="route-dot" /> next: {nextQuest?.title || 'Contact Viren'}</span>
              </div>
            )}
            <button className="hud-btn" style={{ pointerEvents: 'auto' }} onClick={() => { sfx.open(); setOverlay('aria') }}>
              ⌬ Viren's Assistant
            </button>
          </div>
        </div>
      )}

      {phase === 'play' && isTouch && (
        <>
          <VirtualJoystick onMove={joyMove} />
          <button
            className="touch-interact"
            disabled={!nearbyMeta || !!overlay}
            onClick={() => { if (interactRef.current) openStation(interactRef.current) }}
          >
            E
          </button>
        </>
      )}

      {phase === 'loading' && <LoadingScreen onDone={() => setPhase('pressstart')} />}
      {phase === 'pressstart' && (
        <PressStartScreen onStart={() => { startAudio(); setPhase('title') }} />
      )}
      {phase === 'title' && (
        <TitleScreen
          hasProgress={completedSet.size > 0 || collectedShards.size > 0}
          progressLabel={
            completedSet.size > 0
              ? `Resume · ${QUESTS.filter((q) => completedSet.has(q.id)).length}/${QUESTS.length} stations reviewed`
              : 'Resume your visit'
          }
          onPlay={() => setPhase('intro')}
          onContinue={() => enterWorld(null)}
          onJump={(id) => enterWorld(id)}
          onSettings={() => setMenuOverlay('settings')}
          onCredits={() => setMenuOverlay('credits')}
        />
      )}
      {phase === 'play' && paused && (
        <PauseMenu
          active={!menuOverlay}
          onResume={resumePlay}
          onSettings={() => { sfx.select(); setMenuOverlay('settings') }}
          onCredits={() => { sfx.select(); setMenuOverlay('credits') }}
          onQuit={quitToTitle}
        />
      )}
      {menuOverlay === 'settings' && (
        <SettingsOverlay settings={settings} onChange={changeSettings} onClose={() => { sfx.back(); setMenuOverlay(null) }} />
      )}
      {menuOverlay === 'credits' && (
        <CreditsOverlay onClose={() => { sfx.back(); setMenuOverlay(null) }} />
      )}
      {phase === 'intro' && <IntroScreen onStart={startPlay} />}
      {phase === 'play' && finalBanner && <FinalBanner />}
      {phase === 'play' && levelUp && <LevelUpBanner level={levelUp.level} title={levelUp.title} />}
      {renderOverlay()}
      {pendingCompletion && (
        <QuestCompleted questId={pendingCompletion} onDismiss={() => setPendingCompletion(null)} />
      )}
      {victory && (
        <VictoryScreen
          stats={{
            title: rankFor(xpTotal).title,
            level: rankFor(xpTotal).level,
            stations: QUESTS.filter((q) => completedSet.has(q.id)).length,
            totalStations: QUESTS.length,
            shards: collectedShards.size,
            totalShards: DATA_SHARDS.length,
            xp: xpTotal,
          }}
          onTitle={() => { setVictory(false); quitToTitle() }}
          onContact={() => { sfx.open(); setVictory(false); setOverlay('contact') }}
        />
      )}
    </div>
  )
}
