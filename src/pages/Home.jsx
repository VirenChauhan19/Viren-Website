import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import { profile, projects } from '../data/content'

export default function Home() {
  const featured = projects.slice(0, 3)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  // Hero content drifts up, fades and scales as you scroll past it.
  const y = useTransform(scrollYProgress, [0, 1], [0, -160])
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.92])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  const name = profile.name.split(' ')

  return (
    <>
      <section className="hero" ref={heroRef}>
        <motion.div className="container hero-content" style={{ y, opacity, scale }}>
          <motion.span
            className="eyebrow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            SCAD · Game Development + Applied AI
          </motion.span>
          <h1>
            {[name[0], name[1]].map((word, i) => (
              <motion.span
                key={i}
                className={i === 1 ? 'grad block' : 'block'}
                initial={{ opacity: 0, y: 80, rotateX: -40 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              >
                {word}
              </motion.span>
            ))}
            <motion.span
              className="block title-line"
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.45 }}
            >
              {profile.title}
            </motion.span>
          </h1>
          <motion.p
            className="lead"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {profile.tagline}
          </motion.p>
          <motion.div
            className="cta-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.75 }}
          >
            <Link to="/projects" className="btn btn-primary">
              View my work →
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              Get in touch
            </Link>
          </motion.div>
        </motion.div>

        <motion.div className="scroll-hint" style={{ opacity: hintOpacity }}>
          <span>scroll</span>
          <div className="scroll-hint-line" />
        </motion.div>
      </section>

      <section className="block">
        <div className="container">
          <Reveal>
            <div className="section-head">
              <span className="kicker">Selected work</span>
              <h2>Games, AI tools & creative tech</h2>
              <p>
                A mix of game development and applied AI — including tools built for real
                people: students and a doctor’s patients.
              </p>
            </div>
          </Reveal>
          <div className="project-grid">
            {featured.map((p, i) => (
              <ProjectCard key={p.slug} project={p} index={i} />
            ))}
          </div>
          <Reveal delay={0.1}>
            <div style={{ marginTop: 40 }}>
              <Link to="/projects" className="btn btn-ghost">
                See all projects →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
