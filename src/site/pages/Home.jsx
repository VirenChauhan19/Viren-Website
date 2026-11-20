import { Link } from 'react-router-dom'
import { projects, profile } from '../../data/content.js'
import { asset } from '../asset.js'
import { trackPageView } from '../../analytics/tracker.js'
import Hero from '../Hero.jsx'
import Page from '../Page.jsx'
import { Media } from '../ProjectMedia.jsx'

const FEATURED = [
  { slug: 'screenmate', summary: 'A browser agent that researches missing details and helps fill forms while you review sensitive decisions.' },
  { slug: 'worldos', summary: 'Turn a room photo into an editable 3D design and preview it in your space with AR.' },
  { slug: 'send-that-package', summary: 'A two-player co-op game about sorting and delivering packages before time runs out.' },
]

function FeatCard({ p, summary }) {
  const media = p.media?.[0]
  const poster = media?.cardPoster || media?.poster

  return (
    <Link
      to={`/projects/${p.slug}`}
      className="feat-card"
      aria-label={`Case study for ${p.name}`}
    >
      {poster && (
        <img className="feat-cover" src={asset(poster)} alt="" loading="lazy" decoding="async" />
      )}
      <div className="feat-body">
        <span className="proj-category">{p.category}</span>
        <h3>{p.name}</h3>
        <p>{summary}</p>
        <div className="feat-bottom">
          {p.metric && (
            <div className="feat-metric">
              <strong>{p.metric.value}</strong> <span>{p.metric.label}</span>
            </div>
          )}
          <div className="feat-action" aria-hidden="true">
            <span className="action-link primary feat-go">Case study <span>→</span></span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const feats = FEATURED.map(({ slug, summary }) => ({
    p: projects.find((project) => project.slug === slug),
    summary,
  })).filter(({ p }) => p)
  const screenmate = projects.find((p) => p.slug === 'screenmate')
  const worldos = projects.find((p) => p.slug === 'worldos')

  return (
    <Page className="home">
      <Hero />

      <div className="section home-highlights">
        <section className="home-highlight screenmate-highlight" aria-labelledby="award-title">
          <p className="home-award-rank"><strong>3rd</strong> <span>globally</span></p>
          <div className="home-highlight-copy">
            <h2 id="award-title">{screenmate.name}</h2>
            <p className="home-highlight-meta">{screenmate.award.event}</p>
            <p className="home-highlight-description">
              A browser agent that researches missing details and helps complete forms while you review sensitive decisions.
            </p>
            <p className="home-award-context">{screenmate.award.organizer} · 687 submitted projects</p>
          </div>
          <div className="home-highlight-actions">
            <Link className="action-link primary" to="/projects/screenmate">
              Explore ScreenMate <span aria-hidden="true">→</span>
            </Link>
            <a className="action-link" href={screenmate.award.url} target="_blank" rel="noreferrer">
              Winner announcement <span aria-hidden="true">↗</span>
            </a>
          </div>
        </section>

        <section className="home-highlight worldos-highlight" aria-labelledby="worldos-title">
          <div className="home-highlight-copy">
            <p className="home-highlight-meta">Meta AI Hackathon</p>
            <h2 id="worldos-title">{worldos.name}</h2>
            <p className="home-highlight-description">
              Start with a room photo and a design goal. Refine the layout in a 3D studio and preview it in your space with AR on supported devices.
            </p>
            <p className="worldos-catalog"><strong>{worldos.metric.value}</strong> {worldos.metric.label}</p>
            <Link className="action-link primary" to="/projects/worldos">
              Explore WorldOS <span aria-hidden="true">→</span>
            </Link>
          </div>
          <figure className="worldos-film">
            <Media m={worldos.media[0]} name={worldos.name} />
            <figcaption>One-minute demo with recorded AI examples and iPhone footage.</figcaption>
          </figure>
        </section>
      </div>

      <section className="section featured" id="featured" aria-labelledby="featured-h">
        <div className="section-head reveal">
          <h2 className="section-title" id="featured-h">Things I’ve built</h2>
        </div>
        <div className="feat-grid">
          {feats.map(({ p, summary }) => (
            <FeatCard key={p.slug} p={p} summary={summary} />
          ))}
        </div>
        <div className="featured-cta reveal">
          <Link to="/projects" className="action-link primary">
            View all projects <span aria-hidden="true">→</span>
          </Link>
          <a
            className="action-link secondary"
            href={asset(profile.resume)}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackPageView('/resume')}
          >
            Resume <span aria-hidden="true">↗</span>
            <span className="sr-only">(opens PDF in a new tab)</span>
          </a>
          <Link to="/contact" className="action-link">Get in touch</Link>
        </div>
      </section>
    </Page>
  )
}
