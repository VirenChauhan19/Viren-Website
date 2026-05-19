import { motion } from 'framer-motion'
import { profile, education, experience } from '../data/content'
import Media from '../components/Media'

export default function About() {
  return (
    <section className="block">
      <div className="container">
        <div className="section-head">
          <span className="kicker">About</span>
          <h2>Game developer, AI tinkerer, endurance athlete</h2>
        </div>

        <div className="about-grid">
          <motion.div
            className="photo-frame"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <img src={`${import.meta.env.BASE_URL}${profile.photo}`} alt={profile.name} />
          </motion.div>

          <div>
            {profile.about.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h3 style={{ margin: '34px 0 16px', fontSize: '1.15rem' }}>Education</h3>
            <div className="timeline">
              {education.map((e, i) => (
                <div className="t-item" key={i}>
                  <h4>{e.school}</h4>
                  <div className="org">
                    {e.degree} · {e.location}
                  </div>
                  <p>{e.detail}</p>
                </div>
              ))}
            </div>

            <h3 style={{ margin: '34px 0 16px', fontSize: '1.15rem' }}>
              Films & Field Work
            </h3>
            <div className="timeline">
              {experience.map((x, i) => (
                <div className="t-item" key={i}>
                  <h4>{x.role}</h4>
                  <div className="org">{x.org}</div>
                  <p>{x.detail}</p>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
