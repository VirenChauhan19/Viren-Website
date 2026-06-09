import { skills } from '../data/content.js'
import { useSpotlight } from './fx.js'

// Front-end and engineering lead; games are where the systems thinking started.
const BRANCHES = [
  { id: 'tools', label: 'Front-End & Engineering', accent: 'cyan', desc: 'React, UI/UX, C# / engine scripting, Flutter, Firebase, Git.' },
  { id: 'ai', label: 'Applied AI', accent: 'violet', desc: 'Retrieval, document parsing, API glue, deployed tools.' },
  { id: 'game', label: 'Game Development', accent: 'amber', desc: 'Gameplay, physics, enemy AI, level design.' },
  { id: 'soft', label: 'Leadership & Field', accent: 'green', desc: 'Field leadership, ops, communication, crisis management.' },
]

function Dots({ level }) {
  return (
    <span className="dots" aria-label={`${level} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`dot ${n <= level ? 'on' : ''}`} />
      ))}
    </span>
  )
}

function Branch({ b }) {
  const s = useSpotlight()
  const nodes = skills.filter((n) => n.branch === b.id)
  return (
    <div className={`skill-branch a-${b.accent} reveal`} ref={s.ref} onMouseMove={s.onMouseMove}>
      <div className="branch-head">
        <span className="branch-bar" />
        <div>
          <h3>{b.label}</h3>
          <span className="branch-desc">{b.desc}</span>
        </div>
      </div>
      <ul className="skill-list">
        {nodes.map((n) => (
          <li key={n.id} className="skill-node">
            <div className="skill-top">
              <span className="skill-name">{n.name}</span>
              <Dots level={n.level} />
            </div>
            <p className="skill-desc">{n.desc}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Skills() {
  return (
    <section id="skills" className="section skills">
      <div className="section-head reveal">
        <span className="kicker">02 / skills</span>
        <h2 className="section-title">What I work with</h2>
        <p className="section-sub">
          Front-end and engineering are my core. Games are where I learned to think in systems, and they still teach me the most.
        </p>
      </div>

      <div className="skills-grid">
        {BRANCHES.map((b) => (
          <Branch key={b.id} b={b} />
        ))}
      </div>
    </section>
  )
}
