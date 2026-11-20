import { useState } from 'react'
import { Link } from 'react-router-dom'
import { projects } from '../../data/content.js'
import { Media, LiveEmbed } from '../ProjectMedia.jsx'
import AppDemo from '../AppDemo.jsx'
import AtlantaIdentity from '../AtlantaIdentity.jsx'
import Page from '../Page.jsx'
import { asset } from '../asset.js'
import '../projects.css'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Game Development' },
  { id: 'software', label: 'Software & Web' },
  { id: 'design', label: 'UX & Design' },
]

function ProjectPreview({ p }) {
  const [playing, setPlaying] = useState(false)
  const media = p.media?.[0]

  if (p.slug === 'atlanta-united') return <AtlantaIdentity />
  if (p.demo) return <AppDemo kind={p.demo} title={p.name} />

  if (media?.type === 'youtube' && media.cardPoster && !playing) {
    return (
      <button type="button" className="project-preview-play" aria-label={`Play ${p.name} demo`} onClick={() => setPlaying(true)}>
        <img src={asset(media.cardPoster)} alt="" width="1280" height="720" />
        <span aria-hidden="true">▶</span>
      </button>
    )
  }

  if (media) return <Media m={media} name={p.name} autoPlay={playing} />
  if (p.live && p.embed !== false) return <LiveEmbed url={p.live} name={p.name} />
  return null
}

export function ProjectCard({ p }) {
  const hasPreview = p.slug === 'atlanta-united' || p.demo || p.media?.length || (p.live && p.embed !== false)

  return (
    <article className={`project-card${p.award ? ' project-spotlight' : ''}`}>
      {Boolean(hasPreview) && <div className="project-preview"><ProjectPreview p={p} /></div>}

      <div className="proj-body">
        <div className="proj-tagline-row">
          <span className="proj-category">{p.category}</span>
          <span className="proj-year">{p.year}</span>
        </div>
        <h2 className="proj-name">
          <Link to={`/projects/${p.slug}`}>{p.name}</Link>
        </h2>
        <p className="proj-role">{p.role}</p>
        <p className="proj-summary">{p.cardSummary || p.summary}</p>

        {p.metric && (
          <p className="proj-metric">
            <strong>{p.metric.value}</strong>
            <span>{p.metric.label}</span>
          </p>
        )}
        {p.award && (
          <a className="project-award-link" href={p.award.url} target="_blank" rel="noreferrer">
            {p.award.organizer} · Winner announcement <span aria-hidden="true">↗</span>
          </a>
        )}

        {p.tech?.length > 0 && (
          <ul className="project-stack" aria-label="Key technologies" role="list">
            {p.tech.slice(0, 4).map((technology) => <li key={technology}>{technology}</li>)}
          </ul>
        )}

        {!p.repo && p.accessNote && <p className="project-access-note">{p.accessNote}</p>}

        <div className="proj-links">
          <Link className="action-link primary" to={`/projects/${p.slug}`}>
            Case study <span aria-hidden="true">→</span>
            <span className="sr-only"> for {p.name}</span>
          </Link>
          {p.video && (
            <a className="action-link" href={asset(p.video)} target="_blank" rel="noreferrer">
              Watch demo <span aria-hidden="true">↗</span>
            </a>
          )}
          {p.live && (
            <a className="action-link" href={p.live} target="_blank" rel="noreferrer">
              Live Demo <span aria-hidden="true">↗</span>
              <span className="sr-only"> of {p.name}</span>
            </a>
          )}
          {p.repo && (
            <a className="action-link" href={p.repo} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
              <span className="sr-only"> repository for {p.name}</span>
            </a>
          )}
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
    <Page className="projects-page">
      <section className="section projects">
        <header className="projects-header">
          <h1>Projects</h1>
          <p>Gameplay systems in Unreal Engine and Unity, full-stack software, and UX design.</p>
        </header>
        <div className="projects-toolbar">
          <div className="project-filters" role="group" aria-label="Filter projects by discipline">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                aria-controls="project-results"
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="project-count" role="status">{list.length} {list.length === 1 ? 'project' : 'projects'}</p>
        </div>

        <div id="project-results" className="project-grid">
          {list.map((p) => (
            <ProjectCard key={p.slug} p={p} />
          ))}
        </div>
      </section>
    </Page>
  )
}
