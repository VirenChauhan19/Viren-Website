import { Link } from 'react-router-dom'
import { projects } from '../../data/content.js'
import Hero from '../Hero.jsx'
import Page from '../Page.jsx'

const FEATURED = ['la-ultra-running-plans', 'scad-distance-team-hub', 'top-down-shooter']

function FeatCard({ p }) {
  return (
    <Link
      to={`/projects/${p.slug}`}
      className={`feat-card ${p.type === 'ai' ? 'ai' : 'game'}${p.featured ? ' is-featured' : ''} reveal`}
    >
      {p.featured && <span className="feat-flag">★ Featured</span>}
      <span className="feat-cat">{p.category || (p.type === 'ai' ? 'Web · UI/UX' : 'Game Dev')}</span>
      <h3>{p.name}</h3>
      <p>{p.summary}</p>
      <span className="feat-go">View details <span className="arr">→</span></span>
    </Link>
  )
}

export default function Home() {
  const feats = FEATURED.map((s) => projects.find((p) => p.slug === s)).filter(Boolean)
  return (
    <Page className="home">
      <Hero />

      <section className="section featured" id="featured">
        <div className="section-head reveal">
          <span className="kicker">selected work</span>
          <h2 className="section-title">A few things I built</h2>
        </div>
        <div className="feat-grid">
          {feats.map((p) => (
            <FeatCard key={p.slug} p={p} />
          ))}
        </div>
        <div className="swipe-hint" aria-hidden="true">swipe →</div>
        <div className="featured-cta reveal">
          <Link to="/projects" className="btn btn-primary">
            See all projects <span className="arr">→</span>
          </Link>
        </div>
      </section>
    </Page>
  )
}
