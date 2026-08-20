import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../../data/content.js'
import { Media, LiveEmbed } from '../ProjectMedia.jsx'
import AppDemo from '../AppDemo.jsx'
import Page from '../Page.jsx'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Game Technology' },
  { id: 'software', label: 'Software & Web' },
  { id: 'ai', label: 'AI' },
]

export function ProjectCard({ p }) {
  const isAi = p.type === 'ai'
  const media = p.media && p.media[0]

  return (
    <article className={`project-card ${isAi ? 'ai' : 'game'}${p.featured ? ' featured' : ''}`}>
      {p.demo ? (
        <AppDemo kind={p.demo} title={p.name} />
      ) : media ? (
        <Media m={media} name={p.name} />
      ) : p.live && p.embed !== false ? (
        <LiveEmbed url={p.live} name={p.name} />
      ) : null}

      <div className="proj-body">
        {p.featured && <span className="featured-badge">★ Featured build</span>}
        <div className="proj-tagline-row">
          <span className={`type-tag ${isAi ? 'ai' : 'game'}`}>{p.category}</span>
          <span className="proj-year">{p.year}</span>
        </div>
        <h2 className="proj-name">
          <Link to={`/projects/${p.slug}`}>{p.name}</Link>
        </h2>
        <p className="proj-role">{p.role}</p>
        <p className="proj-summary">{p.summary}</p>

        {p.metric && (
          <p className="proj-metric">
            <strong>{p.metric.value}</strong>
            <span>{p.metric.label}</span>
          </p>
        )}

        {p.tech && p.tech.length > 0 && (
          <>
            <span className="pill-label">Built with</span>
            <ul className="proj-tech">
              {p.tech.map((t) => (
                <li key={t} className="pill">{t}</li>
              ))}
            </ul>
          </>
        )}

        <div className="proj-links">
          <Link className="proj-link primary" to={`/projects/${p.slug}`}>
            Case study <span aria-hidden="true">→</span>
            <span className="sr-only"> for {p.name}</span>
          </Link>
          {p.live && (
            <a className="proj-link" href={p.live} target="_blank" rel="noreferrer">
              Live Demo <span aria-hidden="true">↗</span>
              <span className="sr-only"> of {p.name}</span>
            </a>
          )}
          {p.repo && (
            <a className="proj-link" href={p.repo} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only"> repository for {p.name}</span>
            </a>
          )}
          {!p.repo && p.accessNote && <span className="proj-access">{p.accessNote}</span>}
        </div>
      </div>
    </article>
  )
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all')
  const list = projects.filter(
    (p) => filter === 'all' || (p.filters || []).includes(filter),
  )

  return (
    <Page>
      <section className="section projects">
        <div className="section-head reveal">
          <span className="kicker">projects</span>
          <h1 className="section-title">Systems I built</h1>
          <p className="section-sub">
            Gameplay systems in Unreal Engine and Unity, and full-stack products people log into
            every day. Web apps are embedded live, games have gameplay capture, and every project
            opens into a case study.
          </p>
          <div className="filters" role="tablist" aria-label="Filter projects by discipline">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={filter === f.id ? 'on' : ''}
                onClick={() => setFilter(f.id)}
                role="tab"
                aria-selected={filter === f.id}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="project-grid">
          {list.map((p) => (
            <ProjectCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </Page>
  )
}
