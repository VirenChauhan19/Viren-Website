import { useEffect, useRef, useState, useCallback } from 'react'
import {
  TILE,
  WORLD_W,
  WORLD_H,
  PLAYER_SPAWN,
  STATION_BLOCKS,
  isWall,
  isStationBlocked,
  nearestInteractable,
} from './world.js'
import {
  drawFloor,
  drawStation,
  drawPlayer,
  drawAmbientDust,
  drawInteractSparkle,
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
import { profile } from '../data/content.js'

const WORLD_PX_W = WORLD_W * TILE
const WORLD_PX_H = WORLD_H * TILE
const PLAYER_SPEED = 140 // px / sec
const PLAYER_HALF = 5 // collision half-width (small box; lets the player tuck up to stations)
const CAMERA_LERP = 0.14

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    (navigator && (navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0))
  )
}

// ──────────────────── Boot sequence ────────────────────

const BOOT_LINES = [
  { text: 'VIREN.exe BIOS v0.4.7  ·  © Viren Chauhan', cls: '' },
  { text: 'Detecting recruiter…', cls: 'ok', delay: 240 },
  { text: 'Loading studio geometry [36 × 22 tiles]', cls: 'ok', delay: 200 },
  { text: 'Mounting arcade cabinets [3]', cls: 'ok', delay: 180 },
  { text: 'Mounting AI workstations [2]', cls: 'ok', delay: 180 },
  { text: 'Booting ARIA · retrieval-engine v0.4', cls: 'ok', delay: 220 },
  { text: 'Calibrating particle systems', cls: 'ok', delay: 180 },
  { text: 'Ready.', cls: '', delay: 240 },
]

function BootScreen({ onDone }) {
  const [shown, setShown] = useState(0)
  const [fading, setFading] = useState(false)
  const skipped = useRef(false)

  useEffect(() => {
    if (skipped.current) return
    if (shown >= BOOT_LINES.length) {
      const t = setTimeout(() => setFading(true), 480)
      const t2 = setTimeout(() => onDone(), 480 + 380)
      return () => {
        clearTimeout(t)
        clearTimeout(t2)
      }
    }
    const d = BOOT_LINES[shown].delay ?? 180
    const t = setTimeout(() => setShown((s) => s + 1), d)
    return () => clearTimeout(t)
  }, [shown, onDone])

  const skip = () => {
    skipped.current = true
    setFading(true)
    setTimeout(() => onDone(), 200)
  }

  return (
    <div className={`boot ${fading ? 'boot-fade-out' : ''}`} onClick={skip} role="button" tabIndex={-1}>
      <div className="boot-inner">
        <div className="boot-title">VIREN.exe</div>
        {BOOT_LINES.slice(0, shown).map((l, i) => (
          <div key={i} className={`boot-line ${l.cls}`}>
            {`> ${l.text}`}
          </div>
        ))}
        {shown >= BOOT_LINES.length && (
          <div className="boot-line" style={{ marginTop: 12 }}>
            Press anywhere to enter the studio<span className="boot-cursor" />
          </div>
        )}
      </div>
    </div>
  )
}

// ──────────────────── Intro card ────────────────────

function IntroScreen({ onStart }) {
  return (
    <div className="intro" onClick={onStart}>
      <div className="intro-card" onClick={(e) => e.stopPropagation()}>
        <div className="intro-tag"><span className="pulse" /> Playable portfolio · v1.0</div>
        <h1 className="intro-title">
          You just walked into <em>{profile.name}'s</em> studio.
        </h1>
        <p className="intro-sub">
          {profile.title}. Walk around the floor, peek at the arcade cabinets, sit at the AI desks,
          and talk to ARIA if you've got questions.
        </p>

        <div className="intro-controls">
          <div className="row">
            <div className="keys">
              <span className="kk">W</span><span className="kk">A</span><span className="kk">S</span><span className="kk">D</span>
            </div>
            <span className="lab">move around</span>
          </div>
          <div className="row">
            <div className="keys">
              <span className="kk">↑</span><span className="kk">↓</span><span className="kk">←</span><span className="kk">→</span>
            </div>
            <span className="lab">also works</span>
          </div>
          <div className="row">
            <span className="kk">E</span>
            <span className="lab">interact with stations</span>
          </div>
          <div className="row">
            <span className="kk">Esc</span>
            <span className="lab">close any panel</span>
          </div>
        </div>

        <button className="intro-start" onClick={onStart}>
          Enter the studio
          <span className="arrow">→</span>
        </button>
      </div>
    </div>
  )
}

