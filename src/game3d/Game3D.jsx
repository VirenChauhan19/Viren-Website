// ───────────────────────────────────────────────────────────────────────────
// VIREN.exe — true 3D playable portfolio (React Three Fiber)
//
// A real 3D world: lit perspective scene with shadows, a third-person
// controllable animated character, a camera you steer with the mouse, 3D
// station kiosks you walk up to and open, floating collectible shards, and a
// roaming "sentinel" enemy that chases you. Content/overlays/audio/progression
// are reused from the existing portfolio.
// ───────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Grid, Sparkles, Html, AdaptiveDpr } from '@react-three/drei'
import * as THREE from 'three'

import { STATIONS, PLAYER_SPAWN } from '../game/world.js'
import { profile, projects } from '../data/content.js'
import { QUESTS, QUEST_BY_ID, loadCompletedQuests, saveCompletedQuests } from '../data/quests.js'
import {
  ProjectOverlay, AboutOverlay, TrophyOverlay, ContactOverlay, ShowreelOverlay, AriaOverlay,
} from '../game/Overlays.jsx'
import { SkillTreeOverlay } from '../game/SkillTree.jsx'
import { startAudio, sfx, getSettings } from '../game/audio.js'

// ── World mapping: tile (col,row) → world (x, z). y is up. ──
const ACCENT = { cyan: '#5ee8ff', warm: '#ff9a5a', green: '#6cf5a9', gold: '#ffd166' }
const BOUNDS = { minX: 1.6, maxX: 30.4, minZ: 1.6, maxZ: 20.4 }
const SHARDS = [
  { id: 'ai-core', x: 11.5, z: 8.5, name: 'AI Core Fragment' },
  { id: 'calendar-key', x: 18.5, z: 8.2, name: 'Calendar Key' },
  { id: 'arcade-token', x: 10.4, z: 18.6, name: 'Arcade Token' },
  { id: 'physics-chip', x: 16.4, z: 18.8, name: 'Physics Chip' },
  { id: 'recruit-signal', x: 24.7, z: 17.2, name: 'Recruit Signal' },
]
const XP_PER_STATION = 100
const XP_PER_SHARD = 15
const RANKS = [
  { title: 'Visitor', at: 0 }, { title: 'Recruiter', at: 100 }, { title: 'Scout', at: 250 },
  { title: 'Analyst', at: 450 }, { title: 'Advocate', at: 700 }, { title: 'Hire-Ready', at: 1000 },
]
function rankFor(xp) {
  let i = 0
  for (let k = 0; k < RANKS.length; k++) if (xp >= RANKS[k].at) i = k
  const next = RANKS[i + 1] || null
  const base = RANKS[i].at
  return { level: i + 1, title: RANKS[i].title, next, progress: next ? Math.min(1, (xp - base) / (next.at - base)) : 1 }
}

const STATIONS3D = STATIONS.map((s) => ({
  ...s,
  x: s.col + 0.5,
  z: s.row + 0.5,
  color: ACCENT[s.accent] || ACCENT.cyan,
}))

function tileToWorld(col, row) { return [col, 0, row] }

// Reusable temp vectors so the per-frame loop allocates nothing (no GC churn).
const _fwd = new THREE.Vector3()
const _right = new THREE.Vector3()
const _move = new THREE.Vector3()
const _want = new THREE.Vector3()

// ───────────────────────── Shared runtime ─────────────────────────
function makeRuntime() {
  return {
    keys: {},
    yaw: Math.PI, pitch: 0.62, dist: 11,
    player: new THREE.Vector3(PLAYER_SPAWN.col, 0, PLAYER_SPAWN.row),
    vel: new THREE.Vector3(),
    face: Math.PI,
    moving: false,
    nearest: null,
    paused: false,
    chased: false,
    shake: 0,
    dragging: false,
    sentinel: new THREE.Vector3(6, 0, 11),
    stunUntil: 0,
  }
}

