import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import * as THREE from 'three'
import { projects } from '../data/content'

const colors = {
  ai: '#2dd4a7',
  game: '#ff7a6b',
}

function Core({ active }) {
  const mesh = useRef()
  const mat = useRef()
  const target = useMemo(() => new THREE.Color(), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const project = projects[active] ?? projects[0]
    target.set(project.type === 'ai' ? colors.ai : colors.game)
    mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, state.pointer.y * 0.22, 0.045)
    mesh.current.rotation.y += delta * 0.18
    mesh.current.position.y = Math.sin(t * 0.75) * 0.08
    mat.current.color.lerp(target, 0.045)
    mat.current.emissive.lerp(target, 0.045)
    mat.current.distort = THREE.MathUtils.lerp(mat.current.distort, 0.18 + Math.abs(state.pointer.x) * 0.06, 0.04)
  })

  return (
    <Float speed={1.15} rotationIntensity={0.18} floatIntensity={0.35}>
      <mesh ref={mesh}>
        <icosahedronGeometry args={[1.05, 8]} />
        <MeshDistortMaterial
          ref={mat}
          color={colors.ai}
          emissive={colors.ai}
          emissiveIntensity={0.34}
          roughness={0.18}
          metalness={0.75}
          distort={0.2}
          speed={1.4}
        />
      </mesh>
    </Float>
  )
}

function OrbitNode({ project, index, active, setActive, navigate }) {
  const group = useRef()
  const mesh = useRef()
  const color = project.type === 'ai' ? colors.ai : colors.game
  const angle = (index / projects.length) * Math.PI * 2
  const radius = 2.15

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime * 0.22
    const selected = active === index
    const x = Math.cos(angle + t) * radius
    const z = Math.sin(angle + t) * 0.68
    const y = Math.sin(angle * 1.7 + t * 2.2) * 0.36

    group.current.position.lerp(new THREE.Vector3(x, y, z), 0.055)
    mesh.current.rotation.x += delta * 0.28
    mesh.current.rotation.y += delta * 0.35
    mesh.current.scale.lerp(new THREE.Vector3(selected ? 1.38 : 1, selected ? 1.38 : 1, selected ? 1.38 : 1), 0.08)
  })

  return (
    <group ref={group}>
      <mesh
        ref={mesh}
        onPointerOver={(e) => {
          e.stopPropagation()
          setActive(index)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          navigate(`/projects/${project.slug}`)
        }}
      >
        {project.type === 'ai' ? (
          <octahedronGeometry args={[0.18, 1]} />
        ) : (
          <boxGeometry args={[0.25, 0.25, 0.25]} />
        )}
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active === index ? 1.15 : 0.42}
          roughness={0.25}
          metalness={0.65}
        />
      </mesh>
    </group>
  )
}

function Rings() {
  const a = useRef()
  const b = useRef()

  useFrame((_, delta) => {
    a.current.rotation.z += delta * 0.06
    b.current.rotation.z -= delta * 0.045
  })

  return (
    <>
      <mesh ref={a} rotation={[1.2, 0.2, 0.1]}>
        <torusGeometry args={[1.72, 0.006, 12, 180]} />
        <meshBasicMaterial color="#f5c451" transparent opacity={0.46} />
      </mesh>
      <mesh ref={b} rotation={[0.35, 1.25, 0.2]}>
        <torusGeometry args={[2.12, 0.005, 12, 180]} />
        <meshBasicMaterial color="#8bd3ff" transparent opacity={0.28} />
      </mesh>
    </>
  )
}

function Scene({ active, setActive, navigate }) {
  const rig = useRef()
  const light = useRef()

  useFrame((state) => {
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, state.pointer.x * 0.16, 0.035)
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, -state.pointer.y * 0.08, 0.035)
    light.current.position.x = THREE.MathUtils.lerp(light.current.position.x, state.pointer.x * 2.5, 0.04)
  })

  return (
    <>
      <ambientLight intensity={0.48} />
      <pointLight ref={light} position={[2.5, 2.6, 4]} intensity={2.1} color="#f5c451" />
      <pointLight position={[-3, -2, -2]} intensity={1.25} color="#2dd4a7" />
      <group ref={rig}>
        <Core active={active} />
        <Rings />
        {projects.map((project, index) => (
          <OrbitNode
            key={project.slug}
            project={project}
            index={index}
            active={active}
            setActive={setActive}
            navigate={navigate}
          />
        ))}
        <Sparkles count={70} scale={[5, 3, 3.2]} size={1.35} speed={0.22} color="#d8fff4" />
      </group>
    </>
  )
}

export default function HeroGalaxy() {
  const [active, setActive] = useState(0)
  const navigate = useNavigate()
  const current = projects[active] ?? projects[0]

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((value) => (value + 1) % projects.length)
    }, 4600)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div className="hero-galaxy">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.08, 5.25], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene active={active} setActive={setActive} navigate={navigate} />
        </Suspense>
      </Canvas>

      <div className="galaxy-readout">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.slug}
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{current.type === 'ai' ? 'Applied AI' : 'Game Dev'}</span>
            <strong>{current.name}</strong>
            <p>{current.summary}</p>
            <button type="button" onClick={() => navigate(`/projects/${current.slug}`)}>
              Open project
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="galaxy-tabs" aria-label="Featured projects">
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            className={active === index ? 'active' : ''}
            aria-label={project.name}
            onMouseEnter={() => setActive(index)}
            onFocus={() => setActive(index)}
            onClick={() => navigate(`/projects/${project.slug}`)}
          />
        ))}
      </div>
    </div>
  )
}
