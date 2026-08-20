import { motion } from 'framer-motion'
import { useReveal } from './fx.js'

// Animated page wrapper. Each route renders inside one of these so navigation
// gets a smooth enter/exit transition, and reveal-on-scroll re-arms per page.
export default function Page({ children, className = '' }) {
  useReveal()
  return (
    <motion.main
      id="main"
      className={`page ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.36, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.main>
  )
}