// ───────────────────────── Input + camera control ─────────────────────────
function Controls({ g, onInteract, onScan }) {
  const { gl } = useThree()
  useEffect(() => {
    const el = gl.domElement
    const down = (e) => {
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', 'q', ' '].includes(k)) e.preventDefault()
      g.keys[k] = true
      if (k === 'e' || k === ' ') onInteract()
      if (k === 'q') onScan()
    }
    const up = (e) => { g.keys[e.key.toLowerCase()] = false }
    const onPointerDown = (e) => { g.dragging = true; g.lastX = e.clientX; g.lastY = e.clientY }
    const onPointerUp = () => { g.dragging = false }
    const onPointerMove = (e) => {
      if (!g.dragging) return
      const dx = e.clientX - (g.lastX ?? e.clientX)
      const dy = e.clientY - (g.lastY ?? e.clientY)
      g.lastX = e.clientX; g.lastY = e.clientY
      g.yaw -= dx * 0.006
      g.pitch = Math.max(0.18, Math.min(1.15, g.pitch + dy * 0.004))
    }
    const onWheel = (e) => { g.dist = Math.max(6, Math.min(18, g.dist + Math.sign(e.deltaY) * 0.8)) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointermove', onPointerMove)
    el.addEventListener('wheel', onWheel, { passive: true })
    el.style.cursor = 'grab'
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('wheel', onWheel)
    }
  }, [gl, g, onInteract, onScan])
  return null
}

function blockedByStation(x, z) {
  for (const s of STATIONS3D) {
    if (Math.abs(x - s.x) < 1.15 && Math.abs(z - s.z) < 1.15) return true
  }
  return false
}

