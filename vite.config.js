import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import prerender from './scripts/prerender.js'

// prerender() writes a real HTML file per route (so GitHub Pages answers 200
// instead of falling through to 404.html), gives each one its own title and
// social card, and emits 404.html, sitemap.xml and robots.txt.
export default defineConfig({
  plugins: [react(), prerender()],
  base: '/',
})
