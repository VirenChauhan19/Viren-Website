// Resolves a relative asset path against Vite's configured base URL so it
// works in dev, in `npm run preview`, AND when deployed to GitHub Pages
// at `/Viren-Website/`. Absolute URLs (http://, https://, data:, blob:,
// protocol-relative //) are passed through unchanged.

const BASE = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/'

export function assetUrl(p) {
  if (!p) return ''
  if (/^(https?:|data:|blob:|\/\/)/.test(p)) return p
  const clean = p.replace(/^\/+/, '')
  return BASE.replace(/\/+$/, '/') + clean
}

// Best-effort YouTube thumbnail (Vite/GH Pages don't proxy this: direct CDN).
export function youtubeThumb(id) {
  if (!id) return ''
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
}

export function youtubeWatchUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`
}

export function youtubeEmbedUrl(id) {
  return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&playsinline=1`
}
