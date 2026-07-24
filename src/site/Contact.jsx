import { profile } from '../data/content.js'
import { asset } from './asset.js'
import { trackPageView } from '../analytics/tracker.js'

export default function Contact() {
  const github = profile.links.find((l) => l.label === 'GitHub')?.url
  const linkedin = profile.links.find((l) => l.label === 'LinkedIn')?.url
  const facts = [
    `Based in ${profile.location}, currently at SCAD`,
    'I read every message myself',
    'Usually reply within a day',
  ]
  const subject = encodeURIComponent('Hello Viren')

  // mailto fails quietly on machines with no mail client — recruiters on
  // corporate laptops, mostly — so clicking also copies the address.
  const copyEmail = () => {
    try { navigator.clipboard?.writeText(profile.email) } catch { /* clipboard blocked */ }
  }

  return (
    <section id="contact" className="section contact">
      <div className="contact-card reveal">
        <span className="kicker">contact</span>
        <h2 className="contact-title">Say hello.</h2>
        <p className="contact-lead">
          Want to work on something together, talk shop, or just say hi? Email is the best way to
          reach me, and I always write back.
        </p>
        <p className="contact-recruit">
          Recruiting?{' '}
          <a
            href={asset(profile.resume)}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackPageView('/resume')}
          >
            Grab my resume (PDF) ↗
          </a>.{' '}
          I&apos;m open to Summer 2027 software and game development internships.
        </p>

        <div className="contact-cta">
          <a
            className="btn btn-primary"
            href={`mailto:${profile.email}?subject=${subject}`}
            title="Opens your mail app, and copies the address, just in case"
            onClick={copyEmail}
          >
            ✉ {profile.email}
          </a>
          <a
            className="btn btn-ghost"
            href={asset(profile.resume)}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackPageView('/resume')}
          >
            Resume ↗
          </a>
          {github && (
            <a className="btn btn-ghost" href={github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
          )}
          {linkedin && (
            <a className="btn btn-ghost" href={linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          )}
        </div>

        <ul className="contact-facts">
          {facts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
