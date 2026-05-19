import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MeshDistortMaterial, Icosahedron, Torus } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/scrollState'

const lerp = THREE.MathUtils.lerp

// Color theme that morphs across the scroll: emerald -> gold -> coral.
const C_A = new THREE.Color('#2dd4a7')
const C_B = new THREE.Color('#f5c451')
const C_C = new THREE.Color('#ff7a6b')
function themeColor(p, out) {
  if (p < 0.5) out.copy(C_A).lerp(C_B, p / 0.5)
  else out.copy(C_B).lerp(C_C, (p - 0.5) / 0.5)
  return out
}

// Particle field you "fly through" as you scroll.
function ParticleField() {
  const ref = useRef()
  const count = 2600
  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const speeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = (Math.random() - 0.5) * 26
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
      speeds[i] = 0.4 + Math.random() * 1.2
    }
    return { positions, speeds }
  }, [])

  useFrame((_, delta) => {
    const pts = ref.current.geometry.attributes.position.array
    const flow = 1 + Math.abs(scrollState.velocity) * 0.05
    for (let i = 0; i < count; i++) {
      pts[i * 3 + 2] += speeds[i] * delta * 3 * flow
      if (pts[i * 3 + 2] > 9) pts[i * 3 + 2] = -22
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.z += delta * 0.02
    ref.current.position.x = lerp(ref.current.position.x, scrollState.pointerX * 0.6, 0.04)
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.045} color="#9be3cf" transparent opacity={0.7} sizeAttenuation />
    </points>
  )
}

// The hero core: distorts, spins, and travels up/back as you scroll away.
function MorphCore() {
  const mesh = useRef()
  const mat = useRef()
  const col = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    const p = scrollState.progress
    const t = state.clock.elapsedTime
    mesh.current.rotation.y += delta * 0.25
    mesh.current.rotation.x = lerp(mesh.current.rotation.x, scrollState.pointerY * 0.5, 0.05)
    mesh.current.rotation.z = lerp(mesh.current.rotation.z, -scrollState.pointerX * 0.4, 0.05)
    // Drift up and shrink into the distance as the user scrolls down.
    mesh.current.position.y = lerp(mesh.current.position.y, 0.2 + p * 5.5 + Math.sin(t) * 0.1, 0.06)
    mesh.current.position.x = lerp(mesh.current.position.x, scrollState.pointerX * 0.7 - p * 2.2, 0.05)
    const s = lerp(1, 0.45, p)
    mesh.current.scale.setScalar(lerp(mesh.current.scale.x, s, 0.06))
    if (mat.current) {
      themeColor(p, col)
      mat.current.color.lerp(col, 0.05)
      mat.current.distort = 0.35 + Math.abs(scrollState.velocity) * 0.01 + Math.sin(t * 1.5) * 0.06
    }
  })

  return (
    <Icosahedron ref={mesh} args={[1.55, 8]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        ref={mat}
        color="#2dd4a7"
        emissive="#0f4a3a"
        emissiveIntensity={0.5}
        roughness={0.15}
        metalness={0.9}
        distort={0.4}
        speed={2}
      />
    </Icosahedron>
  )
}

function OrbitRing({ radius, axis, speed, baseTilt }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation[axis] += delta * speed
    ref.current.rotation.x = baseTilt + scrollState.progress * 1.6
    const s = 1 + scrollState.progress * 0.4
    ref.current.scale.setScalar(s)
  })
  return (
    <group ref={ref} rotation={[baseTilt, 0.4, 0]}>
      <Torus args={[radius, 0.01, 16, 140]}>
        <meshStandardMaterial color="#f5c451" emissive="#f5c451" emissiveIntensity={0.8} />
      </Torus>
    </group>
  )
}

function Rig() {
  useFrame((state) => {
    // Subtle camera dolly + parallax tied to scroll and pointer.
    const p = scrollState.progress
    state.camera.position.x = lerp(state.camera.position.x, scrollState.pointerX * 0.5, 0.04)
    state.camera.position.y = lerp(state.camera.position.y, -scrollState.pointerY * 0.4, 0.04)
    state.camera.position.z = lerp(state.camera.position.z, 6 + p * 2.5, 0.05)
    state.camera.lookAt(0, p * 1.5, 0)
  })
  return null
}

function Lights() {
  const l1 = useRef()
  const l2 = useRef()
  const a = useMemo(() => new THREE.Color(), [])
  const b = useMemo(() => new THREE.Color(), [])
  useFrame(() => {
    const p = scrollState.progress
    if (l1.current) l1.current.color.lerp(themeColor(p, a), 0.05)
    if (l2.current) l2.current.color.lerp(themeColor(1 - p, b), 0.05)
  })
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight ref={l1} position={[5, 5, 5]} intensity={1.5} color="#f5c451" />
      <pointLight ref={l2} position={[-6, -3, -4]} intensity={1.3} color="#ff7a6b" />
    </>
  )
}

export default function ScrollScene() {
  return (
    <div className="scroll-scene">
      <Canvas dpr={[1, 1.8]} camera={{ position: [0, 0, 6], fov: 52 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <Lights />
          <ParticleField />
          <MorphCore />
          <OrbitRing radius={2.3} axis="z" speed={0.3} baseTilt={1.1} />
          <OrbitRing radius={2.9} axis="z" speed={-0.2} baseTilt={-0.5} />
          <Rig />
        </Suspense>
      </Canvas>
    </div>
  )
}
