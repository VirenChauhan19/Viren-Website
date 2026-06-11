import { useParams, Link } from 'react-router-dom'
import { projects } from '../../data/content.js'
import { Media, LiveEmbed } from '../ProjectMedia.jsx'
import AppDemo from '../AppDemo.jsx'
import Page from '../Page.jsx'

export default function ProjectDetail() {
  const { slug } = useParams()
  const idx = projects.findIndex((p) => p.slug === slug)
  const p = projects[idx]

  if (!p) {
    return (
      <Page>
        <section className="section detail-section">
          <Link to="/projects" className="back-link">← All projects</Link>
          <h1 className="detail-title">Project not found</h1>
          <p className="section-sub">That project does not exist. Head back to the list.</p>
        </section>
      </Page>
    )
  }

  const isAi = p.type === 'ai'
  const media = p.media && p.media[0]
  const next = projects[(idx + 1) % projects.length]

  return (
    <Page className={`detail ${isAi ? 'ai' : 'game'}`}>
      <section className="section detail-section">
        <Link to="/projects" className="back-link reveal">← All projects</Link>

        <div className="detail-head reveal">
          <span className={`type-tag ${isAi ? 'ai' : 'game'}`}>{p.category || (isAi ? 'Web · UI/UX' : 'Game Dev')}</span>
          <span className="proj-year">{p.year}</span>
        </div>
        <h1 className="detail-title reveal">{p.name}</h1>
        <p className="detail-role reveal">{p.role}</p>

        {(p.demo || media || p.live) && (
          <div className="detail-media reveal">
            {p.demo ? (
              <AppDemo kind={p.demo} title={p.name} />
            ) : media ? (
              <Media m={media} name={p.name} />
            ) : (
              <LiveEmbed url={p.live} name={p.name} />
            )}
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-body reveal">
            <p className="detail-summary">{p.summary}</p>
            {(p.description || []).map((d, i) => (
              <p key={i}>{d}</p>
            ))}
          </div>

          <aside className="detail-side reveal">
            {p.disciplines && p.disciplines.length > 0 && (
              <div className="detail-block">
                <h4>What I did</h4>
                <div className="proj-disciplines">
                  {p.disciplines.map((d) => (
                    <span key={d} className="disc">{d}</span>
                  ))}
                </div>
              </div>
            )}

            {p.highlights && p.highlights.length > 0 && (
              <div className="detail-block">
                <h4>Highlights</h4>
                <ul className="proj-highlights">
                  {p.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {p.tech && p.tech.length > 0 && (
              <div className="detail-block">
                <h4>Built with</h4>
                <div className="proj-tech">
                  {p.tech.map((t) => (
                    <span key={t} className="pill">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {(p.live || p.repo) && (
              <div className="detail-cta">
                {p.live && (
                  <a className="btn btn-primary" href={p.live} target="_blank" rel="noreferrer">
                    Launch live ↗
                  </a>
                )}
                {p.repo && (
                  <a className="btn btn-ghost" href={p.repo} target="_blank" rel="noreferrer">
                    View code ↗
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        <Link to={`/projects/${next.slug}`} className="next-proj reveal">
          <span>Next project</span>
          <strong>{next.name} →</strong>
        </Link>
      </section>
    </Page>
  )
}
