import { skillGroups } from '../data/content.js'

// Clean badges, grouped by category. Deliberately no proficiency bars or
// percentages: every item here is something used in a shipped project,
// a public repo, or coursework listed on the resume.
export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-h">
      <div className="section-head reveal">
        <span className="kicker">technical skills</span>
        <h2 className="section-title" id="skills-h">What I work with</h2>
        <p className="section-sub">
          Grouped by what it is for, not ranked by a made-up percentage.
        </p>
      </div>

      <div className="skill-groups">
        {skillGroups.map((g) => (
          <div className="skill-group reveal" key={g.id}>
            <div className="skill-group-head">
              <h3>{g.label}</h3>
              <p>{g.note}</p>
            </div>
            <ul className="skill-badges">
              {g.items.map((it) => (
                <li key={it} className="badge">{it}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
