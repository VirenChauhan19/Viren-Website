import { profile, education } from '../data/content.js'
import { useTilt } from './fx.js'

const FOCUS = [
  { k: 'fe', tag: 'Front-End & UI/UX', accent: 'cyan', desc: 'React apps, design systems, and responsive, accessible interfaces. I sweat the UX and the small details.' },
  { k: 'swe', tag: 'Software Engineering', accent: 'violet', desc: 'Component architecture, state, APIs, auth, and getting things deployed. Plus smart features when a project needs them.' },
  { k: 'game', tag: 'Game Development', accent: 'amber', desc: 'Gameplay programming, 2D and 3D physics, enemy AI, and real-time 3D scenes.' },
]

function FocusCard({ f }) {
  const t = useTilt(7)
  return (
    <div
      className={`focus-card a-${f.accent}`}
      ref={t.ref}
      onMouseMove={t.onMouseMove}
      onMouseLeave={t.onMouseLeave}
    >
      <span className="focus-tag">{f.tag}</span>
      <p>{f.desc}</p>
    </div>
  )
}

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="section-head reveal">
        <span className="kicker">01 / about</span>
        <h2 className="section-title">
          I build the <span className="hl-cyan">whole thing</span>, not just one piece.
        </h2>
      </div>

      <div className="about-grid">
        <div className="about-copy reveal">
          {profile.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <div className="about-edu">
            {education.map((e, i) => (
              <div className="edu-row" key={i}>
                <span className="edu-k">EDU</span>
                <div>
                  <strong>{e.degree}</strong>
                  <span>{e.school} · {e.location}</span>
                  {e.detail && <small>{e.detail}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="focus-stack reveal">
          {FOCUS.map((f) => (
            <FocusCard key={f.k} f={f} />
          ))}
        </div>
      </div>
    </section>
  )
}