// ──────────────────── Minimap ────────────────────

function Minimap({ playerRef }) {
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
      // Background
      ctx.fillStyle = '#0a0c12'
      ctx.fillRect(0, 0, w, h)
      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 1
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1)

      const sx = w / WORLD_W
      const sy = h / WORLD_H

      // Zone tints
      ctx.fillStyle = 'rgba(94, 232, 255, 0.06)'
      ctx.fillRect(0, 2 * sy, w, 8 * sy)
      ctx.fillStyle = 'rgba(255, 154, 90, 0.06)'
      ctx.fillRect(0, 13 * sy, w, 7 * sy)

      // Walls
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
      for (let r = 0; r < WORLD_H; r++) {
        for (let c = 0; c < WORLD_W; c++) {
          if (isWall(c, r)) ctx.fillRect(c * sx, r * sy, sx, sy)
        }
      }

      // Stations
      for (const s of STATION_BLOCKS) {
        const color =
          s.accent === 'cyan' ? COLORS.cyan :
          s.accent === 'warm' ? COLORS.warm :
          s.accent === 'green' ? COLORS.green : COLORS.gold
        ctx.fillStyle = color
        ctx.fillRect(s.col * sx, s.row * sy, sx * 2, sy * 2)
      }

      // Player
      const p = playerRef.current
      if (p) {
        const pcol = p.x / TILE
        const prow = p.y / TILE
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(pcol * sx, prow * sy, 2.4, 0, Math.PI * 2)
        ctx.fill()
        // Halo
        ctx.strokeStyle = 'rgba(255,255,255,0.45)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pcol * sx, prow * sy, 5, 0, Math.PI * 2)
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [playerRef])

  return (
    <div className="minimap" aria-hidden>
      <div className="minimap-label">STUDIO MAP</div>
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

    const r = 50 // max stick travel from center
    const reset = () => {
      activeRef.current = false
      idRef.current = null
      if (stickRef.current) {
        stickRef.current.style.transform = `translate(-50%, -50%)`
      }
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
      if (dist > r) {
        dx = (dx / dist) * r
        dy = (dy / dist) * r
      }
      if (stickRef.current) {
        stickRef.current.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`
      }
      // Normalize to -1..1, with deadzone
      const deadzone = 10
      const m = Math.max(0, Math.sqrt(dx * dx + dy * dy) - deadzone) / (r - deadzone)
      const angle = Math.atan2(dy, dx)
      onMove(Math.cos(angle) * m, Math.sin(angle) * m)
    }

    const onTouchStart = (e) => {
      if (activeRef.current) return
      e.preventDefault()
      const t = e.changedTouches[0]
      startAt(t)
    }
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
    // Mouse fallback for testing
    base.addEventListener('mousedown', (e) => { startAt(e) ; window.addEventListener('mousemove', mouseMove) ; window.addEventListener('mouseup', mouseUp, { once: true }) })
    const mouseMove = (e) => activeRef.current && moveTo(e.clientX, e.clientY)
    const mouseUp = () => { window.removeEventListener('mousemove', mouseMove); reset() }

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
    x: PLAYER_SPAWN.col * TILE + TILE / 2,
    y: PLAYER_SPAWN.row * TILE + TILE / 2,
    dir: 'down',
    anim: 0,
    moving: false,
  })
  const cameraRef = useRef({ x: 0, y: 0 })
  const keysRef = useRef({})
  const joyRef = useRef({ x: 0, y: 0 })
  const interactRef = useRef(null) // currently in-range station
  const pausedRef = useRef(true) // paused during boot / intro / overlay
  const rafRef = useRef(0)
  const lastTRef = useRef(performance.now())

  const [phase, setPhase] = useState('boot') // boot | intro | play
  const [overlay, setOverlay] = useState(null) // null | station-key
  const [nearbyKey, setNearbyKey] = useState(null)
  const [nearbyMeta, setNearbyMeta] = useState(null)
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  // Pause game when overlays open or out of play phase.
  useEffect(() => {
    pausedRef.current = phase !== 'play' || overlay !== null
  }, [phase, overlay])

  // ──── Keyboard input ────
  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase()
      // Escape always closes overlays, even when typing in the chat.
      if (k === 'escape') {
        if (overlay) setOverlay(null)
        return
      }
      // Ignore game keys while focused inside text inputs.
      const tag = (e.target && e.target.tagName) || ''
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', ' '].includes(k)) {
        e.preventDefault()
      }
      keysRef.current[k] = true

      if (k === 'e' || k === ' ') {
        if (phase === 'play' && !overlay && interactRef.current) {
          openStation(interactRef.current)
        }
      }
    }
    const up = (e) => {
      const tag = (e.target && e.target.tagName) || ''
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      const k = e.key.toLowerCase()
      keysRef.current[k] = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [phase, overlay])

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

  // ──── Collision check (world pixels) ────
  function collidesAt(x, y) {
    // Test corners of player's small AABB.
    const half = PLAYER_HALF
    const corners = [
      [x - half, y - half + 4],
      [x + half, y - half + 4],
      [x - half, y + half],
      [x + half, y + half],
    ]
    for (const [cx, cy] of corners) {
      const col = Math.floor(cx / TILE)
      const row = Math.floor(cy / TILE)
      if (isWall(col, row)) return true
      if (isStationBlocked(col, row)) return true
    }
    return false
  }

  // ──── Open a station's overlay ────
  function openStation(s) {
    setOverlay(s.key)
  }

  // ──── Game loop ────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTRef.current) / 1000)
      lastTRef.current = now

      if (!pausedRef.current) {
        // ── Input vector
        let vx = 0
        let vy = 0
        const k = keysRef.current
        if (k['w'] || k['arrowup']) vy -= 1
        if (k['s'] || k['arrowdown']) vy += 1
        if (k['a'] || k['arrowleft']) vx -= 1
        if (k['d'] || k['arrowright']) vx += 1
        // Joystick override (additive but normalized later)
        vx += joyRef.current.x
        vy += joyRef.current.y
        const mag = Math.sqrt(vx * vx + vy * vy)
        if (mag > 1) {
          vx /= mag
          vy /= mag
        }
        const moving = mag > 0.05
        const p = playerRef.current
        // Direction
        if (moving) {
          if (Math.abs(vx) > Math.abs(vy)) p.dir = vx > 0 ? 'right' : 'left'
          else p.dir = vy > 0 ? 'down' : 'up'
        }
        // Movement (axis-separated for sliding along walls)
        const dx = vx * PLAYER_SPEED * dt
        const dy = vy * PLAYER_SPEED * dt
        const nx = p.x + dx
        if (!collidesAt(nx, p.y)) p.x = nx
        const ny = p.y + dy
        if (!collidesAt(p.x, ny)) p.y = ny
        // Clamp inside world
        p.x = clamp(p.x, TILE + PLAYER_HALF, WORLD_PX_W - TILE - PLAYER_HALF)
        p.y = clamp(p.y, TILE + PLAYER_HALF, WORLD_PX_H - TILE - PLAYER_HALF)
        // Animation
        p.anim = (p.anim + (moving ? dt * 6 : 0)) % 4
        p.moving = moving

        // Nearby interactable
        const ncol = p.x / TILE
        const nrow = p.y / TILE
        const near = nearestInteractable(ncol, nrow, 1.4)
        interactRef.current = near
        if ((near?.key || null) !== nearbyKey) {
          setNearbyKey(near?.key || null)
          setNearbyMeta(near || null)
        }
      }

      // ── Camera follow (always interpolates so it settles after overlay closes)
      const viewW = canvas.clientWidth
      const viewH = canvas.clientHeight
      const targetX = playerRef.current.x - viewW / 2
      const targetY = playerRef.current.y - viewH / 2
      cameraRef.current.x += (targetX - cameraRef.current.x) * CAMERA_LERP
      cameraRef.current.y += (targetY - cameraRef.current.y) * CAMERA_LERP
      // Clamp camera so we don't see past the world walls (allow a small margin).
      const margin = 24
      if (WORLD_PX_W > viewW) {
        cameraRef.current.x = clamp(cameraRef.current.x, -margin, WORLD_PX_W - viewW + margin)
      } else {
        cameraRef.current.x = -(viewW - WORLD_PX_W) / 2
      }
      if (WORLD_PX_H > viewH) {
        cameraRef.current.y = clamp(cameraRef.current.y, -margin, WORLD_PX_H - viewH + margin)
      } else {
        cameraRef.current.y = -(viewH - WORLD_PX_H) / 2
      }

      // ── Render
      const camX = cameraRef.current.x
      const camY = cameraRef.current.y
      const t = now

      drawFloor(ctx, camX, camY, viewW, viewH, t)

      // Stations + player in Y-sorted order so closer-to-camera items overlap correctly.
      const items = []
      for (const s of STATION_BLOCKS) {
        items.push({
          y: (s.row + 2) * TILE, // bottom edge of footprint
          render: () => drawStation(ctx, s, camX, camY, t, interactRef.current && interactRef.current.key === s.key),
          interactCenter: s,
        })
      }
      items.push({
        y: playerRef.current.y,
        render: () => drawPlayer(
          ctx,
          playerRef.current.x - camX,
          playerRef.current.y - camY,
          playerRef.current.dir,
          playerRef.current.anim,
          playerRef.current.moving,
          t,
        ),
      })
      items.sort((a, b) => a.y - b.y)
      for (const it of items) it.render()

      // Interaction sparkle marker above current interactable
      if (interactRef.current && !overlay && phase === 'play') {
        const s = interactRef.current
        drawInteractSparkle(
          ctx,
          (s.col + 1) * TILE - camX,
          s.row * TILE - camY - 12,
          t,
        )
      }

      // Ambient dust on top
      drawAmbientDust(ctx, viewW, viewH, t)

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [overlay, phase, nearbyKey])

  // Joystick callback (stable for the joystick effect deps)
  const joyMove = useCallback((x, y) => {
    joyRef.current.x = x
    joyRef.current.y = y
  }, [])

  // ──── Render the right overlay component ────
  const renderOverlay = () => {
    if (!overlay) return null
    const close = () => setOverlay(null)
    if (overlay === 'aria') return <AriaOverlay onClose={close} />
    if (overlay === 'about') return <AboutOverlay onClose={close} />
    if (overlay === 'trophy') return <TrophyOverlay onClose={close} />
    if (overlay === 'contact') return <ContactOverlay onClose={close} />
    if (overlay === 'showreel') return <ShowreelOverlay onClose={close} />
    if (overlay.startsWith('project:')) {
      const slug = overlay.slice(8)
      return <ProjectOverlay slug={slug} onClose={close} />
    }
    return null
  }

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
            <Minimap playerRef={playerRef} />
          </div>

          <div className="hud-bottom">
            {nearbyMeta ? (
              <div className="hud-prompt">
                <span className="key">E</span>
                <span className="label">interact</span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span className="title">{nearbyMeta.label}</span>
              </div>
            ) : (
              <div className="hud-controls-hint">
                <span><span className="k">W</span><span className="k">A</span><span className="k">S</span><span className="k">D</span> move</span>
                <span><span className="k">E</span> interact</span>
                <span style={{ color: 'var(--ink-ghost)' }}>· walk up to a station to learn more</span>
              </div>
            )}
            <button
              className="hud-btn"
              style={{ pointerEvents: 'auto' }}
              onClick={() => setOverlay('aria')}
            >
              ⌬ Talk to ARIA
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
            onClick={() => {
              if (interactRef.current) openStation(interactRef.current)
            }}
          >
            E
          </button>
        </>
      )}

      {phase === 'boot' && <BootScreen onDone={() => setPhase('intro')} />}
      {phase === 'intro' && <IntroScreen onStart={() => setPhase('play')} />}
      {renderOverlay()}
    </div>
  )
}
