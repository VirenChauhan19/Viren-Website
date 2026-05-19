import { motion } from 'framer-motion'

const dirs = {
  up: { y: 60 },
  down: { y: -60 },
  left: { x: 70 },
  right: { x: -70 },
  scale: { scale: 0.8 },
}

// Scroll-triggered entrance: fades + slides/scales as it enters the viewport.
export default function Reveal({ children, from = 'up', delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...dirs[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
