import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { profile, education } from '../data/content.js'
import { asset } from './asset.js'
import { useMagnetic } from './fx.js'
import './navigation-polish.css'
import { trackPageView } from '../analytics/tracker.js'

const FOCUSES = ['Software Development', 'Game Development', 'Applied AI']

// The 10-second read: name, what I am, what I build with, and every link a
// recruiter needs, without scrolling.
export default function Hero() {
  const github = profile.links.find((l) => l.label === 'GitHub')?.url
  const linkedin = profile.links.find((l) => l.label === 'LinkedIn')?.url
  const edu = education[0]
  const [focusText, setFocusText] = useState('')
  useEffect(() => {
    let word = 0
    let count = 0
    let deleting = false
    let timer
    const tick = () => {
      count += deleting ? -1 : 1
      setFocusText(FOCUSES[word].slice(0, count))
      let delay = deleting ? 35 : 75
      if (!deleting && count === FOCUSES[word].length) {
        deleting = true
        delay = 1800
      } else if (deleting && count === 0) {
        deleting = false
        word = (word + 1) % FOCUSES.length
        delay = 350
      }
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [])
  const cta1 = useMagnetic()
  const cta2 = useMagnetic()

  return (
    <section id="home" className="hero">
      <div className="hero-inner">
        <div className="hero-main reveal">
          <h1 className="hero-name">Viren Chauhan</h1>

          <p className="hero-role">
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
              <dt>Focus</dt>
              <dd className="spec-focus spec-focus-rotating">
                <span className="sr-only">Software Development, Game Development, and Applied AI</span>
                <span className="focus-window" aria-hidden="true"><span>{focusText}<i className="focus-cursor" /></span></span>
              </dd>
            </div>
            <div className="spec-row">
              <dt>Degree</dt>
              <dd>{edu?.degree}</dd>
            </div>
            <div className="spec-row">
              <dt>Minor</dt>
              <dd>Applied AI</dd>
            </div>
            {edu?.grad && (
              <div className="spec-row">
                <dt>Graduation</dt>
                <dd>{edu.grad}</dd>
              </div>
            )}
            <div className="spec-row">
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  )
}