// ───────────────────────── Player + camera rig ─────────────────────────
function Player({ g }) {
  const group = useRef()
  const root = useRef()
  const legL = useRef(); const legR = useRef()
  const armL = useRef(); const armR = useRef()
  const torso = useRef()
  const { camera } = useThree()
  const walkT = useRef(0)

  useFrame((_, dt) => {
    const d = Math.min(0.05, dt)
    // camera-relative input
    let ix = 0; let iz = 0
    const k = g.keys
    if (k['w'] || k['arrowup']) iz += 1
    if (k['s'] || k['arrowdown']) iz -= 1
    if (k['a'] || k['arrowleft']) ix -= 1
    if (k['d'] || k['arrowright']) ix += 1

    _fwd.set(-Math.sin(g.yaw), 0, -Math.cos(g.yaw))
    _right.set(-_fwd.z, 0, _fwd.x)
    _move.set(0, 0, 0)
    if (!g.paused && performance.now() > g.stunUntil) {
      _move.addScaledVector(_fwd, iz).addScaledVector(_right, ix)
    }
    const moving = _move.lengthSq() > 0.001
    g.moving = moving
    if (moving) {
      _move.normalize()
      const move = _move
      const speed = 5.4
      const nx = g.player.x + move.x * speed * d
      const nz = g.player.z + move.z * speed * d
      if (!blockedByStation(nx, g.player.z)) g.player.x = THREE.MathUtils.clamp(nx, BOUNDS.minX, BOUNDS.maxX)
      if (!blockedByStation(g.player.x, nz)) g.player.z = THREE.MathUtils.clamp(nz, BOUNDS.minZ, BOUNDS.maxZ)
      g.face = Math.atan2(move.x, move.z)
    }

    // place + rotate character
    if (root.current) {
      root.current.position.set(g.player.x, 0, g.player.z)
      let a = root.current.rotation.y
      let diff = g.face - a
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      root.current.rotation.y = a + diff * Math.min(1, d * 12)
    }

    // procedural animation
    walkT.current += d * (moving ? 11 : 3)
    const sw = Math.sin(walkT.current)
    const amp = moving ? 0.7 : 0.06
    if (legL.current) legL.current.rotation.x = sw * amp
    if (legR.current) legR.current.rotation.x = -sw * amp
    if (armL.current) armL.current.rotation.x = -sw * amp * 0.8
    if (armR.current) armR.current.rotation.x = sw * amp * 0.8
    if (torso.current) torso.current.position.y = 0.95 + Math.abs(sw) * (moving ? 0.06 : 0.02)

    // ── camera follow + orbit + shake ──
    const cp = g.pitch
    _want.set(
      g.player.x + Math.sin(g.yaw) * Math.cos(cp) * g.dist,
      Math.sin(cp) * g.dist + 1.2,
      g.player.z + Math.cos(g.yaw) * Math.cos(cp) * g.dist,
    )
    camera.position.lerp(_want, 1 - Math.pow(0.001, d))
    if (g.shake > 0.1) {
      camera.position.x += (Math.random() - 0.5) * g.shake * 0.06
      camera.position.y += (Math.random() - 0.5) * g.shake * 0.06
      g.shake *= Math.pow(0.0025, d)
    } else g.shake = 0
    camera.lookAt(g.player.x, 1.1, g.player.z)
  })

  return (
    <group ref={group}>
      <group ref={root} position={[g.player.x, 0, g.player.z]}>
        {/* contact shadow blob */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <circleGeometry args={[0.55, 24]} />
          <meshBasicMaterial color="#000" transparent opacity={0.35} />
        </mesh>
        <group ref={torso} position={[0, 0.95, 0]}>
          {/* torso */}
          <mesh castShadow position={[0, 0.18, 0]}>
            <boxGeometry args={[0.5, 0.6, 0.3]} />
            <meshStandardMaterial color="#2e4a7a" metalness={0.3} roughness={0.5} emissive="#16243f" emissiveIntensity={0.3} />
          </mesh>
          {/* head */}
          <mesh castShadow position={[0, 0.66, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#f1c9a5" roughness={0.7} />
          </mesh>
          {/* visor */}
          <mesh position={[0, 0.68, 0.16]}>
            <boxGeometry args={[0.24, 0.08, 0.02]} />
            <meshStandardMaterial color="#5ee8ff" emissive="#5ee8ff" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
          {/* arms */}
          <group ref={armL} position={[-0.32, 0.42, 0]}>
            <mesh castShadow position={[0, -0.22, 0]}>
              <boxGeometry args={[0.14, 0.5, 0.16]} />
              <meshStandardMaterial color="#3e6098" roughness={0.5} />
            </mesh>
          </group>
          <group ref={armR} position={[0.32, 0.42, 0]}>
            <mesh castShadow position={[0, -0.22, 0]}>
              <boxGeometry args={[0.14, 0.5, 0.16]} />
              <meshStandardMaterial color="#3e6098" roughness={0.5} />
            </mesh>
          </group>
        </group>
        {/* legs */}
        <group ref={legL} position={[-0.14, 0.5, 0]}>
          <mesh castShadow position={[0, -0.25, 0]}>
            <boxGeometry args={[0.17, 0.5, 0.2]} />
            <meshStandardMaterial color="#1a1f2a" roughness={0.6} />
          </mesh>
        </group>
        <group ref={legR} position={[0.14, 0.5, 0]}>
          <mesh castShadow position={[0, -0.25, 0]}>
            <boxGeometry args={[0.17, 0.5, 0.2]} />
            <meshStandardMaterial color="#1a1f2a" roughness={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

// ───────────────────────── Station kiosk ─────────────────────────
function Station({ s, completed, near }) {
  const ring = useRef()
  const core = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ring.current) ring.current.rotation.y = t * 0.6
    if (core.current) {
      const p = 0.6 + Math.sin(t * 2 + s.x) * 0.2
      core.current.scale.setScalar((near ? 1.15 : 1) * (0.9 + p * 0.18))
    }
  })
  const col = completed ? ACCENT.green : s.color
  return (
    <group position={tileToWorld(s.col + 0.5, s.row + 0.5)}>
      {/* base */}
      <mesh receiveShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.95, 1.1, 0.5, 6]} />
        <meshStandardMaterial color="#161b27" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* pillar */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.7, 1.2, 0.7]} />
        <meshStandardMaterial color="#10141d" metalness={0.6} roughness={0.35} emissive={col} emissiveIntensity={near ? 0.5 : 0.18} />
      </mesh>
      {/* floating core (emissive glow — no light needed) */}
      <mesh ref={core} position={[0, 2.4, 0]}>
        <icosahedronGeometry args={[0.34, 0]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={near ? 3 : 1.6} toneMapped={false} />
      </mesh>
      {/* spinning ring */}
      <mesh ref={ring} position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.62, 0.03, 8, 32]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      {/* glow disc on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[1.2, 1.7, 32]} />
        <meshBasicMaterial color={col} transparent opacity={near ? 0.4 : 0.16} side={THREE.DoubleSide} />
      </mesh>
      {near && (
        <Html position={[0, 3.3, 0]} center distanceFactor={12} style={{ pointerEvents: 'none' }} zIndexRange={[20, 0]}>
          <div className={`g3d-nameplate near ${completed ? 'done' : ''}`}>
            <span className="np-title">{s.label}</span>
            <span className="np-sub">{completed ? 'REVIEWED ✓' : s.subtitle}</span>
          </div>
        </Html>
      )}
    </group>
  )
}

// ───────────────────────── Shard ─────────────────────────
function Shard({ s, onCollect, g }) {
  const ref = useRef()
  const got = useRef(false)
  useFrame((state, dt) => {
    if (got.current) return
    const t = state.clock.elapsedTime
    if (ref.current) {
      ref.current.rotation.y += dt * 1.6
      ref.current.position.y = 0.9 + Math.sin(t * 2 + s.x) * 0.18
    }
    const dx = g.player.x - s.x
    const dz = g.player.z - s.z
    if (dx * dx + dz * dz < 0.9) {
      got.current = true
      onCollect(s)
    }
  })
  return (
    <group ref={ref} position={[s.x, 0.9, s.z]}>
      <mesh>
        <octahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color="#5ee8ff" emissive="#5ee8ff" emissiveIntensity={2.4} metalness={0.4} roughness={0.2} toneMapped={false} />
      </mesh>
      {/* floor glow ring instead of a light */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.88, 0]}>
        <ringGeometry args={[0.5, 0.8, 20]} />
        <meshBasicMaterial color="#5ee8ff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ───────────────────────── Sentinel (enemy) ─────────────────────────
