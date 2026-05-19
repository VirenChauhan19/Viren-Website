import { useParams, Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { projects } from '../data/content'
import Media from '../components/Media'

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projects.find((p) => p.slug === slug)
  if (!project) return <Navigate to="/projects" replace />

  const color = project.type === 'ai' ? 'var(--ai)' : 'var(--game)'

  return (
    <div className="container" style={{ '--c': color }}>
      <motion.div
        className="detail-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/projects" style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          ← Back to work
        </Link>
        <div style={{ marginTop: 24 }}>
          <span className="tag">{project.type === 'ai' ? 'Applied AI' : 'Game Dev'}</span>
          <h1>{project.name}</h1>
          <p className="role">
            {project.year} · {project.role}
          </p>
        </div>
      </motion.div>

      <div className="detail-grid">
        <div className="detail-body">
          {project.media && project.media.length > 0 && (
            <div className="media-stack">
              {project.media.map((m, i) => (
                <figure key={i}>
                  <Media item={m} />
                  {m.caption && <figcaption>{m.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}
          {project.description.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <h3>Highlights</h3>
          <ul>
            {project.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>

        <aside className="aside-box">
          <h4>Built with</h4>
          <div className="chips">
            {project.tech.map((t) => (
              <span className="chip" key={t}>
                {t}
              </span>
            ))}
          </div>
          <h4>Links</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {project.live && (
              <a className="btn btn-primary" href={project.live} target="_blank" rel="noreferrer">
                Live demo →
              </a>
            )}
            {project.repo && (
              <a className="btn btn-ghost" href={project.repo} target="_blank" rel="noreferrer">
                Source code
              </a>
            )}
            {!project.live && !project.repo && (
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Demo available on request.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
