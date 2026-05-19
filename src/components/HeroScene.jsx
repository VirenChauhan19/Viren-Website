import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Icosahedron, Torus, Stars } from '@react-three/drei'
import * as THREE from 'three'

// Central morphing core — reacts subtly to the pointer.
function Core() {
  const mesh = useRef()
  useFrame((state) => {
    const { x, y } = state.pointer
    mesh.current.rotation.y += 0.0035
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, y * 0.4, 0.05)
    mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, -x * 0.4, 0.05)
  })
  return (
    <Icosahedron ref={mesh} args={[1.55, 6]} position={[0, 0, 0]}>
      <MeshDistortMaterial
        color="#6c8cff"
        emissive="#2a3a8f"
        emissiveIntensity={0.55}
        roughness={0.18}
        metalness={0.85}
        distort={0.42}
        speed={1.6}
      />
    </Icosahedron>
  )
}

function Ring({ radius, tilt, speed, color }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.z += delta * speed
  })
  return (
    <group rotation={[tilt, 0.4, 0]}>
      <Torus ref={ref} args={[radius, 0.012, 16, 120]}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} />
      </Torus>
    </group>
  )
}

// Floating shards orbiting the core.
function Shards() {
  const group = useRef()
  const items = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        pos: [
          Math.sin((i / 14) * Math.PI * 2) * (2.7 + (i % 3) * 0.4),
          (Math.random() - 0.5) * 3.4,
          Math.cos((i / 14) * Math.PI * 2) * (2.7 + (i % 3) * 0.4),
        ],
        scale: 0.07 + Math.random() * 0.12,
        c: i % 2 === 0 ? '#7af8d0' : '#ff6b9d',
      })),
    [],
  )
  useFrame((_, delta) => {
    group.current.rotation.y += delta * 0.08
  })
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <Float key={i} speed={2} rotationIntensity={2} floatIntensity={1.5}>
          <mesh position={it.pos} scale={it.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={it.c} emissive={it.c} emissiveIntensity={0.6} />
          </mesh>
        </Float>
      ))}
    </group>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      className="hero-3d"
      dpr={[1, 1.8]}
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.4} color="#7af8d0" />
        <pointLight position={[-6, -3, -4]} intensity={1.2} color="#ff6b9d" />
        <Stars radius={60} depth={40} count={1800} factor={3} fade speed={0.6} />
        <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.8}>
          <Core />
        </Float>
        <Ring radius={2.2} tilt={1.2} speed={0.25} color="#6c8cff" />
        <Ring radius={2.7} tilt={-0.6} speed={-0.18} color="#7af8d0" />
        <Shards />
      </Suspense>
    </Canvas>
  )
}