function Sentinel({ g, onCatch }) {
  const ref = useRef()
  const eye = useRef()
  useFrame((state, dt) => {
    const d = Math.min(0.05, dt)
    const t = state.clock.elapsedTime
    const px = g.player.x; const pz = g.player.z
    const dx = px - g.sentinel.x; const dz = pz - g.sentinel.z
    const dist = Math.hypot(dx, dz)
    const chasing = dist < 8 && !g.paused
    g.chased = chasing && dist > 1.2
    if (chasing) {
      const sp = 3.4 * d
      g.sentinel.x += (dx / dist) * sp
      g.sentinel.z += (dz / dist) * sp
      if (dist < 1.1 && performance.now() > g.stunUntil) onCatch()
    } else {
      // lazy patrol
      g.sentinel.x += Math.cos(t * 0.4) * 0.4 * d * 4
      g.sentinel.z += Math.sin(t * 0.33) * 0.4 * d * 4
    }
    g.sentinel.x = THREE.MathUtils.clamp(g.sentinel.x, BOUNDS.minX, BOUNDS.maxX)
    g.sentinel.z = THREE.MathUtils.clamp(g.sentinel.z, BOUNDS.minZ, BOUNDS.maxZ)
    if (ref.current) {
      ref.current.position.set(g.sentinel.x, 1.6 + Math.sin(t * 2) * 0.15, g.sentinel.z)
      ref.current.rotation.y = t * (chasing ? 3 : 1)
    }
    if (eye.current) eye.current.material.emissiveIntensity = chasing ? 3.5 : 1.4
  })
  const col = '#ff5a6e'
  return (
    <group ref={ref} position={[g.sentinel.x, 1.6, g.sentinel.z]}>
      <mesh>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#1a0d12" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={eye} position={[0, 0, 0.42]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.75, 0.04, 8, 32]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      <pointLight color={col} distance={5} intensity={2.6} />
    </group>
  )
}

