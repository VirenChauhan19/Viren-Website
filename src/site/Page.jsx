import { motion, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'
import { useReveal } from './fx.js'

// Animated page wrapper. Each route renders inside one of these so navigation
// gets a smooth enter/exit transition, and reveal-on-scroll re-arms per page.
export default function Page({ children, className = '' }) {
  const ref = useRef(null)
  const reduceMotion = useReducedMotion()
  useReveal(ref)
  useLayoutEffect(() => {
    // Reset only once the incoming page mounts, after the outgoing exit.
    const target = window.location.hash && document.getElementById(window.location.hash.slice(1))
    if (target) target.scrollIntoView({ behavior: 'instant' })
    else window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])
  return (
    <motion.main
      id="main"
      ref={ref}
      className={`page ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 1 } : { opacity: 0, transition: { duration: 0.12 } }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.main>
  )
}
