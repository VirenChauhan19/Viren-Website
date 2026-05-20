// Quest definitions. Each station that should appear in the tracker maps
// to a quest object. The tracker shows them in order; completing a quest
// triggers the "Quest Completed" overlay using `completion.headline` /
// `completion.sub` / `reward`.

export const QUESTS = [
  {
    id: 'about',
    title: 'Meet the Operator',
    objective: 'Talk to Viren at the profile pedestal',
    reward: '+50 XP · Lore Unlocked',
    completion: {
      headline: 'Quest Completed: Met the Operator',
      sub: "You've seen who you're dealing with. Worth recruiting.",
    },
  },
  {
    id: 'skills',
    title: 'Inspect the Perk Tree',
    objective: 'Open the Skills terminal and review the loadout',
    reward: '+80 XP · Loadout Revealed',
    completion: {
      headline: 'Achievement Unlocked: Loadout Confirmed',
      sub: 'Game Dev, Applied AI, Tools, Endurance — all green.',
    },
  },
  {
    id: 'project:study-command-center',
    title: 'The Calendar Heist',
    objective: 'Boot the AI Study Console',
    reward: '+120 XP · Skill: Applied AI',
    completion: {
      headline: 'Quest Completed: AI Engineer Confirmed',
      sub: 'A deployed RAG app that students actually use. Hire him.',
    },
  },
  {
    id: 'aria',
    title: 'Interrogate the NPC',
    objective: 'Chat with ARIA',
    reward: '+90 XP · Conversational AI Verified',
    completion: {
      headline: 'Quest Completed: Conversational AI Verified',
      sub: 'ARIA runs entirely offline — Viren built that.',
    },
  },
  {
    id: 'project:la-ultra-running-plans',
    title: 'Field Trial: The Clinic',
    objective: 'Examine the Patient App workstation',
    reward: '+150 XP · Skill: Applied AI for the Real World',
    completion: {
      headline: 'Quest Completed: Ships AI to Real Users',
      sub: "A practicing doctor uses this in clinic. That's the bar he ships at.",
    },
  },
  {
    id: 'showreel',
    title: 'Roll the Reel',
    objective: 'Watch the Showreel TV',
    reward: '+70 XP · Visual Storytelling',
    completion: {
      headline: 'Quest Completed: Visual Storyteller',
      sub: 'Award-adjacent documentary credit at age 19.',
    },
  },
  {
    id: 'project:top-down-shooter',
    title: 'Boss Rush: Top-Down',
    objective: 'Play the Top-Down Shooter cabinet',
    reward: '+120 XP · Skill: Game Feel',
    completion: {
      headline: 'Quest Completed: Tight Gameplay Confirmed',
      sub: 'Snappy controls, wave AI, satisfying feedback. Hire your gameplay programmer.',
    },
  },
  {
    id: 'project:peggle',
    title: 'Physics 101',
    objective: 'Play the Peggle-style cabinet',
    reward: '+110 XP · Skill: Physics & Systems',
    completion: {
      headline: 'Quest Completed: Physics Engineer Found',
      sub: '2D physics, collision response, scoring loops — under control.',
    },
  },
  {
    id: 'project:3d-environment',
    title: 'The Wanderer',
    objective: 'Step into the 3D Environment cabinet',
    reward: '+130 XP · Skill: Environment Art',
    completion: {
      headline: 'Quest Completed: Environment Artist Spotted',
      sub: 'Composed, explorable real-time 3D space. Mood, lighting, atmosphere — all there.',
    },
  },
  {
    id: 'trophy',
    title: 'Read the Mission Log',
    objective: 'Inspect the Trophy Cabinet (Experience)',
    reward: '+100 XP · Trust Established',
    completion: {
      headline: 'Quest Completed: Track Record Verified',
      sub: 'Race director, FIFA volunteer, ambassador, student athlete. He delivers.',
    },
  },
  {
    id: 'contact',
    title: 'Final Objective: Recruit Viren',
    objective: 'Reach the Recruitment Terminal',
    reward: '+999 XP · NEW PARTY MEMBER',
    completion: {
      headline: 'Final Objective Unlocked: Recruit Viren',
      sub: 'Press the button below to send a message. He replies within a day.',
    },
  },
]

export const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]))

// localStorage helpers
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
