import { experience } from '../data/content.js'
import { youtubeWatchUrl } from './asset.js'
import { asset } from './asset.js'
import { profile, academicHonors } from '../data/content.js'
import './experience.css'
import { Link } from 'react-router-dom'

const GROUPS = [
  { id: 'tech', label: 'Software & design', desc: 'Building products, shaping experiences, and shipping ideas.' },
  { id: 'ops', label: 'Leadership & beyond', desc: 'On campus, at major events, and in the mountains.' },
]

function ExperienceItem({ exp, expanded, index }) {
  const current = /present/i.test(exp.dates || '')
  const reels = (exp.media || []).filter((m) => m.type === 'youtube')
  return (
    <li className={`career-entry${exp.role.includes('SCADpro') ? ' career-atlanta' : ''}`}>
      <div className="career-period">
        <span>{exp.dates}</span>
        <span className="career-entry-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        {current && <span className="career-current"><i aria-hidden="true" />Current</span>}
      </div>
      <details className="career-role" open={expanded || undefined}>
        <summary>
          <div className="career-heading">
            <span className="career-org">{exp.org}</span>
            <h3>{exp.role}</h3>
            {exp.location && <span className="career-location">{exp.location}</span>}
          </div>
          <span className="career-toggle" aria-hidden="true" />
        </summary>
        <div className="career-body">
          {exp.detail && <p>{exp.detail}</p>}
          {exp.bullets?.length > 0 && <ul>{exp.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
          {exp.role.includes('SCADpro') && <Link className="career-case-link" to="/projects/atlanta-united">Explore the collaboration <span aria-hidden="true">↗</span></Link>}
          {exp.org === 'Independent Projects' && <Link className="career-case-link" to="/projects">See the projects <span aria-hidden="true">↗</span></Link>}
          {reels.length > 0 && <div className="career-media">{reels.map((media) => (
            <a key={media.src} href={youtubeWatchUrl(media.src)} target="_blank" rel="noreferrer">
              {media.caption || 'Watch film'} <span aria-hidden="true">↗</span>
            </a>
          ))}</div>}
        </div>
      </details>
    </li>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="section experience career">
      <header className="career-intro">
        <div className="career-intro-top"><span className="kicker">Experience / Viren Chauhan</span><a className="career-resume" href={asset(profile.resume)} target="_blank" rel="noreferrer">View résumé <span aria-hidden="true">↗</span></a></div>
        <div className="career-hero-layout"><h1 className="section-title">Built through<br /><em>doing.</em></h1>
        <div className="career-hero-copy"><span className="career-overline">Code. Teams. Real responsibility.</span><p>From shipping software to leading race operations in the Himalayas. Every role has shaped how I build, collaborate, and follow through.</p><span className="career-homebase">Based in Atlanta · Shaped by the Himalayas</span></div></div>
        <div className="career-highlights" aria-label="Experience highlights">
          <Link to="/projects"><span className="career-highlight-label">01 / Build</span><strong>Ideas into software.</strong><p>Independent development, from interface to deployment.</p><span className="career-highlight-go">Explore my projects ↗</span></Link>
          <Link to="/projects/atlanta-united"><span className="career-highlight-label">02 / Collaborate</span><strong>Design with a team.</strong><p>UX/UI leadership with SCADpro × Atlanta United.</p><span className="career-highlight-go">View the collaboration ↗</span></Link>
          <a href="#career-ops"><span className="career-highlight-label">03 / Lead</span><strong>Show up when it counts.</strong><p>Campus leadership, global sport, and mountain race operations.</p><span className="career-highlight-go">Explore the experience ↓</span></a>
        </div>
        <nav className="career-index" aria-label="Experience sections">
          {GROUPS.map((group, index) => <a key={group.id} href={'#career-' + group.id}>
            <span>0{index + 1}</span>{group.label}<span aria-hidden="true">↓</span>
          </a>)}
        </nav>
      </header>
      <section className="career-honors" aria-labelledby="academic-honors-title">
        <header><span className="kicker">Academic recognition</span><h2 id="academic-honors-title">In the classroom.<br />On the course.</h2><p>Student-athlete, SCAD cross country & track.</p></header>
        <div className="career-honors-list">{academicHonors.map((honor) => <article key={honor.title}><span className="career-honor-season">{honor.season}</span><h3>{honor.title}</h3><p>{honor.sport}</p></article>)}</div>
      </section>
      {GROUPS.map((group, index) => (
        <section className="career-group" id={'career-' + group.id} key={group.id} aria-labelledby={'career-title-' + group.id}>
          <header className="career-group-head">
            <span className="career-number">0{index + 1}</span>
            <div><h2 id={'career-title-' + group.id}>{group.label}</h2><p>{group.desc}</p><span className="career-group-hint">Select a role to explore <span aria-hidden="true">↘</span></span></div>
          </header>
          <ol className="career-list">
            {experience.filter((exp) => (exp.group || 'ops') === group.id).map((exp, i) => (
              <ExperienceItem key={exp.role + exp.org} exp={exp} index={i} expanded={group.id === 'tech' || i === 0} />
            ))}
          </ol>
        </section>
      ))}
      <footer className="career-outro"><span className="kicker">The work continues</span><h2>See what I’m building.</h2><Link to="/projects" className="btn btn-primary">Explore projects <span aria-hidden="true">↗</span></Link></footer>
    </section>
  )
}
