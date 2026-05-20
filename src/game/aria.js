// ARIA — an offline retrieval chatbot that answers questions about Viren.
// Builds a small TF-IDF index over the structured profile data and a curated
// set of canned-but-substantive responses for common recruiter questions.
// No external API; ships in the static bundle.

import { profile, education, experience, projects } from '../data/content.js'

// ─────────────────── 1. Knowledge base construction ───────────────────

function makeDoc(id, title, body, tags = [], meta = {}) {
  return { id, title, body, text: `${title}\n${body}`, tags, meta }
}

const KB = []

// Profile & about
KB.push(
  makeDoc(
    'profile',
    `${profile.name} — ${profile.title}`,
    [profile.tagline, ...profile.about].join(' '),
    ['about', 'who', 'bio', 'profile', 'viren', 'background', 'introduction'],
  ),
)

// Education
education.forEach((e, i) => {
  KB.push(
    makeDoc(
      `edu-${i}`,
      `${e.degree} — ${e.school}`,
      `${e.degree} at ${e.school} (${e.location}). ${e.detail || ''}`,
      ['education', 'school', 'degree', 'scad', 'savannah', 'study', 'minor', 'university'],
    ),
  )
})

// Experience
experience.forEach((exp, i) => {
  const body = [
    `${exp.role} at ${exp.org}.`,
    exp.dates ? `Dates: ${exp.dates}.` : '',
    exp.location ? `Location: ${exp.location}.` : '',
    exp.detail || '',
    ...(exp.bullets || []),
  ]
    .filter(Boolean)
    .join(' ')
  const tags = ['experience', 'work', 'job', 'role']
  if (/fifa/i.test(exp.org)) tags.push('fifa', 'soccer', 'football', 'sports', 'event', 'volunteer')
  if (/ultra/i.test(exp.org)) tags.push('ultra', 'ultramarathon', 'running', 'ladakh', 'la-ultra')
  if (/scad/i.test(exp.org)) tags.push('scad', 'campus', 'student')
  if (/athlete/i.test(exp.role)) tags.push('athlete', 'sport', 'running')
  if (/director|race director/i.test(exp.role)) tags.push('leadership', 'race director', 'director')
  if (/film|production|documentary/i.test(exp.role + exp.org)) tags.push('film', 'video', 'production')
  if (/video editor/i.test(exp.role)) tags.push('video editor', 'editing')
  KB.push(makeDoc(`exp-${i}`, `${exp.role} · ${exp.org}`, body, tags))
})

// Projects
projects.forEach((p) => {
  const body = [
    p.summary,
    ...(p.description || []),
    p.highlights ? `Highlights: ${p.highlights.join('; ')}.` : '',
    p.tech ? `Tech: ${p.tech.join(', ')}.` : '',
    p.live ? `Live demo available.` : '',
    p.repo ? `Open source on GitHub.` : '',
  ]
    .filter(Boolean)
    .join(' ')
  const tags = ['project', p.type, p.slug, ...(p.tech || []).map((t) => t.toLowerCase())]
  if (p.type === 'ai') tags.push('ai', 'applied ai', 'chatbot', 'machine learning')
  if (p.type === 'game') tags.push('game', 'gameplay', 'unity', 'unreal', 'design')
  KB.push(makeDoc(`proj-${p.slug}`, p.name, body, tags, { project: p }))
})

// Contact
KB.push(
  makeDoc(
    'contact',
    'Get in touch with Viren',
    `Email: ${profile.email}. Links: ${profile.links.map((l) => `${l.label} → ${l.url}`).join(' · ')}.`,
    ['contact', 'email', 'reach', 'hire', 'message', 'github'],
  ),
)

// ─────────────────── 2. Lightweight tokenizer + TF-IDF ───────────────────

const STOP = new Set([
  'the','a','an','and','or','of','to','in','on','for','with','at','by','is','are','was','were','be','been',
  'being','it','its','this','that','these','those','i','you','he','she','they','we','his','her','their','our',
  'my','me','as','from','if','but','so','than','then','can','could','would','should','do','does','did',
  'have','has','had','will','about','what','who','where','when','why','how','tell','show','give','please',
])

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOP.has(t))
}

// Build TF and IDF for the corpus.
const DOC_TOKENS = KB.map((d) => tokenize(`${d.title} ${d.body} ${d.tags.join(' ')}`))
const DF = new Map()
DOC_TOKENS.forEach((tokens) => {
  const seen = new Set(tokens)
  seen.forEach((t) => DF.set(t, (DF.get(t) || 0) + 1))
})
const N = KB.length
function idf(term) {
  const df = DF.get(term) || 0
  if (df === 0) return 0
  return Math.log((N + 1) / (df + 1)) + 1
}
function tf(term, tokens) {
  let c = 0
  for (const t of tokens) if (t === term) c++
  return c / Math.max(1, tokens.length)
}

