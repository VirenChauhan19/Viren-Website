import { HashRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Layout from './site/Layout.jsx'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Layout />
      </HashRouter>
    </MotionConfig>
  )
}
