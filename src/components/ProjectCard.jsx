import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ProjectCard({ project, index }) {
  const color = project.type === 'ai' ? 'var(--ai)' : 'var(--game)'
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
    >
      <Link to={`/projects/${project.slug}`} className="card" style={{ '--c': color }}>
        <span className="tag">{project.type === 'ai' ? 'Applied AI' : 'Game Dev'}</span>
        <h3>{project.name}</h3>
        <p className="sum">{project.summary}</p>
        <div className="meta">
          {project.year} · {project.role}
        </div>
        <div className="arrow">View project →</div>
      </Link>
    </motion.div>
  )
}
