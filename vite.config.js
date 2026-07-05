import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { resolve } from 'node:path'

// GitHub Pages serves 404.html for unknown paths. Copying the built SPA
// shell there lets BrowserRouter deep links (/projects/x) load directly.
const spaFallback = {
  name: 'spa-github-pages-404',
  closeBundle() {
    try {
      copyFileSync(resolve('dist/index.html'), resolve('dist/404.html'))
    } catch { /* dev server: nothing built yet */ }
  },
}

export default defineConfig({
  plugins: [react(), spaFallback],
  base: '/',
})
