import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Layout from './site/Layout.jsx'

// Clean paths (/projects/x) instead of hash routes: GitHub Pages serves
// dist/404.html (a copy of the SPA shell) for deep links, and index.html
// rewrites legacy /#/ URLs before the router mounts.
export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </MotionConfig>
  )
}
