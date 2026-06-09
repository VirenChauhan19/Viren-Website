// Resolve a public/ asset path against Vite's base URL so media works in dev,
// preview, and on GitHub Pages (/Viren-Website/). Absolute URLs pass through.
const BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/'

export function asset(p) {
  if (!p) return ''
  if (/^(https?:|data:|blob:|\/\/)/.test(p)) return p
  return BASE.replace(/\/+$/, '/') + p.replace(/^\/+/, '')
}

export function youtubeWatchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`
}

export function youtubeThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}