// ───────────────────────── World / scene ─────────────────────────
function World({ g, completedSet, collected, onCollect, onCatch }) {
  return (
    <>
      <color attach="background" args={['#06070d']} />
      <fog attach="fog" args={['#06070d', 22, 48]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#6080ff', '#241a14', 0.6]} />
      {/* one shadow-casting sun, tightly framed + small map = cheap */}
      <directionalLight
        position={[20, 28, 14]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-camera-left={-18} shadow-camera-right={18}
        shadow-camera-top={16} shadow-camera-bottom={-16}
        shadow-camera-near={1} shadow-camera-far={70}
      />
      {/* two coloured fill lights for the zones — replaces 16 point lights */}
      <pointLight position={[16, 7, 6]} color="#5ee8ff" intensity={0.8} distance={40} />
      <pointLight position={[16, 7, 16]} color="#ff9a5a" intensity={0.7} distance={40} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0, 11]} receiveShadow>
        <planeGeometry args={[31, 21]} />
        <meshStandardMaterial color="#0c1018" metalness={0.2} roughness={0.85} />
      </mesh>
      {/* zone tints */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.015, 6]}>
        <planeGeometry args={[28, 8]} />
        <meshBasicMaterial color="#5ee8ff" transparent opacity={0.05} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[16, 0.015, 16.5]}>
        <planeGeometry args={[28, 7]} />
        <meshBasicMaterial color="#ff9a5a" transparent opacity={0.05} />
      </mesh>
      <Grid
        position={[16, 0.02, 11]}
        args={[31, 21]}
        cellSize={1} cellThickness={0.6} cellColor="#1b2740"
        sectionSize={4} sectionThickness={1} sectionColor="#2a3f66"
        fadeDistance={45} fadeStrength={1} infiniteGrid={false}
      />

      {/* perimeter walls */}
      <WallRing />

      {STATIONS3D.map((s) => (
        <Station key={s.key} s={s} completed={completedSet.has(s.key)} near={g.nearest === s.key} />
      ))}
      {SHARDS.filter((s) => !collected.has(s.id)).map((s) => (
        <Shard key={s.id} s={s} g={g} onCollect={onCollect} />
      ))}
      <Sentinel g={g} onCatch={onCatch} />
      <Player g={g} />
      <Sparkles count={26} scale={[30, 6, 20]} position={[16, 4, 11]} size={2} speed={0.2} color="#5ee8ff" opacity={0.35} />
    </>
  )
}

function Wall({ position, size }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#141a26" metalness={0.4} roughness={0.6} emissive="#0a1830" emissiveIntensity={0.25} />
    </mesh>
  )
}
function WallRing() {
  const h = 1.4
  return (
    <group>
      <Wall position={[16, h / 2, 0.6]} size={[31, h, 0.4]} />
      <Wall position={[16, h / 2, 21.4]} size={[31, h, 0.4]} />
      <Wall position={[0.6, h / 2, 11]} size={[0.4, h, 21]} />
      <Wall position={[31.4, h / 2, 11]} size={[0.4, h, 21]} />
    </group>
  )
}

// Watches proximity each frame and lifts the nearest station key to React.
function ProximityWatcher({ g, onNearChange }) {
  useFrame(() => {
    let best = null; let bd = 2.6
    for (const s of STATIONS3D) {
      const d = Math.hypot(g.player.x - s.x, g.player.z - (s.z + 1.4))
      if (d < bd) { bd = d; best = s.key }
    }
    if (best !== g.nearest) {
      g.nearest = best
      onNearChange(best)
      if (best) sfx.proximity()
    }
  })
  return null
}

// ───────────────────────── HUD + shell ─────────────────────────
function HUD({ xp, shards, totalShards, nearLabel, nearDone, chased, onScan }) {
  const rank = rankFor(xp)
  return (
    <div className="g3d-hud">
      <div className="g3d-top">
        <div className="g3d-brand"><span className="dot" /><div><b>VIREN.exe</b><span>{profile.title}</span></div></div>
        <div className="xp-block g3d-xp">
          <div className="xp-top"><span className="xp-lvl">LVL {rank.level}</span><span className="xp-title">{rank.title}</span><span className="xp-num">{xp} XP</span></div>
          <div className="xp-bar"><div className="xp-fill" style={{ width: `${rank.progress * 100}%` }} /></div>
          <div className="xp-next">{rank.next ? `${rank.next.at - xp} XP to ${rank.next.title}` : 'Max rank · Hire-Ready'} · Intel {shards}/{totalShards}</div>
        </div>
      </div>

      {chased && <div className="g3d-alert">⚠ SENTINEL LOCKED ON — RUN</div>}

      <div className="g3d-bottom">
        <div className="g3d-controls">
          <span><b>WASD</b> move</span><span><b>Drag</b> look</span><span><b>Scroll</b> zoom</span><span><b>Q</b> scan</span>
        </div>
        {nearLabel ? (
          <div className="g3d-prompt"><span className="key">E</span> {nearDone ? 'revisit' : 'open'} · <b>{nearLabel}</b></div>
        ) : (
          <div className="g3d-prompt dim">Walk to a glowing kiosk and press <span className="key">E</span></div>
        )}
      </div>
    </div>
  )
}

