import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

// Card that tilts in 3D toward the cursor and lifts on hover.
export default function ProjectCard({ project, index }) {
  const color = project.type === 'ai' ? 'var(--ai)' : 'var(--game)'
  const ref = useRef()

  const onMove = (e) => {
    const el = ref.current
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-py * 12).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(px * 16).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(px * 100 + 50).toFixed(1)}%`)
    el.style.setProperty('--my', `${(py * 100 + 50).toFixed(1)}%`)
  }
  const onLeave = () => {
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="card-tilt-wrap"
    >
      <Link
        ref={ref}
        to={`/projects/${project.slug}`}
        className="card card-tilt"
        style={{ '--c': color }}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <div className="card-glow" />
        <div className="card-inner">
          <span className="tag">{project.type === 'ai' ? 'Applied AI' : 'Game Dev'}</span>
          <h3>{project.name}</h3>
          <p className="sum">{project.summary}</p>
          <div className="meta">
            {project.year} · {project.role}
          </div>
          <div className="arrow">View project →</div>
        </div>
      </Link>
    </motion.div>
  )
}