// Pre-compute doc vector lengths for cosine norm.
const DOC_VECTORS = DOC_TOKENS.map((tokens) => {
  const counts = {}
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1
  const vec = {}
  for (const t in counts) vec[t] = (counts[t] / tokens.length) * idf(t)
  let norm = 0
  for (const t in vec) norm += vec[t] * vec[t]
  return { vec, norm: Math.sqrt(norm) }
})

function queryVector(query) {
  const tokens = tokenize(query)
  const counts = {}
  for (const t of tokens) counts[t] = (counts[t] || 0) + 1
  const vec = {}
  for (const t in counts) vec[t] = (counts[t] / Math.max(1, tokens.length)) * idf(t)
  let norm = 0
  for (const t in vec) norm += vec[t] * vec[t]
  return { vec, norm: Math.sqrt(norm), tokens }
}

function cosine(qVec, qNorm, dVec, dNorm) {
  if (qNorm === 0 || dNorm === 0) return 0
  let dot = 0
  for (const t in qVec) {
    if (dVec[t]) dot += qVec[t] * dVec[t]
  }
  return dot / (qNorm * dNorm)
}

function retrieve(query, topK = 3) {
  const { vec, norm, tokens } = queryVector(query)
  const scored = KB.map((doc, i) => {
    const base = cosine(vec, norm, DOC_VECTORS[i].vec, DOC_VECTORS[i].norm)
    // Tag boost — direct tag matches strongly weighted.
    let tagBoost = 0
    for (const t of tokens) {
      if (doc.tags.some((tag) => tag.includes(t) || t.includes(tag))) tagBoost += 0.18
    }
    return { doc, score: base + tagBoost }
  })
  scored.sort((a, b) => b.score - a.score)
  return scored.filter((s) => s.score > 0.05).slice(0, topK)
}

// ─────────────────── 3. Intent layer ───────────────────

// A small set of intents that map common recruiter questions to richer,
// structured responses. Falls back to retrieval if no intent matches.

