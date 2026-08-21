// Turns the single page app into one real HTML file per route at build time.
//
// Why this exists: GitHub Pages has no rewrite rules. Any path that is not a
// file on disk falls through to 404.html, which renders the site correctly but
// answers with an HTTP 404. Visitors never notice, because the browser runs the
// shell either way. Search engines do notice and refuse to index a 404, and
// some link unfurlers refuse to draw a card for one. Writing a real file at
// every known route turns those into 200s, and lets each page carry its own
// title, description, and social image instead of inheriting the homepage's.
//
// Unknown paths still fall through to 404.html, and /analytics is deliberately
// left out so the private dashboard stays unindexed.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { profile } from '../src/data/content.js'
import { ORIGIN, KNOWS_ABOUT, metaForPath, prerenderRoutes } from '../src/site/seo.js'

const START = '<!-- seo:start -->'
const END = '<!-- seo:end -->'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// Read the real pixel dimensions out of a JPEG header. og:image:width and
// og:image:height are a promise to the unfurler, so hardcoding them means they
// go stale the moment an image is swapped. That is exactly how the head ended
// up advertising a 1024x1024 headshot that was never 1024x1024.
function jpegSize(file) {
  try {
    const d = readFileSync(file)
    if (d[0] !== 0xff || d[1] !== 0xd8) return null
    let i = 2
    while (i < d.length - 9) {
      if (d[i] !== 0xff) {
        i += 1
        continue
      }
      const marker = d[i + 1]
      // The SOF markers carry the frame size. 0xc4, 0xc8 and 0xcc sit in the
      // same range but mean something else.
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: d.readUInt16BE(i + 7), height: d.readUInt16BE(i + 5) }
      }
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        i += 2
        continue
      }
      i += 2 + d.readUInt16BE(i + 2)
    }
  } catch {
    /* fall through: better to omit the tags than to lie about them */
  }
  return null
}

function jsonLd(data) {
  // Escaping the angle brackets keeps a stray closing script tag in the data
  // from ending the block early.
  const json = JSON.stringify(data, null, 2).replace(/</g, '\\u003c')
  return `<script type="application/ld+json">\n${json}\n</script>`
}

function personSchema() {
  const [locality, region] = String(profile.location)
    .split(',')
    .map((s) => s.trim())
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    url: `${ORIGIN}/`,
    image: `${ORIGIN}/${profile.photo}`,
    jobTitle: profile.title,
    email: `mailto:${profile.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressRegion: region,
      addressCountry: 'US',
    },
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'Savannah College of Art and Design',
    },
    knowsAbout: KNOWS_ABOUT,
    sameAs: profile.links.filter((l) => l.url.startsWith('http')).map((l) => l.url),
  }
}

function projectSchema(project, meta, imageUrl) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.name,
      description: meta.description,
      url: meta.canonical,
      image: imageUrl,
      dateCreated: project.year,
      genre: project.category,
      keywords: (project.tech || []).join(', '),
      creator: { '@type': 'Person', name: profile.name, url: `${ORIGIN}/` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${ORIGIN}/` },
        { '@type': 'ListItem', position: 2, name: 'Projects', item: `${ORIGIN}/projects` },
        { '@type': 'ListItem', position: 3, name: project.name, item: meta.canonical },
      ],
    },
  ]
}

function headFor(meta, distDir, { noindex = false } = {}) {
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const imageUrl = `${ORIGIN}/${meta.image}`
  const size = jpegSize(resolve(distDir, meta.image))
  // A 16:9 poster earns the big card. The near square headshot does not:
  // asking for a large card with a square image gets it cropped badly.
  const wide = size ? size.width / size.height >= 1.5 : false

  const lines = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${meta.canonical}" />`,
  ]
  if (noindex) lines.push('<meta name="robots" content="noindex" />')

  lines.push(
    '',
    '<!-- Social preview cards (LinkedIn, Slack, iMessage, X) -->',
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${escapeHtml(profile.name)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${imageUrl}" />`,
    `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`,
  )
  if (size) {
    lines.push(
      `<meta property="og:image:width" content="${size.width}" />`,
      `<meta property="og:image:height" content="${size.height}" />`,
    )
  }
  lines.push(
    `<meta name="twitter:card" content="${wide ? 'summary_large_image' : 'summary'}" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${imageUrl}" />`,
    '',
  )

  const schema = meta.project ? projectSchema(meta.project, meta, imageUrl) : [personSchema()]
  for (const entry of schema) lines.push(jsonLd(entry))

  return lines.map((line) => (line ? '    ' + line : '')).join('\n')
}

function render(shell, meta, distDir, options) {
  const start = shell.indexOf(START)
  const end = shell.indexOf(END)
  if (start === -1 || end === -1) {
    throw new Error(
      `prerender: could not find the ${START} / ${END} markers in index.html. ` +
        'Per page titles and social cards are generated between them, so the ' +
        'build stops rather than silently shipping every route with the ' +
        'homepage tags.',
    )
  }
  return (
    shell.slice(0, start + START.length) +
    '\n' +
    headFor(meta, distDir, options) +
    '\n    ' +
    shell.slice(end)
  )
}

function write(distDir, relative, html) {
  const target = resolve(distDir, relative)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, html)
}

export default function prerender() {
  return {
    name: 'prerender-routes',
    closeBundle() {
      const distDir = resolve('dist')
      const indexPath = resolve(distDir, 'index.html')
      if (!existsSync(indexPath)) return // dev server: nothing built yet

      const shell = readFileSync(indexPath, 'utf8')
      const routes = prerenderRoutes()

      for (const route of routes) {
        const html = render(shell, metaForPath(route.path), distDir)
        if (route.path === '/') {
          write(distDir, 'index.html', html)
          continue
        }
        // Both spellings, so a shared link works with or without the trailing
        // slash instead of leaning on a redirect: /about and /about/.
        const clean = route.path.replace(/^\//, '')
        write(distDir, `${clean}.html`, html)
        write(distDir, `${clean}/index.html`, html)
      }

      // Genuinely unknown paths, plus /analytics, still land here. It renders
      // the app, so the visitor is fine, but it must never be indexed.
      write(distDir, '404.html', render(shell, metaForPath('/'), distDir, { noindex: true }))

      const today = new Date().toISOString().slice(0, 10)
      const urls = routes
        .filter((r) => r.canonical)
        .map((r) => {
          const loc = `${ORIGIN}${r.path === '/' ? '/' : r.path}`
          const priority = r.path === '/' ? '1.0' : r.path.startsWith('/projects/') ? '0.8' : '0.7'
          return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
        })
        .join('\n')

      write(
        distDir,
        'sitemap.xml',
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )

      write(
        distDir,
        'robots.txt',
        [
          'User-agent: *',
          'Allow: /',
          '',
          '# Private dashboard: not prerendered and not in the sitemap.',
          'Disallow: /analytics',
          '',
          `Sitemap: ${ORIGIN}/sitemap.xml`,
          '',
        ].join('\n'),
      )

      const pages = routes.filter((r) => r.canonical).length
      const aliases = routes.length - pages
      console.log(
        `\nprerendered ${routes.length} routes (${pages} indexable, ${aliases} legacy aliases) + sitemap.xml + robots.txt`,
      )
    },
  }
}
