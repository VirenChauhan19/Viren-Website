import Page from '../Page.jsx'
import About from '../About.jsx'
import Skills from '../Skills.jsx'
import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <Page className="about-page">
      <About />
      <Skills />
      <section className="section about-close reveal"><span className="kicker">Let’s build something</span><h2>Have something in mind?</h2><Link className="btn btn-primary" to="/contact">Get in touch ↗</Link></section>
    </Page>
  )
}
