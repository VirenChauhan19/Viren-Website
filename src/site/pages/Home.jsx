import { Link } from 'react-router-dom'
import { projects, profile } from '../../data/content.js'
import { asset } from '../asset.js'
import { trackPageView } from '../../analytics/tracker.js'
import Hero from '../Hero.jsx'
import Page from '../Page.jsx'

// Game technology first, then the shipped product with real users, then the
// systems-heavy Unity build. Same order a recruiter should read them in.
const FEATURED = ['dynamic-weather-system', 'la-ultra-running-plans', 'starwave']

function FeatCard({ p }) {
  return (
    <Link
      to={`/projects/${p.slug}`}
      className={`feat-card ${p.type === 'ai' ? 'ai' : 'game'}${p.featured ? ' is-featured' : ''} reveal`}
    >
      {p.featured && <span className="feat-flag">★ Featured</span>}
      <span className="feat-cat">{p.category}</span>
      <h3>{p.name}</h3>
      <p>{p.summary}</p>
      {p.metric && (
        <span className="feat-metric">
          <strong>{p.metric.value}</strong> {p.metric.label}
        </span>
      )}
      <span className="feat-go">Case study <span className="arr" aria-hidden="true">→</span></span>
    </Link>
  )
}

export default function Home() {
  const feats = FEATURED.map((s) => projects.find((p) => p.slug === s)).filter(Boolean)

  return (
    <Page className="home">
      <Hero />

      <section className="section featured" id="featured" aria-labelledby="featured-h">
        <div className="section-head reveal">
          <span className="kicker">selected work</span>
          <h2 className="section-title" id="featured-h">Systems I built</h2>
        </div>
        <div className="feat-grid">
          {feats.map((p) => (
            <FeatCard key={p.slug} p={p} />
          ))}
        </div>
        <div className="swipe-hint" aria-hidden="true">swipe →</div>
        <div className="featured-cta reveal">
          <Link to="/projects" className="btn btn-primary">
            View all projects <span className="arr" aria-hidden="true">→</span>
          </Link>
          <a
            className="btn btn-ghost"
            href={asset(profile.resume)}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackPageView('/resume')}
          >
            Resume <span aria-hidden="true">↗</span>
          </a>
          <Link to="/contact" className="btn btn-ghost">Get in touch</Link>
        </div>
      </section>
    </Page>
  )
}
