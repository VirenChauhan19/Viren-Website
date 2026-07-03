import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, LayoutGroup } from 'framer-motion'
import { profile } from '../data/content.js'
import { asset } from './asset.js'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/projects', label: 'Projects' },
  { to: '/about', label: 'About' },
  { to: '/experience', label: 'Experience' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
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
          <nav className={`nav-links ${open ? 'open' : ''}`}>
            {LINKS.map((l) => (
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

            <div className="nav-menu-foot">
              {github && (
                <a href={github} target="_blank" rel="noreferrer" onClick={close}>GitHub ↗</a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noreferrer" onClick={close}>LinkedIn ↗</a>
              )}
              <a href={`mailto:${profile.email}`} onClick={close}>Email ↗</a>
            </div>
          </nav>
        </LayoutGroup>
      </div>
    </header>
  )
}
