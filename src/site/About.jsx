import { Link } from 'react-router-dom'
import { profile, education, academicHonors } from '../data/content.js'
import { asset } from './asset.js'
import './about.css'

export default function About() {
  const school = education[0]
  return <section id="about" className="section portrait-about">
    <header className="portrait-intro reveal"><span className="kicker">About / Viren Chauhan</span><span>Atlanta, Georgia</span></header>
    <div className="portrait-hero">
      <div className="portrait-story reveal"><h1>Curiosity builds.<br /><span>Discipline delivers.</span></h1><p className="portrait-lead">I’m Viren. I build software, explore what AI can do, and spend a lot of time running.</p><p>I study Game Design at SCAD with a minor in Applied AI. My work brings together the systems thinking of game development, the craft of interface design, and the engineering that makes a product work.</p><div className="portrait-actions"><Link className="btn btn-primary" to="/projects">Explore my work ↗</Link><a href={asset(profile.resume)} target="_blank" rel="noreferrer">View resume ↗</a></div></div>
      <figure className="portrait-photo reveal"><div><img src={asset(profile.photo)} alt="Viren Chauhan smiling outdoors with a city skyline behind him" width="1791" height="1879" /></div><figcaption>Developer. Designer. Distance runner.</figcaption></figure>
    </div>
    <div className="portrait-chapter reveal"><span className="kicker">01 / What drives the work</span><div><h2>I like taking an idea<br />all the way to working software.</h2><p>That means thinking through the interface, building the underlying systems, and getting the details right when someone actually uses it. My projects range from gameplay systems in Unreal Engine and Unity to full-stack apps and AI-powered tools.</p><p>ScreenMate, built for AI Tinkerers’ Agents Everywhere Hackathon with OpenAI, placed third globally among 687 submitted projects. With WorldOS, built for the Meta AI Hackathon, I explored how AI and spatial interfaces can help people plan a real room.</p><Link className="portrait-text-link" to="/projects/screenmate">Inside ScreenMate ↗</Link></div></div>
    <div className="portrait-perspectives">
      <article className="reveal"><span>01</span><h3>Think in systems.</h3><p>Gameplay, application logic, data, and permissions. I’m interested in how the pieces work together and how to make them easier to build on.</p></article>
      <article className="reveal"><span>02</span><h3>Design for people.</h3><p>My UX/UI work with SCADpro × Atlanta United brought design, technology, and client feedback into the same process.</p><Link to="/projects/atlanta-united">Explore the collaboration ↗</Link></article>
      <article className="reveal"><span>03</span><h3>Stay accountable.</h3><p>{profile.aiAssisted}</p></article>
    </div>
    <div className="portrait-endurance reveal"><div><span className="kicker">02 / Beyond the keyboard</span><h2>The long run<br /><span>shapes the work.</span></h2></div><div><p>I grew up around La Ultra: The High in the Indian Himalayas, moving from core crew to directing the 55 km category. Working in that environment taught me to prepare carefully, communicate clearly, and follow through when conditions get difficult.</p><p>Today, I train and compete in cross country and track at SCAD alongside a full course load. That rhythm of showing up, making progress, and staying patient carries into the way I build.</p><Link className="portrait-text-link" to="/experience">The experiences behind the work ↗</Link></div></div>
    <div className="portrait-education reveal"><div><span className="kicker">Learning & competing</span><h2>{school.school}</h2><p>{school.degree}<br />{school.minor}</p><small>Expected graduation / {school.grad}</small></div><div className="portrait-honors"><span className="kicker">Academic recognition</span>{academicHonors.map(h => <div key={h.title}><h3>{h.title}</h3><p>{h.sport} · {h.season}</p></div>)}</div></div>
  </section>
}
