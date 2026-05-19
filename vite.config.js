import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages repo name for assets to resolve
export default defineConfig({
  plugins: [react()],
  base: '/Viren-Website/',
})
