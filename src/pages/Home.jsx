import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroScene from '../components/HeroScene'
import ProjectCard from '../components/ProjectCard'
import { profile, projects } from '../data/content'

export default function Home() {
  const featured = projects.slice(0, 3)
  return (
    <>
      <section className="hero">
        <div className="hero-3d">
          <HeroScene />
        </div>
        <div className="container hero-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">SCAD · Game Development + Applied AI</span>
            <h1>
              {profile.name.split(' ')[0]} <span className="grad">{profile.name.split(' ')[1]}</span>
              <br />
              {profile.title}
            </h1>
            <p className="lead">{profile.tagline}</p>
            <div className="cta-row">
              <Link to="/projects" className="btn btn-primary">
                View my work →
              </Link>
              <Link to="/contact" className="btn btn-ghost">
                Get in touch
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <span className="kicker">Selected work</span>
            <h2>Games, AI tools & creative tech</h2>
            <p>
              A mix of game development and applied AI — including tools built for real
              people: students and a doctor’s patients.
            </p>
          </div>
          <div className="project-grid">
            {featured.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
          <div style={{ marginTop: 36 }}>
            <Link to="/projects" className="btn btn-ghost">
              See all projects →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
