import { motion } from 'framer-motion'
import { profile } from '../data/content'

export default function Contact() {
  return (
    <section className="block">
      <div className="container">
        <motion.div
          className="contact-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="kicker" style={{ color: 'var(--accent)' }}>
            Let’s build something
          </span>
          <h2 style={{ marginTop: 12 }}>
            Open to game dev & applied AI opportunities
          </h2>
          <p>
            Internships, collaborations, or just want to talk shop about games and AI —
            I’d love to hear from you.
          </p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            {profile.links
              .filter((l) => l.label !== 'Email')
              .map((l) => (
                <a
                  key={l.label}
                  className="btn btn-ghost"
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {l.label}
                </a>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
