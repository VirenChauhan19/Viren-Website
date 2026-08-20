import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { profile } from '../data/content.js'
import { asset } from './asset.js'
import { usePageTracking, trackPageView } from '../analytics/tracker.js'
import Nav from './Nav.jsx'
import Home from './pages/Home.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import ExperiencePage from './pages/ExperiencePage.jsx'
import ContactPage from './pages/ContactPage.jsx'

// Private analytics dashboard: lazy so visitors never download it.
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'))

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function Layout() {
  const location = useLocation()
  const year = new Date().getFullYear()
  usePageTracking()

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
          <Route
            path="/analytics"
            element={
              <Suspense fallback={null}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-mark">VIREN<span className="dotexe">.exe</span></span>
            <span className="footer-tag">{profile.title}</span>
            <span className="footer-seeking">{profile.seeking}</span>
          </div>

          <nav className="footer-links" aria-label="Footer">
            <a
              className="footer-resume"
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackPageView('/resume')}
            >
              Resume <span aria-hidden="true">↗</span>
            </a>
            {profile.links.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
            <Link to="/contact">Contact</Link>
          </nav>

          <div className="footer-meta">
            <span>© {year} Viren Chauhan</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
