import { useState } from 'react'
import ProjectCard from '../components/ProjectCard'
import { projects } from '../data/content'

const filters = [
  { key: 'all', label: 'All' },
  { key: 'ai', label: 'Applied AI' },
  { key: 'game', label: 'Game Dev' },
]

export default function Projects() {
  const [active, setActive] = useState('all')
  const shown = projects.filter((p) => active === 'all' || p.type === active)

  return (
    <section className="block">
      <div className="container">
        <div className="section-head">
          <span className="kicker">Portfolio</span>
          <h2>Everything I’ve built</h2>
          <p>
            From gameplay systems and 3D environments to AI assistants used by students
            and a doctor’s patients.
          </p>
        </div>

        <div className="cta-row" style={{ marginBottom: 36 }}>
          {filters.map((f) => (
            <button
              key={f.key}
              className={`btn ${active === f.key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setActive(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="project-grid">
          {shown.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