const INTENTS = [
  {
    name: 'greeting',
    test: (q) => /^(hi|hello|hey|yo|sup|hola)\b/i.test(q.trim()),
    respond: () => ({
      text:
        "Hey! I'm ARIA — Viren's AI assistant. I can tell you about his projects, experience, or anything on this site. " +
        "Try one of the suggestions below, or ask anything.",
    }),
  },
  {
    name: 'who_are_you',
    test: (q) => /who\s+(are|r)\s+you|what\s+are\s+you|whoami/i.test(q),
    respond: () => ({
      text:
        "I'm ARIA — an in-game NPC and a small retrieval engine built into this site. " +
        "I'm indexed over Viren's bio, education, projects, and experience. " +
        "Ask me what you'd ask in an interview.",
    }),
  },
  {
    name: 'who_is_viren',
    test: (q) => /(who('|i)?s|tell me about|about)\s+(viren|him|he|this person)/i.test(q),
    respond: () => ({
      text:
        `${profile.name} is a ${profile.title}. ` +
        `${profile.tagline} ` +
        `${profile.about.join(' ')}`,
      src: 'profile',
    }),
  },
  {
    name: 'why_hire',
    test: (q) => /(why\s+(hire|should i hire)|fit|good fit|stand out|stand-out|hire him|hire viren)/i.test(q),
    respond: () => ({
      text:
        "Three reasons in plain English:\n" +
        "1. He ships across the stack — gameplay systems, 3D environments, AI-powered tools. The studio you're standing in is built from scratch in his own engine code.\n" +
        "2. He's already deployed AI in the real world: a clinical app his father (a doctor) actually uses, and a Study Command Center for his classmates.\n" +
        "3. He's a student athlete with an ultramarathon background. Translation: he finishes things. Long projects don't faze him.",
      src: 'profile + experience',
    }),
  },
  {
    name: 'games',
    test: (q) => /(game|games|gameplay|design|unity|unreal|engine)/i.test(q),
    respond: () => {
      const gs = projects.filter((p) => p.type === 'game')
      const list = gs.map((p) => `• ${p.name} (${p.year}) — ${p.summary}`).join('\n')
      return {
        text:
          `Viren has shipped ${gs.length} game projects, all solo:\n${list}\n\n` +
          "Walk up to any of the arcade cabinets in the bottom half of the studio to play the previews.",
        src: 'projects (game)',
      }
    },
  },
  {
    name: 'ai',
    test: (q) => /(\bai\b|applied ai|chatbot|rag|llm|machine learning|ml)/i.test(q),
    respond: () => {
      const ai = projects.filter((p) => p.type === 'ai')
      const list = ai.map((p) => `• ${p.name} (${p.year}) — ${p.summary}`).join('\n')
      return {
        text:
          `On the Applied AI side, Viren has built:\n${list}\n\n` +
          "Both are real, deployed apps — not toy demos. Step up to the AI workstations in the top half of the studio to read more.",
        src: 'projects (ai)',
      }
    },
  },
  {
    name: 'contact',
    test: (q) => /(contact|email|reach|hire|message|get in touch|talk to)/i.test(q),
    respond: () => ({
      text:
        `Email: ${profile.email}\nGitHub: ${profile.links.find((l) => l.label === 'GitHub')?.url || ''}\n\n` +
        "You can also walk to the contact booth in the bottom-right corner of the studio.",
      src: 'contact',
    }),
  },
  {
    name: 'education',
    test: (q) => /(school|education|degree|university|college|scad|study|major|minor)/i.test(q),
    respond: () => {
      const e = education[0]
      return {
        text:
          `${e.degree} at ${e.school} (${e.location}). ${e.detail}`,
        src: 'education',
      }
    },
  },
  {
    name: 'experience_summary',
    test: (q) => /(experience|work|career|history|background|jobs|leadership|leader)/i.test(q),
    respond: () => {
      const lines = experience.slice(0, 5).map((e) => `• ${e.role} — ${e.org} (${e.dates || ''})`)
      return {
        text:
          "Highlights from Viren's experience:\n" +
          lines.join('\n') +
          "\n\nThe full timeline is in the trophy cabinet (bottom-left of the studio).",
        src: 'experience',
      }
    },
  },
  {
    name: 'ultra',
    test: (q) => /(ultra|la ultra|ultramarathon|ladakh|running|endurance|himalaya)/i.test(q),
    respond: () => ({
      text:
        "When he was a teenager, Viren was Race Director of the 55km category at La Ultra: The High — one of the world's most extreme ultramarathons, held between 12,000 and 15,500 ft in the Himalayas. He led a multi-functional team across remote terrain and managed athlete health, cut-off enforcement, and live operations. It's the experience that shaped how he handles long, hard projects.",
      src: 'experience',
    }),
  },
  {
    name: 'fifa',
    test: (q) => /(fifa|world cup|soccer|football)/i.test(q),
    respond: () => ({
      text:
        "Viren volunteered for the FIFA Club World Cup 2025 in Atlanta on the Ceremonies & Fan Operations team. He's also been selected to volunteer in anti-doping operations at the FIFA World Cup 2026.",
      src: 'experience',
    }),
  },
  {
    name: 'thanks',
    test: (q) => /(thanks|thank you|thx|appreciate|cheers|cool)/i.test(q),
    respond: () => ({
      text: "Anytime. If you'd like to reach out, the contact booth is in the bottom-right corner.",
    }),
  },
  {
    name: 'help',
    test: (q) => /(help|what can|what should|suggest|options|menu)/i.test(q),
    respond: () => ({
      text:
        "Try asking:\n• Why should I hire Viren?\n• What games has he made?\n• Tell me about his AI projects\n• What's the ultramarathon thing about?\n• How do I contact him?\n\nOr just walk around — every station in the studio opens up more info.",
    }),
  },
]

// ─────────────────── 4. Public API ───────────────────

export function ariaAnswer(query) {
  const q = (query || '').trim()
  if (!q) return { text: "Try asking me about Viren's games, AI projects, or experience.", src: null }

  // Intent first.
  for (const intent of INTENTS) {
    if (intent.test(q)) return intent.respond()
  }

  // Project-specific shortcuts (by name fragment).
  const projHit = projects.find((p) =>
    q.toLowerCase().includes(p.slug) ||
    q.toLowerCase().includes(p.name.toLowerCase()) ||
    (p.slug === 'study-command-center' && /study/i.test(q)) ||
    (p.slug === 'peggle' && /peggle/i.test(q)) ||
    (p.slug === 'top-down-shooter' && /top.?down|shooter/i.test(q)) ||
    (p.slug === '3d-environment' && /3d|environment|level|world/i.test(q)) ||
    (p.slug === 'la-ultra-running-plans' && /(running plan|patient|doctor|health)/i.test(q)),
  )
  if (projHit) {
    return {
      text: `${projHit.name} — ${projHit.summary}\n\n${(projHit.description || []).join(' ')}`,
      src: `project: ${projHit.name}`,
      openProjectSlug: projHit.slug,
    }
  }

  // Fallback to TF-IDF retrieval.
  const hits = retrieve(q, 2)
  if (hits.length === 0) {
    return {
      text:
        "I don't have a great answer for that. Try one of the suggestions below, or ask about Viren's projects, education, or experience.",
      src: null,
    }
  }

  const top = hits[0]
  const second = hits[1]
  const trimmed = top.doc.body.length > 360 ? top.doc.body.slice(0, 340) + '…' : top.doc.body
  const followup = second && second.score > 0.18
    ? `\n\nRelated: ${second.doc.title}.`
    : ''
  return {
    text: `${top.doc.title}\n\n${trimmed}${followup}`,
    src: top.doc.id,
  }
}

export const SUGGESTED_QUESTIONS = [
  'Why should I hire Viren?',
  'What games has he made?',
  'Tell me about his AI projects',
  "What's the ultramarathon thing?",
  'How do I contact him?',
]
