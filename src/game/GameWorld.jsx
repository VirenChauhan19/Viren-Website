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

const PLAYER_SPEED = 5.5 // tiles per second
const PLAYER_HALF = 0.18 // collision half-extent in tile units
const CAMERA_LERP = 0.14
const SCAN_RADIUS_TILES = 7.5
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
  'MIDNIGHT BUILD: neon storm rolling over the AI labs.',
  'ARCADE DOCKS: cabinets warming up, input latency nominal.',
  "VIREN'S ASSISTANT: recruiter questions ready offline.",
  'SIMULATION DECK: project beacons synced to quest log.',
  'RECRUIT SIGNAL: final terminal waiting for a serious player.',
]

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

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
  return (
    <div className="fun-hud">
      <div className="vibe-chip">
        <span>Vibe</span>
        <strong>Neon Storm</strong>
      </div>
      <div className="fun-stat">
        <span>XP</span>
        <strong>{xp}</strong>
      </div>
      <div className="fun-stat">
        <span>Data</span>
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

// ──────────────────── Boot sequence ────────────────────

const BOOT_LINES = [
  { text: 'VIREN.exe BIOS v0.7.0  ·  © Viren Chauhan', cls: '' },
  { text: 'Detecting recruiter…', cls: 'ok', delay: 220 },
  { text: 'Loading isometric world [32 × 22 tiles]', cls: 'ok', delay: 200 },
  { text: 'Mounting 11 quest stations', cls: 'ok', delay: 180 },
  { text: "Booting Viren's Assistant · retrieval-engine v0.4", cls: 'ok', delay: 200 },
  { text: 'Loading quest log…', cls: 'ok', delay: 180 },
  { text: 'Calibrating sun beam + cloud layer', cls: 'ok', delay: 180 },
  { text: 'Spawning ambient drone', cls: 'ok', delay: 160 },
  { text: 'Ready.', cls: '', delay: 240 },
]

function BootScreen({ onDone }) {
  const [shown, setShown] = useState(0)
  const [fading, setFading] = useState(false)
  const skippedRef = useRef(false)

  useEffect(() => {
    if (skippedRef.current) return
    if (shown >= BOOT_LINES.length) {
      const t1 = setTimeout(() => setFading(true), 480)
      const t2 = setTimeout(() => onDone(), 480 + 380)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    const d = BOOT_LINES[shown].delay ?? 180
    const t = setTimeout(() => setShown((s) => s + 1), d)
    return () => clearTimeout(t)
  }, [shown, onDone])

  const skip = () => {
    skippedRef.current = true
    setFading(true)
    setTimeout(() => onDone(), 200)
  }

  return (
    <div className={`boot ${fading ? 'boot-fade-out' : ''}`} onClick={skip} role="button" tabIndex={-1}>
      <div className="boot-inner">
        <div className="boot-title">VIREN.exe</div>
        {BOOT_LINES.slice(0, shown).map((l, i) => (
          <div key={i} className={`boot-line ${l.cls}`}>{`> ${l.text}`}</div>
        ))}
        {shown >= BOOT_LINES.length && (
          <div className="boot-line" style={{ marginTop: 12 }}>
            Press anywhere to enter the world<span className="boot-cursor" />
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────── Intro card ────────────────────

function AnimatedWords({ text, className = '', baseDelay = 0, step = 72, as: Tag = 'p' }) {
  const words = text.split(' ')
  return (
    <Tag className={`intro-words ${className}`}>
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          className="intro-word"
          style={{ animationDelay: `${baseDelay + i * step}ms` }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </Tag>
  )
}

function IntroScreen({ onStart }) {
  const pages = [
    {
      tag: 'WELCOME TO VIREN.exe',
      name: "Viren's Assistant",
      text: "Hey, player. I'm Viren's Assistant. You just loaded into Viren's playable portfolio, so I'm giving you the quick field briefing before I hand you the controls.",
      objective: 'Objective: explore the studio and discover why Viren is worth recruiting.',
    },
    {
      tag: 'HOW TO PLAY',
      name: "Viren's Assistant",
      text: 'Walk up to glowing quest stations and press E. Each station opens a project, skill, timeline, or contact mission. Completed stations add XP and push you toward the final recruitment terminal.',
      objective: 'Tip: press Q to scan. Only nearby quest signals will flare up.',
    },
    {
      tag: 'READY CHECK',
      name: "Viren's Assistant",
      text: "This is not a normal portfolio page. Treat it like a tiny RPG hub: move, inspect, ask questions, and follow the brightest clues.",
      objective: 'Quest line unlocked: Meet the Operator.',
    },
  ]
  const [pageIdx, setPageIdx] = useState(0)
  const page = pages[pageIdx]
  const isLast = pageIdx === pages.length - 1
  const next = () => {
    if (isLast) onStart()
    else setPageIdx((i) => i + 1)
  }

  return (
    <div className="intro" onClick={next}>
      <div className="intro-card" key={pageIdx} onClick={(e) => e.stopPropagation()}>
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
          <AnimatedWords text={page.text} baseDelay={720} step={78} />
          <AnimatedWords
            text={page.objective}
            className="intro-objective"
            baseDelay={720 + page.text.split(' ').length * 78 + 180}
            step={62}
            as="div"
          />
        </div>

        <div className="intro-controls">
          <div className="row">
            <div className="keys"><span className="kk">W</span><span className="kk">A</span><span className="kk">S</span><span className="kk">D</span></div>
            <span className="lab">move</span>
          </div>
          <div className="row">
            <div className="keys"><span className="kk">↑</span><span className="kk">↓</span><span className="kk">←</span><span className="kk">→</span></div>
            <span className="lab">also works</span>
          </div>
          <div className="row"><span className="kk">E</span><span className="lab">interact / open quest</span></div>
          <div className="row"><span className="kk">Q</span><span className="lab">scan nearby quests</span></div>
        </div>

        <div className="intro-pips">
          {pages.map((_, i) => <span key={i} className={i === pageIdx ? 'active' : ''} />)}
        </div>

        <button className="intro-start" onClick={next}>
          {isLast ? 'Enter the studio' : 'Continue briefing'}
          <span className="arrow">→</span>
        </button>
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

  const [phase, setPhase] = useState('boot')
  const [overlay, setOverlay] = useState(null)
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

  useEffect(() => { setIsTouch(isTouchDevice()) }, [])

  useEffect(() => {
    collectedShardsRef.current = collectedShards
  }, [collectedShards])

  useEffect(() => {
    pausedRef.current = phase !== 'play' || overlay !== null || pendingCompletion !== null
  }, [phase, overlay, pendingCompletion])

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

  const startPlay = useCallback(() => {
    setPhase('play')
    pushObjective({
      kind: 'new',
      kicker: 'NEW OBJECTIVE',
      title: 'Choose a quest station',
      detail: 'Follow the markers, hover a station, or open the quest log.',
    })
  }, [pushObjective])

  const triggerScan = useCallback(() => {
    const now = performance.now()
    setScanPulseAt(now)
    pushObjective({
      kind: 'new',
      kicker: 'SCAN PULSE',
      title: 'Quest signals revealed',
      detail: 'Quest buildings are overcharged. Follow the brightest markers.',
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
        if (overlay) setOverlay(null)
        if (pendingCompletion) setPendingCompletion(null)
        resetMovementInput()
        return
      }
      const tag = (e.target && e.target.tagName) || ''
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', 'q', ' '].includes(k)) {
        e.preventDefault()
      }
      keysRef.current[k] = true
      if (k === 'q' && phase === 'play' && !overlay && !pendingCompletion) {
        triggerScan()
      }
      if (k === 'e' || k === ' ') {
        if (phase === 'play' && !overlay && !pendingCompletion && interactRef.current) {
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
  }, [phase, overlay, pendingCompletion, triggerScan, resetMovementInput])

  // ──── Resize handling ────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
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
    setOverlay(s.key)
  }

  // ──── On overlay close, mark quest complete if applicable ────
  const handleCloseOverlay = useCallback(() => {
    const wasOverlay = overlay
    setOverlay(null)
    if (wasOverlay && QUEST_BY_ID[wasOverlay] && !completedSet.has(wasOverlay)) {
      const next = new Set(completedSet)
      next.add(wasOverlay)
      setCompletedSet(next)
      saveCompletedQuests(next)
      const completedQuest = QUEST_BY_ID[wasOverlay]
      const allProjectsDone = PROJECT_QUEST_IDS.every((id) => next.has(id))
      const nextProjectId = PROJECT_QUEST_IDS.find((id) => !next.has(id))
      const nextProjectQuest = nextProjectId ? QUEST_BY_ID[nextProjectId] : null

      pushObjective({
        kind: wasOverlay.startsWith('project:') ? 'complete' : 'achievement',
        kicker: wasOverlay.startsWith('project:') ? 'PROJECT REVIEWED' : 'QUEST UPDATED',
        title: completedQuest.title,
        detail: allProjectsDone
          ? 'Final objective unlocked: Recruit Viren.'
          : nextProjectQuest
            ? `Next objective: ${nextProjectQuest.title}`
            : 'New objective available in the quest log.',
      })
      // Small delay so the close animation can play first
      setTimeout(() => setPendingCompletion(wasOverlay), 120)
    }
  }, [overlay, completedSet, pushObjective])

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
        if ((near?.key || null) !== nearbyKey) {
          setNearbyKey(near?.key || null)
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
            pushObjective({
              kind: 'complete',
              kicker: 'DATA SHARD FOUND',
              title: shard.name,
              detail: `+15 XP - ${next.size}/${DATA_SHARDS.length} world secrets recovered.`,
              duration: 3000,
            })
          }
        }
      }

      // Camera (always interpolating so it settles after overlay closes)
      const viewW = canvas.clientWidth
      const viewH = canvas.clientHeight
      const playerIso = isoProject(playerRef.current.col - 0.5, playerRef.current.row - 0.5)
      const targetX = playerIso.x + HALF_W - viewW / 2
      const targetY = playerIso.y + HALF_H - viewH / 2
      cameraRef.current.x += (targetX - cameraRef.current.x) * CAMERA_LERP
      cameraRef.current.y += (targetY - cameraRef.current.y) * CAMERA_LERP

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
      const camX = cameraRef.current.x
      const camY = cameraRef.current.y
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
          const isHovered = hoveredStationKey === it.station.key
          const scanAge = scanPulseAt ? t - scanPulseAt : Infinity
          const scanActive = scanAge >= 0 && scanAge < 1800
          const stationDist = Math.hypot(
            playerRef.current.col - (it.station.col + 1),
            playerRef.current.row - (it.station.row + 1),
          )
          const scanBoost = scanActive && stationDist <= SCAN_RADIUS_TILES
          drawStation(ctx, it.station, camX, camY, t, isNear || isHovered, completedSet.has(it.station.key), scanBoost)
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
        if (!collectedShards.has(shard.id)) {
          drawDataShard(ctx, shard, camX, camY, t)
        }
      }

      const scanAge = scanPulseAt ? t - scanPulseAt : Infinity
      const scanBoost = scanAge >= 0 && scanAge < 1800
      if (scanAge >= 0 && scanAge < 1500) {
        drawScanPulse(ctx, playerRef.current, camX, camY, scanAge)
      }

      // Quest markers (drawn on top, but skip when overlay is open or station is the active one)
      if (phase === 'play') {
        for (const s of STATION_BLOCKS) {
          if (!QUEST_BY_ID[s.key]) continue
          const isCompleted = completedSet.has(s.key)
          const isNear = interactRef.current && interactRef.current.key === s.key
          const isHovered = hoveredStationKey === s.key
          if (isNear || isHovered) continue // floating label already covers info
          const stationDist = Math.hypot(
            playerRef.current.col - (s.col + 1),
            playerRef.current.row - (s.row + 1),
          )
          drawQuestMarker(ctx, s, camX, camY, t, isCompleted, scanBoost && stationDist <= SCAN_RADIUS_TILES)
        }
      }

      drawAmbientDust(ctx, viewW, viewH, t)
      drawForegroundAtmosphere(ctx, viewW, viewH, t)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [overlay, phase, nearbyKey, completedSet, pendingCompletion, hoveredStationKey, collectedShards, scanPulseAt, pushObjective])

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
            onToggleCollapsed={() => setTrackerCollapsed((v) => !v)}
            onQuestClick={(id) => setOverlay(id)}
          />
          <ObjectiveFeed items={objectiveFeed} />

          <div className="hud-bottom">
            {nearbyMeta ? (
              <div className="hud-prompt">
                <span className="key">E</span>
                <span className="label">{completedSet.has(nearbyMeta.key) ? 'revisit' : 'start quest'}</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span className="title">{nearbyMeta.label}</span>
              </div>
            ) : (
              <div className="hud-controls-hint">
                <span><span className="k">W</span><span className="k">A</span><span className="k">S</span><span className="k">D</span> walk</span>
                <span><span className="k">E</span> interact</span>
                <span><span className="k">Q</span> scan</span>
                <span className="route-chip"><span className="route-dot" /> next: {nextQuest?.title || 'Recruit Viren'}</span>
              </div>
            )}
            <button className="hud-btn" style={{ pointerEvents: 'auto' }} onClick={() => setOverlay('aria')}>
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

      {phase === 'boot' && <BootScreen onDone={() => setPhase('intro')} />}
      {phase === 'intro' && <IntroScreen onStart={startPlay} />}
      {renderOverlay()}
      {pendingCompletion && (
        <QuestCompleted questId={pendingCompletion} onDismiss={() => setPendingCompletion(null)} />
      )}
    </div>
  )
}
