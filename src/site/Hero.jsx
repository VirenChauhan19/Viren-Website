import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { profile, education } from '../data/content.js'
import { asset } from './asset.js'
import { useTypewriter, useMagnetic } from './fx.js'
import { trackPageView } from '../analytics/tracker.js'

// One dual-track identity, rotating flavors — recruiters should never wonder what I am.
const FLAVORS = ['front-end & UI/UX', 'full products, shipped', 'gameplay & real-time 3D', 'applied AI features']

export default function Hero() {
  const github = profile.links.find((l) => l.label === 'GitHub')?.url
  const linkedin = profile.links.find((l) => l.label === 'LinkedIn')?.url
  const grad = education[0]?.grad
  const typed = useTypewriter(FLAVORS)
  const cta1 = useMagnetic()
  const cta2 = useMagnetic()
  const cta3 = useMagnetic()
  const heroRef = useRef(null)

  const onParallax = (e) => {
    const el = heroRef.current
    if (!el) return
    el.style.setProperty('--px', (e.clientX / window.innerWidth - 0.5).toFixed(3))
    el.style.setProperty('--py', (e.clientY / window.innerHeight - 0.5).toFixed(3))
  }

  const scrollDown = () => {
    const el = document.getElementById('featured')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="hero" ref={heroRef} onMouseMove={onParallax}>
      <div className="hero-inner">
        <div className="hero-main reveal">
          <div className="status-chip">
            <span className="pulse-dot" />
            <span className="chip-role">{profile.seeking}</span>
            <span className="chip-sep">·</span>
            <span className="chip-muted">{profile.location}</span>
          </div>

          <h1 className="hero-name">Viren Chauhan</h1>

          <div className="hero-role" aria-label="Software and Game Developer — front-end and UI/UX, full products, gameplay and real-time 3D, applied AI">
            <span className="role-prefix">&gt;</span>
            <span className="role-text">
              Software &amp; Game Developer<span className="role-flavor"><span className="role-sep">·</span>{typed}<span className="type-caret" /></span>
            </span>
          </div>

          <p className="hero-tagline">{profile.tagline}</p>

          <div className="hero-cta">
            <Link className="btn btn-primary" to="/projects" ref={cta1.ref} onMouseMove={cta1.onMouseMove} onMouseLeave={cta1.onMouseLeave}>
              See my work <span className="arr">→</span>
            </Link>
            <a
              className="btn btn-ghost"
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              ref={cta3.ref}
              onMouseMove={cta3.onMouseMove}
              onMouseLeave={cta3.onMouseLeave}
              onClick={() => trackPageView('/resume')}
            >
              Resume ↗
            </a>
            <Link className="btn btn-ghost" to="/contact" ref={cta2.ref} onMouseMove={cta2.onMouseMove} onMouseLeave={cta2.onMouseLeave}>
              Get in touch
            </Link>
          </div>

          <div className="hero-links">
            {github && (
              <a href={github} target="_blank" rel="noreferrer">GitHub ↗</a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
            )}
            <a href={`mailto:${profile.email}`}>Email ↗</a>
          </div>
        </div>

        <aside className="hero-side reveal">
          <div className="portrait">
            <img
              src={asset(profile.photo)}
              alt="Viren Chauhan"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
            <span className="portrait-fallback">VC</span>
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            <span className="portrait-scan" />
          </div>
          <div className="spec-panel">
            <div className="spec-row"><span>focus</span><strong>Front-End · UI/UX · Games</strong></div>
            <div className="spec-row"><span>studying</span><strong>B.F.A. Game Dev · SCAD</strong></div>
            {grad && <div className="spec-row"><span>graduating</span><strong>{grad} (expected)</strong></div>}
            <div className="spec-row"><span>status</span><strong className="ok">Open to Summer 2027 internships</strong></div>
          </div>
        </aside>
      </div>

      <button className="scroll-cue" onClick={scrollDown} aria-label="Scroll down">
        <span className="scroll-label">scroll</span>
        <span className="scroll-line" />
      </button>
    </section>
  )
}
