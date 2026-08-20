import { useParams, Link, Navigate } from 'react-router-dom'
import { projects } from '../../data/content.js'
import { Media, LiveEmbed } from '../ProjectMedia.jsx'
import AppDemo from '../AppDemo.jsx'
import ArchDiagram from '../ArchDiagram.jsx'
import Page from '../Page.jsx'

function Block({ title, children }) {
  if (!children) return null
  return (
    <section className="case-block reveal">
      <h2 className="case-h">{title}</h2>
      {children}
    </section>
  )
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const idx = projects.findIndex((p) => p.slug === slug)

  // Old links (/projects/the-collision) still resolve: redirect to the new slug.
  if (idx < 0) {
    const renamed = projects.find((p) => (p.aliases || []).includes(slug))
    if (renamed) return <Navigate to={`/projects/${renamed.slug}`} replace />
  }

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
  const cs = p.study || {}

  return (
    <Page className={`detail ${isAi ? 'ai' : 'game'}`}>
      <article className="section detail-section">
        <Link to="/projects" className="back-link reveal">← All projects</Link>

        <div className="detail-head reveal">
          <span className={`type-tag ${isAi ? 'ai' : 'game'}`}>{p.category}</span>
          <span className="proj-year">{p.year}</span>
        </div>
        <h1 className="detail-title reveal">{p.name}</h1>
        <p className="detail-role reveal">{p.role}</p>

        <div className="detail-cta-top reveal">
          {p.live && (
            <a className="btn btn-primary" href={p.live} target="_blank" rel="noreferrer">
              Live Demo <span aria-hidden="true">↗</span>
            </a>
          )}
          {p.repo && (
            <a className="btn btn-ghost" href={p.repo} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          )}
          {!p.repo && p.accessNote && <span className="proj-access">{p.accessNote}</span>}
          {p.metric && (
            <span className="detail-metric">
              <strong>{p.metric.value}</strong> {p.metric.label}
            </span>
          )}
        </div>

        {(p.demo || media || (p.live && p.embed !== false)) && (
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
          <div className="case-body">
            <p className="detail-summary reveal">{p.summary}</p>

            <Block title="Overview">
              {cs.overview && <p>{cs.overview}</p>}
            </Block>

            <Block title="Problem">
              {cs.problem && <p>{cs.problem}</p>}
            </Block>

            <Block title="What I Built">
              {cs.built && cs.built.length > 0 && (
                <ul className="case-list">
                  {cs.built.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </Block>

            {cs.architecture && (
              <Block title="Architecture">
                <ArchDiagram arch={cs.architecture} />
              </Block>
            )}

            {cs.challenges && cs.challenges.length > 0 && (
              <Block title="Technical Challenges & Solutions">
                <ul className="case-challenges">
                  {cs.challenges.map((c, i) => (
                    <li key={i}>
                      <h3>{c.t}</h3>
                      <p className="ch-p"><span className="ch-k">Problem</span>{c.p}</p>
                      <p className="ch-s"><span className="ch-k">Solution</span>{c.s}</p>
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <Block title="Result">
              {cs.result && cs.result.length > 0 && (
                <ul className="case-list checks">
                  {cs.result.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </Block>
          </div>

          <aside className="detail-side reveal" aria-label="Project details">
            {p.systems && p.systems.length > 0 && (
              <div className="detail-block">
                <h2 className="side-h">Systems built</h2>
                <ul className="sys-grid">
                  {p.systems.map((s) => (
                    <li key={s} className="sys">{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {p.disciplines && p.disciplines.length > 0 && (
              <div className="detail-block">
                <h2 className="side-h">What I did</h2>
                <ul className="proj-disciplines">
                  {p.disciplines.map((d) => (
                    <li key={d} className="disc">{d}</li>
                  ))}
                </ul>
              </div>
            )}

            {p.tech && p.tech.length > 0 && (
              <div className="detail-block">
                <h2 className="side-h">Technologies</h2>
                <ul className="proj-tech">
                  {p.tech.map((t) => (
                    <li key={t} className="pill">{t}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="detail-cta">
              {p.live && (
                <a className="btn btn-primary" href={p.live} target="_blank" rel="noreferrer">
                  Live Demo <span aria-hidden="true">↗</span>
                </a>
              )}
              {p.repo && (
                <a className="btn btn-ghost" href={p.repo} target="_blank" rel="noreferrer">
                  GitHub <span aria-hidden="true">↗</span>
                </a>
              )}
              {!p.repo && p.accessNote && <span className="proj-access">{p.accessNote}</span>}
            </div>
          </aside>
        </div>

        <Link to={`/projects/${next.slug}`} className="next-proj reveal">
          <span>Next project</span>
          <strong>{next.name} →</strong>
        </Link>
      </article>
    </Page>
  )
}
