import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../../data/content.js'
import { useSpotlight } from '../fx.js'
import { Media, LiveEmbed } from '../ProjectMedia.jsx'
import Page from '../Page.jsx'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'Web & UI/UX' },
  { id: 'game', label: 'Games' },
]

function ProjectCard({ p }) {
  const isAi = p.type === 'ai'
  const media = p.media && p.media[0]
  const spot = useSpotlight()

  return (
    <article
      className={`project-card ${isAi ? 'ai' : 'game'}`}
      ref={spot.ref}
      onMouseMove={spot.onMouseMove}
    >
      {media ? (
        <Media m={media} name={p.name} />
      ) : p.live ? (
        <LiveEmbed url={p.live} name={p.name} />
      ) : null}

      <div className="proj-body">
        <div className="proj-tagline-row">
          <span className={`type-tag ${isAi ? 'ai' : 'game'}`}>{p.category || (isAi ? 'Web · UI/UX' : 'Game Dev')}</span>
          <span className="proj-year">{p.year}</span>
        </div>
        <h3 className="proj-name">{p.name}</h3>
        <p className="proj-role">{p.role}</p>
        <p className="proj-summary">{p.summary}</p>

        {p.disciplines && p.disciplines.length > 0 && (
          <div className="proj-disciplines">
            {p.disciplines.map((d) => (
              <span key={d} className="disc">{d}</span>
            ))}
          </div>
        )}

        <div className="proj-links">
          <Link className="proj-link primary" to={`/projects/${p.slug}`}>
            View details →
          </Link>
          {p.live && (
            <a className="proj-link" href={p.live} target="_blank" rel="noreferrer">
              Live ↗
            </a>
          )}
          {p.repo && (
            <a className="proj-link" href={p.repo} target="_blank" rel="noreferrer">
              Code ↗
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function ProjectsPage() {
  const [filter, setFilter] = useState('all')
  const list = projects.filter((p) => filter === 'all' || p.type === filter)

  return (
    <Page>
      <section className="section projects">
        <div className="section-head reveal">
          <span className="kicker">projects</span>
          <h2 className="section-title">Things I built</h2>
          <p className="section-sub">
            I designed and built every one of these myself. The web apps are embedded live and the
            games have gameplay clips, so try them right here. Open any project for the full write-up.
          </p>
          <div className="filters" role="tablist" aria-label="Filter projects">
            {FILTERS.map((f) => (
              <button
                key={f.id}
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
