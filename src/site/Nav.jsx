import { useState } from 'react'
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

  return (
    <header className="nav">
      <div className="nav-inner">
        <NavLink to="/" end className="nav-brand" onClick={close}>
          <img className="nav-logo" src={asset(profile.logo || profile.photo)} alt="" aria-hidden="true" />
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
          </nav>
        </LayoutGroup>
      </div>
    </header>
  )
}
