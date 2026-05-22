// Portfolio milestones. Each station maps to a guided step in the tracker.
// XP is kept as light progress feedback, but the framing stays portfolio-first.

export const QUESTS = [
  {
    id: 'about',
    title: 'Meet Viren',
    objective: 'Start with the profile pedestal',
    reward: '+50 XP - Profile context',
    completion: {
      headline: 'Milestone Saved: Profile Reviewed',
      sub: "You've seen who Viren is and what he is building.",
    },
  },
  {
    id: 'skills',
    title: 'Review Skills',
    objective: 'Open the Skills terminal',
    reward: '+80 XP - Skill map',
    completion: {
      headline: 'Milestone Saved: Skills Reviewed',
      sub: 'Game development, applied AI, tools, and endurance are mapped.',
    },
  },
  {
    id: 'project:study-command-center',
    title: 'Study Command Center',
    objective: 'Review the AI study console',
    reward: '+120 XP - Applied AI',
    completion: {
      headline: 'Milestone Saved: AI Project Reviewed',
      sub: 'A deployed RAG app that helps students work with their own materials.',
    },
  },
  {
    id: 'aria',
    title: "Ask Viren's Assistant",
    objective: "Chat with Viren's Assistant",
    reward: '+90 XP - Conversational AI',
    completion: {
      headline: 'Milestone Saved: Assistant Tested',
      sub: "Viren's Assistant runs entirely offline. Viren built that.",
    },
  },
  {
    id: 'project:la-ultra-running-plans',
    title: 'Patient Planning App',
    objective: 'Review the clinical AI workstation',
    reward: '+150 XP - Applied AI in practice',
    completion: {
      headline: 'Milestone Saved: Real-World AI Reviewed',
      sub: 'A practicing doctor uses this workflow in clinic.',
    },
  },
  {
    id: 'showreel',
    title: 'Film & Video Work',
    objective: 'Open the showreel station',
    reward: '+70 XP - Visual storytelling',
    completion: {
      headline: 'Milestone Saved: Reel Reviewed',
      sub: 'Documentary, ultramarathon, and impact-driven video work reviewed.',
    },
  },
  {
    id: 'project:top-down-shooter',
    title: 'Top-Down Shooter',
    objective: 'Review the arcade shooter prototype',
    reward: '+120 XP - Game feel',
    completion: {
      headline: 'Milestone Saved: Gameplay Prototype Reviewed',
      sub: 'Movement, wave AI, shooting feel, and feedback loops reviewed.',
    },
  },
  {
    id: 'project:peggle',
    title: 'Peggle Physics Prototype',
    objective: 'Review the physics and scoring prototype',
    reward: '+110 XP - Physics systems',
    completion: {
      headline: 'Milestone Saved: Physics Prototype Reviewed',
      sub: '2D physics, collision response, and scoring loops reviewed.',
    },
  },
  {
    id: 'project:3d-environment',
    title: '3D Environment Study',
    objective: 'Review the real-time environment scene',
    reward: '+130 XP - Environment art',
    completion: {
      headline: 'Milestone Saved: Environment Study Reviewed',
      sub: 'Composed, explorable real-time 3D space. Mood, lighting, atmosphere: all there.',
    },
  },
  {
    id: 'trophy',
    title: 'Experience Timeline',
    objective: 'Review the experience cabinet',
    reward: '+100 XP - Track record',
    completion: {
      headline: 'Milestone Saved: Experience Reviewed',
      sub: 'Leadership, operations, sport, film, and campus work reviewed.',
    },
  },
  {
    id: 'contact',
    title: 'Contact Viren',
    objective: 'Open the contact terminal',
    reward: '+999 XP - Contact ready',
    completion: {
      headline: 'Final Step: Contact Viren',
      sub: 'Use the terminal to send a message.',
    },
  },
]

export const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]))

const STORAGE_KEY = 'viren_exe_quests_v1'

export function loadCompletedQuests() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return new Set()
    return new Set(arr)
  } catch {
    return new Set()
  }
}

export function saveCompletedQuests(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    /* ignore quota / disabled storage */
  }
}
