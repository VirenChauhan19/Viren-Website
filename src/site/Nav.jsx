import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, LayoutGroup } from 'framer-motion'
import { profile } from '../data/content.js'
import { hasStoredSession, trackPageView } from '../analytics/tracker.js'
import { asset } from './asset.js'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/experience', label: 'Experience' },
  { to: '/about', label: 'About' },
]

// Only the site owner sees this tab: it appears when a Supabase
// dashboard session exists on this device (see src/analytics).
const OWNER_LINK = { to: '/analytics', label: 'Analytics' }

export default function Nav() {
  const [open, setOpen] = useState(false)
  const [owner, setOwner] = useState(hasStoredSession)
  const close = () => setOpen(false)

  useEffect(() => {
    const sync = () => setOwner(hasStoredSession())
    window.addEventListener('va-auth', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('va-auth', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const links = owner ? [...LINKS, OWNER_LINK] : LINKS
  const github = profile.links.find((l) => l.label === 'GitHub')?.url
  const linkedin = profile.links.find((l) => l.label === 'LinkedIn')?.url

  // Brand click: go home and scroll to the very top, even when already on "/"
  // (route doesn't change then, so ScrollToTop in Layout never fires).
  // Plain scrollTo(0, 0) follows the CSS scroll-behavior: smooth normally,
  // instant for reduced-motion users.
  const onBrand = () => {
    close()
    window.scrollTo(0, 0)
  }

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <header className="nav">
      <a className="skip-link" href="#main">Skip to content</a>
      <div className="nav-inner">
        <NavLink to="/" end className="nav-brand" onClick={onBrand}>
          <img className="nav-logo" src={asset(profile.photo)} alt="" aria-hidden="true" />
          VIREN<span className="dotexe">.exe</span>
        </NavLink>

        <button
          className={`nav-toggle ${open ? 'open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span /><span /><span />
        </button>

        <LayoutGroup>
          <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={close}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {({ isActive }) => (
                  <>
                    <span>{l.label}</span>
                    {isActive && <motion.span className="nav-underline" layoutId="nav-underline" />}
                  </>
                )}
              </NavLink>
            ))}

            <a
              className="nav-resume"
              href={asset(profile.resume)}
              target="_blank"
              rel="noreferrer"
              onClick={() => { close(); trackPageView('/resume') }}
            >
              Resume ↗
            </a>

            <div className="nav-menu-foot">
              {github && (
                <a href={github} target="_blank" rel="noreferrer" onClick={close}>GitHub ↗</a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" onClick={close}>LinkedIn ↗</a>
              )}
              <NavLink to="/contact" onClick={close}>Contact</NavLink>
              <a href={`mailto:${profile.email}`} onClick={close}>Email ↗</a>
            </div>
          </nav>
        </LayoutGroup>
      </div>
    </header>
  )
}
