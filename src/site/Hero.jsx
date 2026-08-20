import { Link } from 'react-router-dom'
import { profile, education } from '../data/content.js'
import { asset } from './asset.js'
import { useTypewriter, useMagnetic } from './fx.js'
import { trackPageView } from '../analytics/tracker.js'

// The 10-second read: name, what I am, what I build with, and every link a
// recruiter needs, without scrolling.
export default function Hero() {
  const github = profile.links.find((l) => l.label === 'GitHub')?.url
  const linkedin = profile.links.find((l) => l.label === 'LinkedIn')?.url
  const edu = education[0]
  const typed = useTypewriter(profile.typed)
  const cta1 = useMagnetic()
  const cta2 = useMagnetic()

  return (
    <section id="home" className="hero">
      <div className="hero-inner">
        <div className="hero-main reveal">
          <h1 className="hero-name">Viren Chauhan</h1>

          <p className="hero-role">
            <span className="role-prefix" aria-hidden="true">&gt;</span>
            <span className="role-text">{profile.title}</span>
          </p>

          <p className="hero-subtitle">{profile.subtitle}</p>

          <ul className="hero-tags" aria-label="Core technologies">
            {profile.heroTags.map((t) => (
              <li key={t} className="hero-tag">{t}</li>
            ))}
          </ul>

          <div className="hero-cta">
            <Link
              className="btn btn-primary"
              to="/projects"
              ref={cta1.ref}
              onMouseMove={cta1.onMouseMove}
              onMouseLeave={cta1.onMouseLeave}
            >
              View Projects <span className="arr" aria-hidden="true">→</span>
            </Link>
            <a
              className="btn btn-ghost"
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              ref={cta2.ref}
              onMouseMove={cta2.onMouseMove}
              onMouseLeave={cta2.onMouseLeave}
              onClick={() => trackPageView('/resume')}
            >
              Resume <span aria-hidden="true">↗</span>
              <span className="sr-only">(opens PDF in a new tab)</span>
            </a>
            {github && (
              <a className="btn btn-ghost" href={github} target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
            )}
            {linkedin && (
              <a className="btn btn-ghost" href={linkedin} target="_blank" rel="noreferrer">
                LinkedIn <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>

          <p className="hero-status">
            <span className="status-dot" aria-hidden="true" />
            <span>{profile.seeking}</span>
          </p>
        </div>

        <aside className="hero-side reveal">
          <div className="portrait">
            <img
              src={asset(profile.photo)}
              alt="Viren Chauhan"
              width="340"
              height="340"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span className="portrait-fallback" aria-hidden="true">VC</span>
            <span className="corner tl" aria-hidden="true" />
            <span className="corner tr" aria-hidden="true" />
            <span className="corner bl" aria-hidden="true" />
            <span className="corner br" aria-hidden="true" />
            <span className="portrait-scan" aria-hidden="true" />
          </div>
          <dl className="spec-panel">
            <div className="spec-row">
              <dt>building</dt>
              <dd className="spec-typed">
                {typed}
                <span className="type-caret" aria-hidden="true" />
              </dd>
            </div>
            <div className="spec-row">
              <dt>studying</dt>
              <dd>{edu?.degree}</dd>
            </div>
            <div className="spec-row">
              <dt>minor</dt>
              <dd>Applied AI</dd>
            </div>
            {edu?.grad && (
              <div className="spec-row">
                <dt>graduating</dt>
                <dd>{edu.grad}</dd>
              </div>
            )}
            <div className="spec-row">
              <dt>based in</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  )
}