export default function Game3D() {
  const g = useRef(makeRuntime()).current
  const [phase, setPhase] = useState('start') // start | play
  const [overlay, setOverlay] = useState(null)
  const [completedSet, setCompletedSet] = useState(() => loadCompletedQuests())
  const [collected, setCollected] = useState(() => new Set())
  const [nearKey, setNearKey] = useState(null)
  const [chased, setChased] = useState(false)
  const [levelUp, setLevelUp] = useState(null)
  const [fxText, setFxText] = useState([]) // floating xp text in DOM
  const [flash, setFlash] = useState(false)
  const levelRef = useRef(1)
  const completedRef = useRef(completedSet)
  const collectedRef = useRef(collected)

  useEffect(() => { completedRef.current = completedSet }, [completedSet])
  useEffect(() => { collectedRef.current = collected }, [collected])
  useEffect(() => { g.paused = overlay !== null || phase !== 'play' }, [overlay, phase, g])

  const xp = QUESTS.filter((q) => completedSet.has(q.id)).length * XP_PER_STATION + collected.size * XP_PER_SHARD

  useEffect(() => {
    levelRef.current = rankFor(
      QUESTS.filter((q) => completedRef.current.has(q.id)).length * XP_PER_STATION + collectedRef.current.size * XP_PER_SHARD,
    ).level
  }, [])

  const pushXpText = useCallback((text) => {
    const id = Math.random().toString(36).slice(2)
    setFxText((arr) => [...arr.slice(-3), { id, text }])
    setTimeout(() => setFxText((arr) => arr.filter((x) => x.id !== id)), 1200)
  }, [])

  const checkLevel = useCallback(() => {
    const nxp = QUESTS.filter((q) => completedRef.current.has(q.id)).length * XP_PER_STATION + collectedRef.current.size * XP_PER_SHARD
    const r = rankFor(nxp)
    if (r.level > levelRef.current) {
      levelRef.current = r.level
      setLevelUp({ level: r.level, title: r.title })
      sfx.levelup(); g.shake = 14; setFlash(true); setTimeout(() => setFlash(false), 220)
      setTimeout(() => setLevelUp(null), 2200)
    }
  }, [g])

  const handleCollect = useCallback((shard) => {
    setCollected((prev) => {
      if (prev.has(shard.id)) return prev
      const next = new Set(prev); next.add(shard.id)
      collectedRef.current = next
      return next
    })
    sfx.pickup(); g.shake = Math.max(g.shake, 5)
    pushXpText(`+${XP_PER_SHARD} XP`)
    setTimeout(checkLevel, 0)
  }, [g, pushXpText, checkLevel])

  const handleCatch = useCallback(() => {
    g.stunUntil = performance.now() + 900
    g.shake = 18; setFlash(true); setTimeout(() => setFlash(false), 200)
    sfx.back()
    // knockback away from sentinel
    const dx = g.player.x - g.sentinel.x; const dz = g.player.z - g.sentinel.z
    const m = Math.hypot(dx, dz) || 1
    g.player.x = THREE.MathUtils.clamp(g.player.x + (dx / m) * 2.4, BOUNDS.minX, BOUNDS.maxX)
    g.player.z = THREE.MathUtils.clamp(g.player.z + (dz / m) * 2.4, BOUNDS.minZ, BOUNDS.maxZ)
  }, [g])

  const openNearest = useCallback(() => {
    if (g.paused || !g.nearest) return
    sfx.open(); setOverlay(g.nearest)
  }, [g])

  const triggerScan = useCallback(() => { if (!g.paused) sfx.scan() }, [g])

  const closeOverlay = useCallback(() => {
    const was = overlay
    sfx.close(); setOverlay(null)
    if (was && QUEST_BY_ID[was] && !completedRef.current.has(was)) {
      setCompletedSet((prev) => {
        const next = new Set(prev); next.add(was)
        completedRef.current = next
        saveCompletedQuests(next)
        return next
      })
      sfx.complete(); g.shake = Math.max(g.shake, 8)
      pushXpText(`+${XP_PER_STATION} XP`)
      setTimeout(checkLevel, 0)
    }
  }, [overlay, g, pushXpText, checkLevel])

  // chased → React (throttled via simple interval)
  useEffect(() => {
    if (phase !== 'play') return undefined
    const id = setInterval(() => setChased(g.chased), 200)
    return () => clearInterval(id)
  }, [phase, g])

  const renderOverlay = () => {
    if (!overlay) return null
    if (overlay === 'aria') return <AriaOverlay onClose={closeOverlay} />
    if (overlay === 'about') return <AboutOverlay onClose={closeOverlay} />
    if (overlay === 'trophy') return <TrophyOverlay onClose={closeOverlay} />
    if (overlay === 'contact') return <ContactOverlay onClose={closeOverlay} />
    if (overlay === 'showreel') return <ShowreelOverlay onClose={closeOverlay} />
    if (overlay === 'skills') return <SkillTreeOverlay onClose={closeOverlay} />
    if (overlay.startsWith('project:')) return <ProjectOverlay slug={overlay.slice(8)} onClose={closeOverlay} />
    return null
  }

  const nearMeta = nearKey ? STATIONS3D.find((s) => s.key === nearKey) : null

  return (
    <div className="g3d-stage">
      <Canvas
        shadows
        dpr={[1, getSettings().quality === 'low' ? 1 : getSettings().quality === 'medium' ? 1.25 : 1.5]}
        camera={{ position: [PLAYER_SPAWN.col, 9, PLAYER_SPAWN.row + 11], fov: 50, near: 0.1, far: 90 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        performance={{ min: 0.5 }}
      >
        <World
          g={g}
          completedSet={completedSet}
          collected={collected}
          onCollect={handleCollect}
          onCatch={handleCatch}
        />
        <ProximityWatcher g={g} onNearChange={setNearKey} />
        <Controls g={g} onInteract={openNearest} onScan={triggerScan} />
        <AdaptiveDpr pixelated />
      </Canvas>

      <div className="scanlines" />
      <div className={`g3d-flash ${flash ? 'on' : ''}`} />

      {phase === 'play' && (
        <HUD
          xp={xp}
          shards={collected.size}
          totalShards={SHARDS.length}
          nearLabel={nearMeta?.label}
          nearDone={nearMeta ? completedSet.has(nearMeta.key) : false}
          chased={chased}
          onScan={triggerScan}
        />
      )}

      <div className="g3d-fxtext">
        {fxText.map((t) => <span key={t.id} className="g3d-float">{t.text}</span>)}
      </div>

      {levelUp && (
        <div className="levelup-banner"><div className="lu-ring" /><div className="lu-inner">
          <span className="lu-kicker">◆ RANK UP ◆</span>
          <span className="lu-level">LEVEL {levelUp.level}</span>
          <span className="lu-title">{levelUp.title}</span>
        </div></div>
      )}

      {phase === 'start' && (
        <div className="g3d-start" onClick={() => { startAudio(); setPhase('play') }}>
          <div className="g3d-start-inner">
            <div className="ps-kicker">PLAYABLE PORTFOLIO · 3D</div>
            <h1 className="ps-logo">VIREN<span>.exe</span></h1>
            <div className="ps-tag">{profile.title}</div>
            <div className="ps-prompt">CLICK TO ENTER</div>
            <div className="g3d-start-hint">WASD move · drag to look · scroll to zoom · E to open · Q scan · avoid the red sentinel</div>
          </div>
        </div>
      )}

      {renderOverlay()}
    </div>
  )
}
