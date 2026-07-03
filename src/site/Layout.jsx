import { useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { profile } from '../data/content.js'
import Nav from './Nav.jsx'
import Home from './pages/Home.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import ExperiencePage from './pages/ExperiencePage.jsx'
import ContactPage from './pages/ContactPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function Layout() {
  const location = useLocation()
  const year = new Date().getFullYear()

  return (
    <div className="site">
      <div className="bg-scan" aria-hidden="true" />

      <Nav />
      <ScrollToTop />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark">VIREN<span className="dotexe">.exe</span></span>
            <span className="footer-tag">{profile.title}</span>
          </div>
          <div className="footer-meta">
            <span>© {year} Viren Chauhan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
