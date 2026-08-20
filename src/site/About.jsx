import { profile, education } from '../data/content.js'
import { useTilt } from './fx.js'

const FOCUS = [
  {
    k: 'game',
    tag: 'Game Technology',
    desc: 'Gameplay systems, VFX integration, and profiling in Unreal Engine 5 and Unity, written in Blueprints and C#.',
  },
  {
    k: 'swe',
    tag: 'Software Development',
    desc: 'Full-stack products: data models, auth and role permissions, APIs, front end, and the deploy that puts them in front of real users.',
  },
  {
    k: 'ai',
    tag: 'Applied AI',
    desc: 'LLM features behind server-side proxies, document parsing, and grounded assistants that answer from real source material.',
  },
]

function FocusCard({ f }) {
  const t = useTilt(7)
  return (
    <li
      className="focus-card"
      ref={t.ref}
      onMouseMove={t.onMouseMove}
      onMouseLeave={t.onMouseLeave}
    >
      <span className="focus-tag">{f.tag}</span>
      <p>{f.desc}</p>
    </li>
  )
}

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="section-head reveal">
        <span className="kicker">about</span>
        <h1 className="section-title">
          I build <span className="hl-cyan">systems</span>, not screenshots.
        </h1>
      </div>

      <div className="about-grid">
        <div className="about-copy reveal">
          {profile.about.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <div className="about-edu">
            {education.map((e) => (
              <div className="edu-row" key={e.school}>
                <span className="edu-k" aria-hidden="true">EDU</span>
                <div>
                  <strong>{e.school}</strong>
                  <span>{e.degree}</span>
                  {e.minor && <span className="edu-minor">{e.minor}</span>}
                  {e.grad && <span className="edu-grad">Expected graduation {e.grad}</span>}
                  {e.detail && <small>{e.detail}</small>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <ul className="focus-stack reveal">
          {FOCUS.map((f) => (
            <FocusCard key={f.k} f={f} />
          ))}
        </ul>
      </div>

      <div className="ai-note reveal">
        <span className="kicker">ai-assisted development</span>
        <p>{profile.aiAssisted}</p>
      </div>
    </section>
  )
}
