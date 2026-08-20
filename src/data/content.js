// All site content in one place. Edit here to update the portfolio.
//
// Ground rule for this file: every claim is backed by the resume PDF in public/,
// a public repo, or a shipped URL. Nothing here is aspirational.

export const profile = {
  name: 'Viren Chauhan',
  title: 'Game Technology & Software Developer',
  subtitle:
    'I build game systems, developer tools, and intelligent software using C#, C++, Unreal Engine, Unity, and modern web technologies.',
  // Rotating suffix for the typed line under the title. Personality, not claims.
  typed: ['game systems', 'developer tools', 'intelligent software'],
  seeking: 'Seeking Software, Game Technology & AI Internships · 2027',
  resume: 'Viren-Chauhan-Resume.pdf',
  // Hero technology chips. Mirrors the Technical Skills block on the resume.
  heroTags: ['C#', 'C++', 'Unreal Engine', 'Unity', 'Python', 'Applied AI'],
  about: [
    "I'm a Game Design student at SCAD minoring in Applied AI, focused on software development, game technology, and intelligent developer tools. I enjoy building systems that combine strong engineering with thoughtful user experience.",
    'Most of what I build is systems work: gameplay systems in Unreal Engine and Unity, and full-stack products in React and Next.js that real people log into every day.',
    'Off the keyboard I run cross country and track for SCAD, with an ultra-endurance background that came from growing up around La Ultra: The High in the Indian Himalayas. It taught me to play the long game and finish what I start.',
  ],
  // Short plain-language line. Used by the (unrouted) explorer build.
  tagline:
    'I build game systems, developer tools, and software that people actually use, from the first idea to the version that ships.',
  // Honest framing of how AI fits into the workflow (Applied AI minor).
  aiAssisted:
    'I use AI-assisted development workflows for rapid prototyping, debugging, implementation, code exploration, and documentation while independently validating architecture and generated code.',
  email: 'chauhan.viren08@gmail.com',
  location: 'Atlanta, GA',
  links: [
    { label: 'GitHub', url: 'https://github.com/VirenChauhan19' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/viren-chauhan-7b1067333/' },
    { label: 'Email', url: 'mailto:chauhan.viren08@gmail.com' },
  ],
  photo: 'headshot.jpeg',
}

export const education = [
  {
    school: 'Savannah College of Art and Design (SCAD)',
    location: 'Atlanta, GA',
    degree: 'B.F.A. Game Design',
    minor: 'Minor: Applied AI',
    grad: 'May 2028',
    detail:
      'Relevant coursework: Programming, Game Design, Applied AI, UX/UI, Unity, and Unreal Engine. Student-athlete, SCAD Cross Country and Track.',
  },
]

// group: 'tech' renders under "Software & Game Technology", everything else
// under "Operations, Sport & Leadership" on the experience page.
export const experience = [
  {
    role: 'Independent Developer · Shipped Software',
    org: 'Self-directed',
    dates: '2025 - Present',
    location: 'Atlanta, GA',
    group: 'tech',
    bullets: [
      'Designed, built, and shipped three production web apps solo: a coaching platform with 134 registered users, a private operations platform the SCAD Atlanta distance team runs on, and a study tool that parses PDF syllabi and syncs deadlines to Google Calendar.',
      'Own the full stack on every build: UX and UI, Next.js or React front ends, Prisma + PostgreSQL or Firebase data layers, auth and role permissions, server-side API proxies, and deployment.',
      'Also built this portfolio site: React + Vite with hand-rolled, privacy-friendly visitor analytics on Supabase.',
    ],
  },
  {
    role: 'UX/UI Lead, SCADpro x Atlanta United',
    org: 'Atlanta United FC (Internship)',
    dates: 'Jan 2026 - Mar 2026',
    location: 'Atlanta, GA',
    group: 'tech',
    bullets: [
      'Led UX/UI work for an industry-partner project, collaborating across disciplines to translate product requirements into intuitive interactive experiences.',
      'Worked through iterative critiques and stakeholder feedback to prototype and refine those experiences, communicating design decisions across design, technology, and client teams.',
      'Project details are covered by an NDA.',
    ],
  },
  {
    role: 'Volunteer, Anti-Doping Team',
    org: 'FIFA World Cup 2026',
    dates: 'May 2026 - Jul 2026',
    location: 'Atlanta, GA',
    bullets: [
      'Selected as one of only 4 volunteers for the Anti-Doping Team out of more than 100,000 applications.',
      'Supported confidential tournament operations tied to athlete integrity, compliance, and professional event standards.',
      'Represented FIFA World Cup 2026 in a high-trust role that called for discretion, reliability, and a sharp eye for detail.',
    ],
  },
  {
    role: 'Chief Finance Officer, Student Athlete Advisory Committee',
    org: 'Savannah College of Art and Design',
    dates: 'Sep 2025 - Jun 2026',
    location: 'Atlanta, GA',
    bullets: [
      "Manage the committee's finance-related responsibilities as CFO of SAAC.",
      'Support student-athlete initiatives, event planning, and campus communication.',
    ],
  },
  {
    role: 'Guest Services Staff ("Playmaker")',
    org: 'Georgia World Congress Center Authority',
    dates: 'Mar 2026 - May 2026',
    location: 'Atlanta, GA',
    bullets: [
      'Worked with team members and event staff to keep operations smooth, adapting quickly in a fast-paced, high-volume environment.',
      'Gave direct guest support by answering questions, giving directions, and resolving issues to keep the event experience positive.',
    ],
  },
  {
    role: 'SCADHome Office Assistant',
    org: 'Savannah College of Art and Design',
    dates: 'Dec 2025 - Present',
    location: 'Atlanta, GA',
    bullets: [
      'Provide front desk support for residence life operations and help students with housing services and campus resources.',
      'Manage student inquiries and housing check-ins and check-outs through StarRez, and coordinate with residence life staff to resolve concerns.',
      'Support major campus housing events and assist community directors with day-to-day administrative operations.',
    ],
  },
  {
    role: 'SCADfit Front Desk',
    org: 'Savannah College of Art and Design',
    dates: 'Aug 2025 - Dec 2025',
    location: 'Atlanta, GA',
    bullets: [
      'Checked students and members in at the campus fitness center and kept the front desk running through every shift.',
      'Handled equipment checkout, facility access, and day-to-day questions so the gym stayed smooth and welcoming.',
    ],
  },
  {
    role: 'Intramurals and Recreational Assistant',
    org: 'Savannah College of Art and Design',
    dates: 'Aug 2025 - Nov 2025',
    location: 'Atlanta, GA',
    bullets: [
      'Helped run intramural sports and recreational programs, from setup and sign-ups to keeping games organized and on schedule.',
      'Supported students throughout activities and events, keeping things safe, fair, and fun.',
    ],
  },
  {
    role: 'Event Operations Volunteer',
    org: 'FIFA Club World Cup',
    dates: 'May 2025 - Jul 2025',
    location: 'Atlanta, GA',
    bullets: [
      'Supported Ceremonies and Fan Operations during FIFA Club World Cup 2025 matches in Atlanta.',
      'Helped with fan movement, seating guidance, event information, and overall matchday support inside the stadium.',
      'Worked alongside event staff and volunteers to support operations for a major international football tournament.',
    ],
  },
  {
    role: 'International Student Ambassador',
    org: 'Savannah College of Art and Design',
    dates: 'Mar 2025 - Sep 2025',
    location: 'Atlanta, GA',
    bullets: [
      'Represented SCAD to prospective and incoming international students, sharing what campus life and the student experience are really like.',
      'Helped new international students settle in and answered questions from students and families during orientation and events.',
    ],
  },
  {
    role: 'Student Athlete',
    org: 'Savannah College of Art and Design',
    dates: 'Dec 2024 - Present',
    location: 'Atlanta, GA',
    bullets: [
      'Train and compete in cross country and track as a SCAD student athlete while carrying a full course load.',
      'Balance daily training and competition with academics, built on an ultra-endurance background.',
    ],
  },
  {
    role: 'Core Crew to Race Director (55 km)',
    org: 'La Ultra: The High',
    dates: '2016 - 2019',
    bullets: [
      "Grew up around the race and worked on core crew from 2016; by the 10th edition (2019) directed the 55 km category of one of the world's most extreme ultramarathons, running operations between 12,000 ft and 15,500 ft in the Indian Himalayas.",
      'Risk mitigation: ran primary health assessments for every participant to confirm fitness for high-altitude exertion, and monitored medical reporting throughout the race.',
      'Stakeholder management: led a multi-functional team of medical personnel and aid-station volunteers, keeping real-time communication going across remote Himalayan terrain.',
      'Protocol enforcement: handled the sensitive process of disqualifying athletes on cut-off times, putting participant safety and race integrity first through clear communication and conflict resolution.',
    ],
    media: [{ type: 'youtube', src: 'qswe4uUq1lc', caption: 'La Ultra: The High' }],
  },
  {
    role: 'Assistant Production Executive',
    org: 'Moving Mountains Within (Documentary Film)',
    dates: '2019',
    detail:
      'Contributed to an award-winning documentary covering the 2019 La Ultra ultramarathon in Ladakh.',
    media: [{ type: 'youtube', src: 'FJnZ0Qukpjo', caption: 'Moving Mountains Within' }],
  },
]

// Technical skills as clean categories, no self-rated percentage bars.
// Every item below appears on the resume, in a public repo, or in a shipped project.
export const skillGroups = [
  {
    id: 'languages',
    label: 'Languages',
    note: 'C# and JavaScript/TypeScript daily; C++ and Python from coursework and tooling.',
    items: ['C#', 'C++', 'Python', 'JavaScript', 'TypeScript', 'SQL'],
  },
  {
    id: 'game',
    label: 'Game Technology',
    note: 'Gameplay systems, VFX, and profiling in Unreal Engine 5 and Unity.',
    items: [
      'Unreal Engine 5',
      'Unity',
      'Blueprints',
      'Niagara',
      'PCG',
      'Gameplay Systems',
      'Physics Systems',
      'UI / HUD Systems',
      'Performance Profiling',
    ],
  },
  {
    id: 'software',
    label: 'Software & Web',
    note: 'Full-stack product work, from the data model to the deployed URL.',
    items: [
      'React',
      'Next.js',
      'Node.js',
      'Firebase',
      'Firestore',
      'Prisma',
      'PostgreSQL',
      'REST APIs',
      'Supabase',
      'Vite',
      'Tailwind CSS',
      'Git & GitHub',
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    note: 'Shipped LLM features behind server-side proxies, plus Applied AI coursework.',
    items: [
      'LLM APIs',
      'Agentic Workflows',
      'AI-Assisted Development',
      'Prompt Engineering',
      'Document Parsing',
      'Retrieval-Grounded Chat',
      'Rapid Prototyping',
    ],
  },
  {
    id: 'design',
    label: 'Design & Tools',
    note: 'The art and UX side of the pipeline.',
    items: [
      'Figma',
      'UX / UI Design',
      'Autodesk Maya',
      'Substance Painter',
      'Adobe Creative Suite',
      'Visual Studio',
    ],
  },
]

// Back-compat: the unrouted /src/game explorer still reads a flat skill list.
export const skills = skillGroups.flatMap((g) =>
  g.items.map((name) => ({ id: `${g.id}-${name}`, branch: g.id, name, desc: g.note })),
)

// filters: which tab on /projects a project appears under (a project can sit in
// more than one). type: 'game' | 'ai' drives the accent and card treatment.
// aliases: older slugs that should still resolve, so shared links keep working.
export const projects = [
  {
    slug: 'dynamic-weather-system',
    aliases: ['the-collision'],
    name: 'Dynamic Weather & Environment System',
    type: 'game',
    filters: ['game'],
    featured: true,
    year: '2026',
    category: 'Unreal Engine · Gameplay Systems',
    role: 'Solo gameplay programmer: systems, VFX integration, and optimization',
    disciplines: [
      'Gameplay Systems',
      'VFX (Niagara)',
      'Procedural Generation (PCG)',
      'Performance Profiling',
    ],
    summary:
      'A real-time weather system in Unreal Engine 5 with dynamic rain and snow, Niagara effects, volumetric clouds, lightning, a player weather-collection mechanic, environmental state changes, and a full profiling and optimization pass.',
    metric: { value: '~18 ms to ~13-14 ms', label: 'GPU frame time after profiling' },
    tech: [
      'Unreal Engine 5',
      'Blueprints',
      'Niagara',
      'PCG',
      'Volumetric Clouds',
      'Gameplay Systems',
      'HUD',
      'Performance Profiling',
    ],
    systems: [
      'Dynamic rain',
      'Dynamic snow',
      'Niagara particle systems',
      'Volumetric clouds',
      'Lightning & audio',
      'Weather collection mechanic',
      'Environmental state changes',
      'PCG territory generation',
      'Real-time HUD feedback',
      'Profiling & optimization',
    ],
    study: {
      overview:
        'A single Unreal Engine 5 level where a storm front and a snow front fight over the same world. Every weather system in the scene reads from one shared balance value, so the environment changes state in real time as the player plays.',
      problem:
        'Weather in a level is usually set dressing: it plays, and nothing else cares. I wanted weather to be a gameplay system the player can push on, that the rest of the world reacts to, and that still holds frame rate when both fronts run at once.',
      built: [
        'One authoritative balance value that every other system subscribes to, with a contested middle range where both fronts render at the same time.',
        'Niagara rain and snow emitters whose spawn rate and intensity are driven by that value instead of being switched on and off.',
        'A weather collection mechanic: the player gathers weather, which shifts the balance value and flips the world toward one side.',
        'PCG-generated crystal territory that regenerates per side as the balance shifts, with collision disabled so the player never snags on it.',
        'Lightning, audio cues, volumetric clouds, and emissive lighting tied to the same state.',
        'A real-time HUD that reads the balance value back to the player, so the system stays legible while you play.',
      ],
      architecture: {
        caption: 'One value in, every system reads from it.',
        flow: [
          { label: 'Player input', note: 'weather collection mechanic' },
          { label: 'Weather balance value', note: 'single source of truth, storm to snow' },
          {
            label: 'Subscribed systems',
            note: 'Niagara VFX · PCG territory · lightning & audio · volumetric clouds · emissive lighting',
            fan: true,
          },
          { label: 'Real-time HUD', note: 'current state read back to the player' },
        ],
      },
      challenges: [
        {
          t: 'Everything ran at full cost, all the time',
          p: 'With both weather fronts and the PCG territory live, the heavy Niagara emitters and procedural meshes ran at full strength even when the balance value meant they were barely visible. GPU time sat around 18 ms in the heavy-weather test.',
          s: 'I profiled with Stat Unit, Stat GPU, and Shader Complexity to find what actually cost the frame, then made the expensive weather and PCG scale with the balance value instead of running flat out. GPU time dropped to roughly 13-14 ms in the same test.',
        },
        {
          t: 'PCG geometry fought the player',
          p: 'The procedurally generated territory spawned collision meshes the player caught on while moving through a transition.',
          s: 'Stripped collision from the generated territory so it stays purely visual, and tied regeneration to the balance threshold so it does not thrash every frame.',
        },
        {
          t: 'Hard state flips looked wrong',
          p: 'Switching cleanly between storm and snow read as a cut, not as weather.',
          s: 'Added a contested middle band where both sides render together at reduced intensity, so the world crossfades through the transition instead of snapping.',
        },
      ],
      result: [
        'GPU frame time in the heavy-weather test went from about 18 ms to about 13-14 ms after the profiling pass.',
        'Weather became a gameplay system the player can act on, not a background effect.',
        'One balance value drives VFX, procedural geometry, lighting, audio, and UI, so adding a new reactive system means subscribing to one number.',
      ],
    },
    media: [{ type: 'video', src: 'the-collision.mp4', poster: 'the-collision-poster.jpg', caption: 'Live gameplay capture' }],
    live: null,
    repo: null,
    accessNote: 'Coursework project · source not public',
  },
  {
    slug: 'la-ultra-running-plans',
    aliases: ['la-ultra'],
    name: 'La Ultra: AI Running & Coaching Platform',
    type: 'ai',
    filters: ['software', 'ai'],
    featured: true,
    demo: 'laultra',
    year: '2026',
    category: 'Full-Stack Product · AI',
    role: 'Solo: product, UX, front end, data model, auth, AI proxy, deploy',
    disciplines: [
      'Full-Stack Development',
      'AI Integration',
      'Auth & Roles',
      'Data Modeling',
      'UX Design',
    ],
    summary:
      'A deployed React and Firebase coaching platform built with a sports-medicine physician, with 134 registered users. It runs a gated onboarding, a daily readiness journal that auto-adjusts the training plan, a fixed 90-day program, a 23-exercise movement library, trend analytics, an AI coach behind a server-side proxy, and an admin dashboard across all users.',
    metric: { value: '134+', label: 'registered users' },
    tech: [
      'React',
      'Vite',
      'Firebase Auth',
      'Firestore',
      'Firebase Functions',
      'LLM API',
      'Recharts',
      'Web Audio API',
      'PWA',
    ],
    systems: [
      'Gated onboarding flow',
      'Google auth + guest mode',
      '10-factor readiness journal',
      'Auto plan adjustment',
      'Fixed 90-day program',
      '23-exercise movement library',
      'Trend analytics dashboard',
      'Race-pace calculator',
      'AI coach via server proxy',
      'Admin all-user dashboard',
      'Offline localStorage fallback',
    ],
    study: {
      overview:
        'A progressive web app built for Dr. Rajat Chauhan, a sports-exercise medicine consultant, to turn 25 years of clinical methodology into a daily tool his patients and readers can actually use. It is live and has 134 registered users.',
      problem:
        'The method is taught verbally in consultations and does not survive between appointments. Runners train by numbers from a watch instead of by how their body feels, and no existing app asks the first question: should you be running today at all?',
      built: [
        'A four-step onboarding capturing profile, biometrics, injury and movement history, and path selection, which gates the rest of the app until it is complete.',
        'A daily journal of ten factors scored 0 to 10 across body, mind, and movement, averaged into a single readiness score.',
        'Plan auto-adjustment: when that score drops below threshold, the training plan for the day changes automatically.',
        'A fixed 90-day program per user path, plus a race-time-to-training-zone pace calculator and a weekly plan builder.',
        'A 23-exercise movement library with per-category cadence driven by a Web Audio API metronome.',
        'A history dashboard with Recharts trend lines for readiness, perceived effort, and session quality over time.',
        'An AI coach that reaches the model through a Firebase Function proxy, so the API key never ships to the browser, with a system prompt that requires it to ask how you feel before giving training advice.',
        'An admin dashboard built on a Firestore collection-group query for an all-user view.',
        'Offline-first data: every write also lands in localStorage, a 4-second safety timeout falls back if Firestore does not respond, and guest data migrates into Firestore on first sign-in.',
      ],
      architecture: {
        caption: 'The model key lives server-side, never in the client bundle.',
        flow: [
          { label: 'React + Vite PWA', note: 'journal · library · coach · history' },
          { label: 'Firebase Authentication', note: 'Google sign-in or guest mode' },
          { label: 'Firestore + localStorage', note: 'sync with offline fallback' },
          { label: 'Firebase Function proxy', note: 'holds the server-side secret' },
          { label: 'LLM API', note: 'context-aware coaching responses' },
        ],
      },
      challenges: [
        {
          t: 'The morning routine could not break on bad wifi',
          p: 'The primary user travels internationally and journals at 6am, sometimes on airplane wifi. A hanging Firestore read would have made the app unusable exactly when it mattered.',
          s: 'Every write goes to localStorage and Firestore in parallel, reads fall back to localStorage, and a 4-second safety timeout gives up on the network instead of blocking the UI. Guest data migrates into Firestore on first sign-in.',
        },
        {
          t: 'An LLM key cannot ship in a client bundle',
          p: 'The AI coach runs entirely in the browser, so calling the model directly would have exposed the API key to anyone who opened devtools.',
          s: 'Routed every model call through a Firebase Function that holds the secret server-side, and put the coaching system prompt there too so it cannot be swapped from the client.',
        },
        {
          t: 'The metronome drifted',
          p: 'The first metronome used setInterval. By rep 8 of a 10-second cadence the timing was off by enough to matter clinically.',
          s: 'Rebuilt it on the Web Audio API with scheduled audio events instead of timers, and added a visual beat indicator plus an in-screen tempo control so users do not lose their place mid-set.',
        },
      ],
      result: [
        '134 registered users as of July 2026, with new sign-ups every week.',
        'Shipped and in daily use by the physician it was built with, and by his patients and readers.',
        'Tested continuously against the domain expert: 160 commits across 16 active days, with dated feedback documents driving the changes.',
      ],
    },
    live: 'https://laultrarunandbee.web.app/',
    repo: 'https://github.com/VirenChauhan19/La-Ultra-Run-and-Bee-App',
  },
  {
    slug: 'starwave',
    aliases: ['top-down-shooter'],
    name: 'Starwave: Modular Gameplay Systems',
    type: 'game',
    filters: ['game'],
    year: '2024',
    category: 'Unity · C# Gameplay Systems',
    role: 'Solo gameplay programmer: every system written in C#',
    disciplines: [
      'Gameplay Programming',
      'Systems Design',
      'Enemy AI',
      'Game State Management',
    ],
    summary:
      'A 2D top-down shooter in Unity built as a set of reusable C# gameplay systems: enemy waves, boss encounters, player health and lives, scoring and high-score tracking, power-ups, difficulty progression, controller input, and pause and game-state management.',
    metric: { value: '8 systems', label: 'built to be reused, not one-off scripts' },
    tech: [
      'Unity',
      'C#',
      'Enemy AI & Wave Spawning',
      'Game State Management',
      'Controller Input',
      'Photoshop (sprites & UI)',
    ],
    systems: [
      'Wave Manager',
      'Boss System',
      'Health & Lives System',
      'Power-Up System',
      'Score & High Score',
      'Difficulty Progression',
      'Controller Support',
      'Pause & Game State',
    ],
    study: {
      overview:
        'A complete arcade game loop in Unity, written so each part is a system with one clear responsibility rather than logic piled into a single player script.',
      problem:
        'My earlier Unity projects put everything on the player: spawning, scoring, UI updates, state. Adding a boss or a power-up meant editing the same file every time and breaking two other things. This project was about fixing that.',
      built: [
        'A Wave Manager that owns spawn timing, composition, and pacing, and raises the pressure wave by wave.',
        'A Boss System that interrupts the wave cycle with its own encounter state and health handling.',
        'A Health and Lives system shared by the player and enemies, so damage, death, and respawn behave the same everywhere.',
        'A Power-Up system that applies timed modifiers without the player script knowing what a power-up is.',
        'Score and persistent high-score tracking, wired to UI through state rather than direct references.',
        'Difficulty progression driven from the wave count, so the curve is tuned in one place.',
        'Controller support alongside keyboard and mouse.',
        'Pause and game-state management: play, pause, boss, game over, restart.',
      ],
      architecture: {
        caption: 'Game state at the top; systems read from it instead of from each other.',
        flow: [
          { label: 'Game State Manager', note: 'play · pause · boss · game over' },
          {
            label: 'Gameplay systems',
            note: 'Wave Manager · Boss System · Health & Lives · Power-Ups · Difficulty',
            fan: true,
          },
          { label: 'Score & High Score', note: 'persisted between runs' },
          { label: 'UI layer', note: 'HUD, pause menu, and game-over screen react to state' },
        ],
      },
      challenges: [
        {
          t: 'Systems knew too much about each other',
          p: 'The first pass had the player script spawning enemies, updating the HUD, and tracking score, so every new feature meant editing it again.',
          s: 'Pulled each responsibility into its own system with a narrow interface, and made game state the thing they all read from instead of each other.',
        },
        {
          t: 'Pausing broke the wave timing',
          p: 'Timers kept running while paused, so unpausing dumped a backlog of spawns into the arena at once.',
          s: 'Moved wave timing onto scaled time and gave the state manager ownership of pause, so every system freezes and resumes from one place.',
        },
        {
          t: 'Two input methods, one feel',
          p: 'Aiming with a mouse and aiming with a right stick want different code paths but have to feel identical.',
          s: 'Normalized both into a single aim direction the shooting system consumes, so combat behaves the same regardless of what you are holding.',
        },
      ],
      result: [
        'A complete, playable loop: waves, a boss, power-ups, scoring, difficulty progression, and full game-state handling.',
        'Adding a new enemy type or power-up touches one system instead of the whole project.',
        'The same system boundaries carried straight into my later Unreal work.',
      ],
    },
    media: [{ type: 'video', src: 'top-down-shooter.mp4', poster: 'top-down-shooter-poster.jpg', caption: 'Gameplay capture' }],
    live: null,
    repo: null,
    accessNote: 'Coursework project · source not public',
  },
  {
    slug: 'scad-distance-team-hub',
    name: 'SCAD Distance Team Hub',
    type: 'ai',
    filters: ['software'],
    demo: 'xc',
    year: '2026',
    category: 'Full-Stack Product · Workflow Automation',
    role: 'Solo: data model, auth, roles, front end, deploy',
    disciplines: [
      'Full-Stack Development',
      'Auth & Role Permissions',
      'Data Modeling',
      'UX Design',
    ],
    summary:
      'An internal operations platform for a college distance squad: personalized workout scheduling, a shared calendar, team announcements, coach-to-athlete messaging, and post-workout feedback, with strict server-enforced coach and athlete roles.',
    metric: { value: '~20 athletes', label: 'on one roster, one schedule source' },
    tech: [
      'Next.js 15',
      'React 19',
      'TypeScript',
      'Tailwind CSS',
      'Prisma',
      'PostgreSQL',
      'JWT Sessions',
      'Cloud Run',
    ],
    systems: [
      'Custom JWT session auth',
      'Coach / athlete role gates',
      'Roster management',
      'Workout assignment engine',
      'Shared team calendar',
      'Announcements channel',
      'Direct messaging',
      'Post-workout feedback loop',
    ],
    study: {
      overview:
        'A private, full-stack team platform for the SCAD Atlanta cross country and track squad. The coach assigns training to about twenty athletes, everyone works from one calendar, and honest post-workout feedback comes back through the app instead of through group chats.',
      problem:
        'Training lived across group chats, spreadsheets, and screenshots. The coach rebuilt the same information in three places every week, and nobody could tell at a glance who had actually completed a session.',
      built: [
        'Custom JWT session auth in HTTP-only cookies with two server-enforced roles, so an athlete can never load another athlete data.',
        'A workout builder where a session is created once and assigned to the whole team or to specific athletes, with per-athlete notes on any assignment.',
        'A coach dashboard: roster status, week-completion percentage, unread counts, a "need to discuss" queue, and a live feed of incoming feedback.',
        'An athlete view with the full session for today, a 7-day strip, quick status buttons, and a feedback form covering effort, how it felt, and soreness.',
        'A colour-coded month calendar scoped by role: the coach sees the whole team, athletes see only their own sessions.',
        'A team announcement channel plus private coach-to-athlete threads with unread indicators.',
        'Soft-archive on athlete removal, so historical training data survives roster changes.',
      ],
      architecture: {
        caption: 'Role checks run on the server, not in the client.',
        flow: [
          { label: 'Next.js App Router', note: 'coach and athlete dashboards' },
          { label: 'JWT session middleware', note: 'HTTP-only cookies, role resolved server-side' },
          { label: 'Server actions & route handlers', note: 'every read scoped to the caller role' },
          { label: 'Prisma ORM', note: 'typed data access layer' },
          { label: 'PostgreSQL', note: 'roster · workouts · feedback · messages' },
        ],
      },
      challenges: [
        {
          t: 'Role leakage is a real privacy problem here',
          p: 'Soreness notes and private feedback are sensitive. Hiding them in the UI is not enough: one crafted request would have exposed another athlete data.',
          s: 'Every query is scoped by the session role on the server before it runs, so the data never reaches the client at all. The UI hides nothing that the API would have returned anyway.',
        },
        {
          t: 'Removing an athlete destroyed history',
          p: 'A hard delete on a roster change wiped that athlete workouts and feedback, which the coach needed to keep.',
          s: 'Switched removal to a soft archive: the athlete leaves the active roster, the training record stays intact and queryable.',
        },
        {
          t: 'Assigning the same workout twenty times',
          p: 'The original flow made the coach create one session per athlete, which is exactly the repetitive work the platform was supposed to remove.',
          s: 'Made assignment a separate concept from the workout itself: build once, assign to the team or a subset, then layer per-athlete notes on top.',
        },
      ],
      result: [
        'The whole squad works from one schedule instead of three chat threads and a spreadsheet.',
        'The coach sees completion and feedback for the full roster in one view rather than chasing individuals.',
        'The 24-week periodized plan lives in the app, seeded straight from the team existing spreadsheet.',
      ],
    },
    live: 'https://scadxctf.web.app/',
    repo: 'https://github.com/VirenChauhan19/Coach',
  },
  {
    slug: 'study-command-center',
    name: 'Study Command Center',
    type: 'ai',
    filters: ['software', 'ai'],
    demo: 'study',
    year: '2025',
    category: 'Developer Tooling · AI',
    role: 'Solo: front end, PDF pipeline, AI integration, deploy',
    disciplines: [
      'Front-End Development',
      'Document Parsing',
      'AI Integration',
      'API Integration',
    ],
    summary:
      'A React academic dashboard that parses a PDF syllabus, extracts assignment and exam deadlines into a typed data model, pushes them to Google Calendar, and answers questions grounded in the student own uploaded documents.',
    metric: { value: 'PDF to calendar', label: 'deadlines out of documents, automatically' },
    tech: [
      'React 19',
      'Vite',
      'pdfjs-dist',
      'LLM API',
      'Google OAuth 2.0',
      'Google Calendar API',
      'localStorage',
    ],
    systems: [
      'PDF text extraction',
      'Deadline extraction to typed model',
      'Urgency computation',
      'Google OAuth 2.0',
      'Google Calendar sync',
      'Document-grounded chat',
      'AI study notes & quizzes',
    ],
    study: {
      overview:
        'An assignment tracker for a student juggling four to six courses, each with its own PDF syllabus. It turns those PDFs into structured deadlines, gets them into the calendar the student already uses, and lets them ask questions against their own material.',
      problem:
        'Deadlines live in PDFs, not calendars. Students miss them because nothing bridges the gap, and re-typing a semester of dates by hand is exactly the kind of work nobody does twice.',
      built: [
        'A PDF pipeline using pdfjs-dist that pulls raw text out of an uploaded syllabus in the browser.',
        'Extraction into a typed assignment model defined before any code was written: title, course, due date, weight, type, urgency, description, notes.',
        'Urgency computed from due date and completion state, driving the dashboard sort and colour.',
        'Google OAuth 2.0 sign-in and one-way sync of extracted deadlines into Google Calendar.',
        'A chat panel that answers only from the uploaded documents, so it can quote the real late policy instead of inventing one.',
        'AI-generated study notes and quizzes per assignment.',
        'localStorage persistence, so the app runs with no backend to deploy or pay for.',
      ],
      architecture: {
        caption: 'No server: parsing happens in the browser, state lives on the device.',
        flow: [
          { label: 'PDF upload', note: 'syllabus and notes' },
          { label: 'pdfjs-dist text extraction', note: 'runs client-side' },
          { label: 'LLM extraction', note: 'raw text to typed assignment objects' },
          {
            label: 'Outputs',
            note: 'dashboard · Google Calendar sync · document-grounded chat',
            fan: true,
          },
          { label: 'localStorage', note: 'persistence with no backend' },
        ],
      },
      challenges: [
        {
          t: 'Syllabus PDFs have no common shape',
          p: 'Every professor formats dates differently, and extracted PDF text arrives with broken line order and stray table fragments.',
          s: 'Defined the target data model first and made extraction fill that model rather than trusting free-form output, so anything malformed fails a field check instead of landing in the dashboard as a bad date.',
        },
        {
          t: 'A grounded assistant that stays grounded',
          p: 'A general chat model will happily answer "when is the midterm" with a plausible date it made up.',
          s: 'Scoped the chat context to the extracted document text, so answers come from the student own material and the assistant has nothing to fall back on when the documents do not cover the question.',
        },
      ],
      result: [
        'A semester of deadlines goes from a PDF into Google Calendar without manual entry.',
        'Deployed and usable at a public URL with no backend to maintain.',
      ],
    },
    live: 'https://virenchauhan19.github.io/ReactBox/',
    repo: 'https://github.com/VirenChauhan19/ReactBox',
  },
  {
    slug: 'peggle',
    name: 'Peggle-Style Physics Game',
    type: 'game',
    filters: ['game'],
    year: '2024',
    category: 'Unity · C# Physics',
    role: 'Solo: launch mechanics, physics tuning, game logic',
    disciplines: ['Physics Programming', 'Gameplay Programming', 'Game Logic'],
    summary:
      'A 2D physics game in Unity: projectile launching with trajectory prediction, collision-driven peg clearing, audio feedback, real-time UI, and win/lose states, all scripted in C#.',
    tech: [
      'Unity',
      'C#',
      '2D Physics & Collision',
      'Trajectory Prediction',
      'Scoring & Level Logic',
      'Photoshop (board art)',
    ],
    systems: [
      'Launch mechanics',
      'Trajectory prediction',
      'Collision response tuning',
      'Peg clearing & scoring',
      'Audio feedback',
      'Win / lose states',
    ],
    study: {
      overview:
        'A Peggle-style single-shot physics game, built to recreate a loop that is genuinely hard to put down: aim, launch, and let the simulation do the rest.',
      problem:
        'The whole game lives or dies on how the bounce feels. Too predictable and there is no reason to take a second shot; too chaotic and the player stops believing their aim matters.',
      built: [
        'Launch mechanics with an aiming visualization and trajectory prediction, so the player can read the first bounce before committing.',
        'Collision response tuned on top of Unity 2D physics for peg hits and board bounces.',
        'Peg clearing, scoring, and level layouts written in C# on top of the physics layer.',
        'Audio feedback on every collision, and real-time UI updates for score and shots remaining.',
        'Win and lose state handling, with progression between layouts.',
      ],
      challenges: [
        {
          t: 'Predictable enough to aim, chaotic enough to be fun',
          p: 'Default physics either sent the ball on rails or scattered it so widely that aiming was pointless.',
          s: 'Tuned restitution and collision response until a shot rewards good aim on the first two bounces and goes genuinely uncertain after that, which is where the tension lives.',
        },
      ],
      result: [
        'A complete arcade loop with prediction, scoring, audio feedback, and progression.',
        'Bounce dynamics tuned so shots feel fair without ever feeling solved.',
      ],
    },
    media: [{ type: 'video', src: 'peggle.mp4', poster: 'peggle-poster.jpg', caption: 'Gameplay capture' }],
    live: null,
    repo: null,
    accessNote: 'Coursework project · source not public',
  },
  {
    slug: 'medieval-environment',
    name: 'Medieval Environment',
    type: 'game',
    filters: ['game'],
    year: '2026',
    category: 'Unreal Engine · Real-Time 3D',
    role: 'Solo: modeling, texturing, lighting, real-time scene',
    disciplines: [
      '3D / Environment Art',
      'Modeling',
      'PBR Texturing',
      'Lighting',
      'Real-Time Rendering',
    ],
    summary:
      'A real-time medieval interior built end to end: modeled in Maya, textured in Substance Painter, then assembled, lit, and rendered as a cinematic flythrough in Unreal Engine.',
    tech: ['Unreal Engine 5', 'Autodesk Maya', 'Substance Painter', 'PBR Texturing', 'Lighting'],
    systems: [],
    study: {
      overview:
        'A dim medieval interior: brick corridors, wooden benches, barred gates, and a shrine where a sword stands on a pedestal, lit by candles and volumetric light.',
      problem:
        'Environment scenes fall apart when they are a pile of props instead of a place. The goal was a space that reads as lived-in from any camera angle.',
      built: [
        'Custom assets modeled in Autodesk Maya.',
        'PBR texturing in Substance Painter.',
        'Scene assembly, material setup, and lighting in Unreal Engine 5.',
        'A cinematic camera flythrough rendered in real time.',
      ],
      result: [
        'Full pipeline handled solo, from model to lit real-time scene.',
        'Atmosphere carried by candlelight, volumetric glow, and a controlled palette rather than asset count.',
      ],
    },
    media: [{ type: 'video', src: 'unreal-environment.mp4', poster: 'unreal-environment-poster.jpg', caption: 'Real-time flythrough, Unreal Engine' }],
    live: null,
    repo: null,
    accessNote: 'Coursework project · source not public',
  },
  {
    slug: '3d-environment',
    name: '3D Environment',
    type: 'game',
    filters: ['game'],
    year: '2024',
    category: 'Unreal Engine · Real-Time 3D',
    role: 'Solo: full pipeline, modeling through lighting',
    disciplines: [
      '3D / Environment Art',
      'Modeling',
      'Texturing',
      'Lighting',
      'Real-Time Rendering',
    ],
    summary:
      'My first full pass at the real-time environment pipeline: modeled in Maya, textured with Substance Painter and Photoshop, then assembled and lit in Unreal Engine.',
    tech: [
      'Unreal Engine 5',
      'Autodesk Maya',
      'Substance Painter',
      'Photoshop',
      'Lighting & Composition',
    ],
    systems: [],
    study: {
      overview:
        'A complete explorable scene taken from nothing to finished, touching every tool in the chain: Maya, Substance Painter, Photoshop, and Unreal Engine.',
      problem:
        'Learning the pipeline end to end rather than handing off between stages, so I understand what each step costs the next one.',
      built: [
        'Asset modeling in Autodesk Maya.',
        'Texturing in Substance Painter, with Photoshop for supporting texture work.',
        'Scene assembly, lighting, and real-time rendering in Unreal Engine.',
      ],
      result: [
        'A real-time explorable scene, not a pre-rendered still.',
        'Composition first, then lighting and mood, so the space reads as a place instead of a collection of props.',
      ],
    },
    media: [{ type: 'video', src: 'game236.mp4', poster: 'game236-poster.jpg', caption: 'Environment walkthrough' }],
    live: null,
    repo: null,
    accessNote: 'Coursework project · source not public',
  },
]
