import { motion } from 'framer-motion'
import { profile, education, experience } from '../data/content'
import Media from '../components/Media'
import Reveal from '../components/Reveal'

function TimelineItem({ children, index }) {
  return (
    <motion.div
      className="t-item"
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export default function About() {
  return (
    <section className="block">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <span className="kicker">About</span>
            <h2>Game developer, applied AI builder, endurance athlete</h2>
          </div>
        </Reveal>

        <div className="about-grid">
          <Reveal from="left">
            <div className="photo-frame">
              <img src={`${import.meta.env.BASE_URL}${profile.photo}`} alt={profile.name} />
            </div>
          </Reveal>

          <Reveal from="right" delay={0.1}>
            <div>
              {profile.about.map((p, i) => (
                <p key={i}>{p}</p>
              ))}

              <h3 style={{ margin: '34px 0 16px', fontSize: '1.15rem' }}>Education</h3>
              <div className="timeline">
                {education.map((e, i) => (
                  <TimelineItem key={i} index={i}>
                    <h4>{e.school}</h4>
                    <div className="org">
                      {e.degree} · {e.location}
                    </div>
                    <p>{e.detail}</p>
                  </TimelineItem>
                ))}
              </div>

              <h3 style={{ margin: '34px 0 16px', fontSize: '1.15rem' }}>
                Experience & Volunteering
              </h3>
              <div className="timeline">
                {experience.map((x, i) => (
                  <TimelineItem key={i} index={i}>
                    <h4>{x.role}</h4>
                    <div className="org">{x.org}</div>
                    {(x.dates || x.location) && (
                      <div className="t-dates">
                        {[x.dates, x.location].filter(Boolean).join(' · ')}
                      </div>
                    )}
                    {x.detail && <p>{x.detail}</p>}
                    {x.bullets && x.bullets.length > 0 && (
                      <ul className="t-bullets">
                        {x.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                    {x.media && x.media.length > 0 && (
                      <div className="media-stack" style={{ marginTop: 16 }}>
                        {x.media.map((m, j) => (
                          <figure key={j}>
                            <Media item={m} />
                            {m.caption && <figcaption>{m.caption}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    )}
                  </TimelineItem>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
