// One source of truth for per page titles, descriptions, and social cards.
//
// Read in two places:
//   * at build time by scripts/prerender.js, which bakes these tags into a
//     real HTML file per route. Crawlers and link unfurlers (Google, LinkedIn,
//     Discord, iMessage) do not run our JavaScript, so the tags have to be
//     present in the served markup, not applied by React after mount.
//   * at runtime by Layout, so the tab title and canonical follow the visitor
//     through client side navigation.
//
// House style: no em dashes in anything a visitor can read.
import { profile, projects } from '../data/content.js'

export const ORIGIN = 'https://virenchauhan.com'

const SITE_DESCRIPTION =
  'Game Technology & Software Developer building game systems, developer tools, AI-powered products, and interactive experiences with Unreal Engine, Unity, C#, C++, and modern software technologies.'

// Editorial, not derivable from the data: the topics worth claiming in
// structured data. Keep it to things the projects actually demonstrate.
export const KNOWS_ABOUT = [
  'C#', 'C++', 'Python', 'Unreal Engine', 'Unity', 'Gameplay Systems',
  'React', 'Next.js', 'Firebase', 'Applied AI',
]

// Pages with no project behind them. Canonical and image are filled in below.
const STATIC_PAGES = {
  '/': {
    title: `${profile.name} | ${profile.title}`,
    description: SITE_DESCRIPTION,
  },
  '/projects': {
    title: `Projects | ${profile.name}`,
    description:
      'Selected work in Unreal Engine, Unity, and full stack software, each written up with the problem, the approach taken, and the measured result.',
  },
  '/about': {
    title: `About | ${profile.name}`,
    description:
      'Game Design student at SCAD minoring in Applied AI, focused on gameplay systems, developer tools, and software that real people use every day.',
  },
  '/experience': {
    title: `Experience | ${profile.name}`,
    description:
      'Roles and leadership: SCADpro x Atlanta United, the FIFA World Cup 2026 anti-doping team, student athlete leadership at SCAD, and independent shipped software.',
  },
  '/contact': {
    title: `Contact | ${profile.name}`,
    description: `Get in touch with ${profile.name} about software, game technology, and applied AI internships.`,
  },
}

// The dashboard is private. It is never prerendered and never listed in the
// sitemap, so it stays out of search results.
export const PRIVATE_PATHS = ['/analytics']

export function normalizePath(pathname = '/') {
  const clean = String(pathname).split('?')[0].split('#')[0]
  if (clean.length > 1 && clean.endsWith('/')) return clean.slice(0, -1)
  return clean || '/'
}

export function findProject(slug) {
  return (
    projects.find((p) => p.slug === slug) ||
    projects.find((p) => (p.aliases || []).includes(slug))
  )
}

// Social descriptions get cut off around 300 characters. Trim on a word
// boundary so a card never ends mid word.
function clamp(text, max = 300) {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  if (s.length <= max) return s
  const cut = s.slice(0, max)
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]$/, '') + '...'
}

function projectMeta(project) {
  const poster = (project.media || []).find((m) => m.poster)?.poster
  return {
    title: `${project.name} | ${profile.name}`,
    description: clamp(project.summary),
    // Aliases are retired URLs that still resolve. Pointing them at the live
    // slug stops search engines treating the pair as duplicate pages.
    canonical: `${ORIGIN}/projects/${project.slug}`,
    image: poster || profile.photo,
    imageAlt: `${project.name}, ${project.category}`,
    type: 'article',
    project,
  }
}

export function metaForPath(pathname) {
  const path = normalizePath(pathname)

  if (path.startsWith('/projects/')) {
    const project = findProject(path.slice('/projects/'.length))
    if (project) return projectMeta(project)
  }

  const page = STATIC_PAGES[path] || STATIC_PAGES['/']
  const canonicalPath = STATIC_PAGES[path] ? path : '/'
  return {
    ...page,
    canonical: ORIGIN + (canonicalPath === '/' ? '/' : canonicalPath),
    image: profile.photo,
    imageAlt: `${profile.name} headshot`,
    type: 'website',
  }
}

// Every path that should answer with a real 200 and appear in the sitemap.
// Aliases are prerendered too (an old shared link should not 404 on the way
// to its redirect) but are marked so the sitemap can skip them.
export function prerenderRoutes() {
  const routes = Object.keys(STATIC_PAGES).map((path) => ({ path, canonical: true }))

  for (const project of projects) {
    routes.push({ path: `/projects/${project.slug}`, canonical: true })
    for (const alias of project.aliases || []) {
      routes.push({ path: `/projects/${alias}`, canonical: false })
    }
  }

  return routes
}
