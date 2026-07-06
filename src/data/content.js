// All site content in one place. Edit here to update the portfolio.

export const profile = {
  name: 'Viren Chauhan',
  title: 'Software & Game Developer · Front-End, Real-Time 3D & Applied AI',
  seeking: 'Open to Summer 2027 SWE & game dev internships',
  resume: 'Viren-Chauhan-Resume.pdf',
  tagline:
    "I build web apps, games, and tools that people actually use. I like owning the whole thing, from the first idea to the version that ships.",
  about: [
    "I'm a software developer and a game developer, and I care most about how a thing feels to use — the front end of an app or the moment-to-moment feel of a game loop. Right now I'm finishing a B.F.A. in Game Development at SCAD in Atlanta, with a minor in Applied AI.",
    "I like building the whole product, not just one piece of it. That usually means the user flows, the interface, the React code underneath, the APIs, and actually getting it shipped. I've done that for a clinical app with 134 registered users and a private training hub my own cross country team runs on.",
    "Away from the keyboard I'm a SCAD student athlete with an ultra-endurance background. I grew up around La Ultra: The High, an extreme ultramarathon in the Indian Himalayas, and by its 10th edition I was directing its 55 km category. This summer I'm one of four volunteers on the FIFA World Cup 2026 Anti-Doping team, selected from more than 100,000 applications.",
    "That background taught me to play the long game, keep showing up, and finish what I start.",
  ],
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
    degree: 'B.F.A. Game Development',
    grad: '2028',
    detail:
      'Minor in Applied AI: ethics, intelligent tools, creative computing, and agentic design. Relevant coursework: programming, game design, UX/UI, Unity, and Unreal Engine.',
  },
]

// group: 'tech' renders under "Engineering & Design", everything else
// under "Operations, Sport & Leadership" on the experience page.
export const experience = [
  {
    role: 'Independent Developer — Shipped Web Apps',
    org: 'Self-directed',
    dates: '2025 - Present',
    location: 'Atlanta, GA',
    group: 'tech',
    bullets: [
      'Designed, built, and shipped three production web apps solo: a training hub the SCAD Atlanta distance team runs on, a clinical patient app with 134 registered users built for a practicing physician, and a study app that syncs deadlines to Google Calendar with a document-grounded assistant.',
      'Own the full stack on every build: UX and UI design; Next.js, React, or Flutter front ends; Prisma + PostgreSQL or Firebase data layers; auth; and deployment.',
      'Also built this portfolio site itself: React + Vite with hand-rolled, privacy-friendly visitor analytics on Supabase.',
    ],
  },
  {
    role: 'UX/UI Lead, SCADpro x Atlanta United',
    org: 'Atlanta United FC (Internship)',
    dates: 'Jan 2026 - Mar 2026',
    location: 'Atlanta, GA',
    group: 'tech',
    bullets: [
      'Led UX/UI for a confidential SCADpro collaboration with Atlanta United, focused on user experience, interaction standards, and interface consistency across digital and experiential brand touchpoints.',
      'Defined the UX/UI direction for intuitive, accessible, and consistent fan-facing experiences while aligning with brand and project goals.',
      'Worked with a multidisciplinary team to shape interaction flow, interface clarity, and overall user-experience strategy, while respecting project confidentiality.',
    ],
  },
  {
    role: 'Volunteer, Anti-Doping Team',
    org: 'FIFA World Cup 2026',
    dates: 'May 2026 - Present',
    location: 'Atlanta, GA',
    bullets: [
      'Selected as one of only 4 volunteers for the Anti-Doping Team out of more than 100,000 applications.',
      'Support confidential tournament operations tied to athlete integrity, compliance, and professional event standards.',
      'Represent FIFA World Cup 2026 in a high-trust role that calls for discretion, reliability, and a sharp eye for detail.',
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
      'Kept crowd flow smooth and the guest experience positive through ceremonies, matches, and live moments.',
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
      'Train and compete as a SCAD student athlete while carrying a full course load.',
      'Balance daily training and competition with academics, built on an ultra-endurance background.',
    ],
  },
  {
    role: 'Core Crew → Race Director (55 km)',
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

// Skills, grouped by branch: 'game' | 'ai' | 'tools' | 'soft'.
// Each one cites where the skill was actually used — no self-ratings.
export const skills = [
  // Game Dev branch
  { id: 'gameplay-prog', branch: 'game', name: 'Gameplay Programming',
    desc: 'Player movement, aiming, projectile systems, combat feel.' },
  { id: 'enemy-ai', branch: 'game', name: 'Enemy AI',
    desc: 'Wave spawning, behavior states, escalating difficulty curves.' },
  { id: '3d-env', branch: 'game', name: '3D Environment Art',
    desc: 'Maya modeling, Substance Painter texturing, Unreal lighting & composition.' },
  { id: 'physics', branch: 'game', name: '2D / 3D Physics',
    desc: 'Collision response, bounce dynamics, deterministic systems.' },
  { id: 'level-design', branch: 'game', name: 'Level Design',
    desc: 'Layouts that reward precision and reinforce the core loop.' },

  // Applied AI branch
  { id: 'rag', branch: 'ai', name: 'Retrieval-Augmented Chat',
    desc: 'TF-IDF + embeddings over user-uploaded docs; grounded answers.' },
  { id: 'doc-parse', branch: 'ai', name: 'Document Parsing',
    desc: 'Extracting structured data (deadlines, policies) from PDFs and notes.' },
  { id: 'plan-gen', branch: 'ai', name: 'AI Plan Generation',
    desc: 'Personalized running/activity plans from patient profiles.' },
  { id: 'api-glue', branch: 'ai', name: 'API Integration',
    desc: 'Google Calendar, Firebase, third-party services as first-class glue.' },
  { id: 'ai-ethics', branch: 'ai', name: 'Applied AI Ethics',
    desc: 'Minor coursework: agentic design, intelligent tools, creative computing.' },

  // Tools branch
  { id: 'react', branch: 'tools', name: 'React',
    desc: 'Hooks, refs, RAF-driven canvas apps, accessible UI patterns.' },
  { id: 'ts-next', branch: 'tools', name: 'TypeScript & Next.js',
    desc: 'The SCAD team hub: Next.js + Prisma on PostgreSQL with custom session auth.' },
  { id: 'cs', branch: 'tools', name: 'Unity & Unreal Engine',
    desc: 'C# gameplay in Unity; systems, Niagara VFX, and PCG in Unreal.' },
  { id: 'flutter', branch: 'tools', name: 'Flutter / Web',
    desc: 'Cross-platform deployment: see La Ultra patient app.' },
  { id: 'firebase', branch: 'tools', name: 'Firebase',
    desc: 'Auth, Firestore, hosting for the clinical app.' },
  { id: 'git', branch: 'tools', name: 'Git',
    desc: 'Branching, PR hygiene, code review, careful merges.' },

  // Endurance / Soft branch
  { id: 'leadership', branch: 'soft', name: 'Field Leadership',
    desc: 'Race director, 55km category at La Ultra: multi-functional teams.' },
  { id: 'ops', branch: 'soft', name: 'Logistics & Ops',
    desc: 'High-altitude (12k-15k ft) race operations and medical reporting.' },
  { id: 'endurance', branch: 'soft', name: 'Endurance',
    desc: 'Long-form ultra-sport background. I finish what I start.' },
  { id: 'comms', branch: 'soft', name: 'Communication',
    desc: 'International student ambassador; guest-facing event ops.' },
  { id: 'crisis', branch: 'soft', name: 'Crisis Management',
    desc: 'Athlete cut-off enforcement, on-the-fly disqualifications, real-time medical.' },
]


// type: 'ai' | 'game' sets the accent color and 3D shape per project.
export const projects = [
  {
    slug: 'scad-distance-team-hub',
    name: 'SCAD Distance Team Hub',
    type: 'ai',
    demo: 'xc',
    category: 'Web App · UI/UX · Development',
    year: '2026',
    role: 'I built this one solo for my own team, design through deployment.',
    disciplines: ['UX Design', 'UI Design', 'Front-End', 'Software Development'],
    summary:
      "A private training hub I built for my own team, SCAD Atlanta's cross country and track squad. Coaches set personalized schedules, everyone shares one calendar, and post-workout feedback keeps training honest.",
    description: [
      'I run on the SCAD Atlanta distance team, and our training lived across group chats, spreadsheets, and screenshots. So I built the team its own private hub.',
      'Coaches build each athlete a personalized schedule, the whole team shares one calendar, and direct messaging plus post-workout feedback means the coach knows how a session actually went, not just that it happened. There are separate coach and athlete roles, so each side only sees what it needs.',
      'I built it in Next.js and TypeScript, with Prisma on PostgreSQL for schedules, messages, and feedback, and I wrote the session auth myself for the separate coach and athlete roles. It ships through Firebase Hosting in front of Cloud Run, and it is private by design, made for a real coaching relationship instead of a social feed.',
    ],
    tech: ['Next.js', 'TypeScript', 'React', 'Prisma + PostgreSQL', 'Custom Auth & Roles', 'Cloud Run'],
    highlights: [
      'Built for my own team and used for real training, not a demo',
      'Separate coach and athlete roles with personalized schedules per athlete',
      'Shared team calendar, direct messaging, and post-workout feedback in one place',
      'I owned all of it: UX, UI, Next.js front end, Prisma + PostgreSQL data model, custom session auth, and deployment',
    ],
    live: 'https://scadxctf.web.app/',
    repo: 'https://github.com/VirenChauhan19/SCADxctf',
  },
  {
    slug: 'study-command-center',
    name: 'Study Command Center',
    type: 'ai',
    demo: 'study',
    category: 'Web App · Front-End · UI/UX',
    year: '2025',
    role: 'I built this one solo, design through deployment.',
    disciplines: ['Front-End Design', 'UI Design', 'UX Design', 'Software Development'],
    summary:
      "A study app I designed and built end to end. Students upload their notes and syllabus, it pulls out their deadlines and drops them into Google Calendar, and a built-in assistant answers questions using their own material.",
    description: [
      'I built Study Command Center to turn a messy pile of notes and syllabi into something a student can actually search and stay on top of.',
      'You upload your notes and syllabus, and the app reads the schedule and drops your assignment and exam deadlines straight into Google Calendar.',
      'There is also a chat panel that answers questions about your own uploaded material, like when the midterm is or what the late policy says. It only pulls from your documents, so the answers stay grounded.',
    ],
    tech: ['React', 'UI / UX Design', 'Design System', 'REST APIs', 'Google Calendar API', 'Retrieval / RAG'],
    highlights: [
      'I owned all of it: the UX, the UI, the front-end code, and the deploy',
      'Responsive React app with a consistent, reusable design system',
      'Syncs deadlines straight to Google Calendar through its API',
      "The assistant only answers from the user's own uploaded docs",
    ],
    live: 'https://virenchauhan19.github.io/ReactBox/',
    repo: 'https://github.com/VirenChauhan19/ReactBox',
  },
  {
    slug: 'la-ultra-running-plans',
    name: 'La Ultra: Clinical Patient Web App',
    type: 'ai',
    featured: true,
    demo: 'laultra',
    category: 'Web App · UI/UX · Development',
    year: '2025',
    role: 'I built this one solo too, UX through hosting.',
    disciplines: ['UX Design', 'UI Design', 'Front-End', 'Software Development'],
    summary:
      "A clinical web app I designed and built for a working doctor, with 134 registered users. It handles patient management, progress tracking, and personalized plans, with an interface simple enough for someone who isn't technical.",
    description: [
      'My dad is a doctor, and he asked me to build something that would actually help him with his patients, so I did.',
      'The app builds a running and activity plan around each patient based on their profile and goals, so the doctor can hand them a real, structured program instead of generic advice.',
      'On top of the plans, it has patient management tools so the day to day care lives in one place. As of July 2026 it has 134 registered users, with new sign-ups every week.',
    ],
    tech: ['Flutter / Web', 'UI / UX Design', 'Firebase', 'Auth & Firestore', 'Plan Generation'],
    highlights: [
      '134 registered users as of July 2026, and growing every week',
      'Built for a real doctor who uses it with actual patients',
      'I handled all of it: UX, UI, front-end, data model, auth, and hosting',
      'Generates a personalized plan from each patient profile',
      'Designed to stay fast and clear for a non-technical user',
    ],
    live: 'https://laultrarunandbee.web.app/',
    repo: 'https://github.com/VirenChauhan19/La-Ultra-Run-and-Bee-App',
  },
  {
    slug: 'this-website',
    name: 'This Website + Private Analytics',
    type: 'ai',
    year: '2026',
    category: 'Web App · Design System · Analytics',
    role: 'You are looking at it — designed, built, and instrumented solo.',
    disciplines: ['UI Design', 'Front-End', 'Software Development', 'Analytics'],
    summary:
      'The site you are on right now: a custom-designed React portfolio with its own hand-rolled, privacy-friendly visitor analytics — a Supabase pipeline and an owner-only dashboard instead of Google Analytics.',
    description: [
      'I treated my own portfolio like a product: a custom design system on a pure-black HUD theme, built in React with Vite, animated with Framer Motion, and deployed by GitHub Actions to GitHub Pages on a custom domain.',
      'It ships with its own analytics. Every page view sends one lightweight fetch to Supabase — no tracking SDK and no cookies — with bot filtering and country-level geo. Postgres row-level security keeps the table insert-only for visitors.',
      'The dashboard lives behind Supabase auth on a route only I can see, with custom charts for visitors, paths, referrers, devices, and countries. Even the resume button on this site reports clicks to it.',
    ],
    tech: ['React', 'Vite', 'Framer Motion', 'Supabase', 'React Router', 'GitHub Pages'],
    highlights: [
      'Custom design system and interaction layer, no UI framework',
      'Hand-rolled analytics: one fetch per page view, insert-only via Postgres RLS',
      'Owner-only dashboard with custom charts, gated by Supabase auth',
      'Deployed by GitHub Actions to virenchauhan.com',
    ],
    embed: false,
    live: 'https://virenchauhan.com',
    repo: 'https://github.com/VirenChauhan19/Viren-Website',
  },
  {
    slug: 'top-down-shooter',
    name: 'Top Down Shooter',
    type: 'game',
    year: '2024',
    category: 'Game · Gameplay Systems',
    role: 'Solo, all gameplay programmed in C#',
    disciplines: ['Gameplay Programming', 'Enemy AI', 'Game Feel', 'Software Development'],
    summary:
      'A fast-paced top-down arena shooter I built in Unity with C#, tight controls, wave-based enemies, and combat tuned until it felt punchy.',
    description: [
      'I built this for a game development class at SCAD, and the real assignment I set myself was fundamentals: build a complete game loop that feels good, from scratch. It is made in Unity, with all of the gameplay written in C#.',
      'The player kites waves of enemies around an arena, aiming and firing while the spawner keeps raising the pressure. I wrote the movement, aiming, and projectile systems, the enemy spawning and behavior, and the hit feedback that ties it together.',
      'Most of the time went into game feel, the part you notice but cannot point at: controls that respond instantly, shots that land where your eye expects, and a difficulty curve that escalates wave by wave without feeling unfair.',
    ],
    tech: ['Unity', 'C#', 'Enemy AI & Wave Spawning', 'Combat & Projectile Systems', 'Photoshop (sprites & UI)'],
    highlights: [
      'Built in Unity with every gameplay system scripted in C#',
      'Responsive top-down movement, aiming, and projectile combat',
      'Wave-based enemy spawning with an escalating difficulty curve',
      'Hit feedback and pacing tuned for arcade game feel',
    ],
    media: [{ type: 'video', src: 'top-down-shooter.mp4', caption: 'Gameplay capture' }],
    live: null,
    repo: null,
  },
  {
    slug: 'peggle',
    name: 'Peggle-Style Physics Game',
    type: 'game',
    year: '2024',
    category: 'Game · Physics',
    role: 'Solo, physics tuning & game logic in C#',
    disciplines: ['Physics Programming', 'Game Logic', 'Software Development'],
    summary:
      'A Peggle-inspired physics game I built in Unity: aim one shot, watch the ball ricochet through the pegs, and chase the score.',
    description: [
      'This one came out of a SCAD class on game systems, and my goal was to recreate the classic Peggle loop well enough that it was genuinely hard to put down: aim, launch, and let physics do the rest.',
      'I built it in Unity with C#, using its 2D physics for the ball and peg collisions and writing my own logic on top for the launcher, peg clearing, scoring, and level layouts.',
      'The interesting problem was the bounce. I spent most of the project tuning collision response so a single shot feels fair but never fully predictable, because that small bit of chaos is where the fun lives.',
    ],
    tech: ['Unity', 'C#', '2D Physics & Collision', 'Scoring & Level Logic', 'Photoshop (board & peg art)'],
    highlights: [
      'Built in Unity on its 2D physics, with C# driving launch, scoring, and peg logic',
      'Bounce dynamics tuned so shots feel fair but never predictable',
      'Level layouts designed to reward precise aim',
    ],
    media: [{ type: 'video', src: 'peggle.mp4', caption: 'Gameplay capture' }],
    live: null,
    repo: null,
  },
  {
    slug: '3d-environment',
    name: '3D Environment',
    type: 'game',
    year: '2024',
    category: 'Game · 3D Art',
    role: 'Solo, full pipeline: modeling, texturing & lighting',
    disciplines: ['3D / Environment Art', 'Modeling', 'Texturing', 'Lighting', 'Real-Time Rendering'],
    summary:
      'My first full pass at the 3D environment pipeline: modeled in Maya, textured with Substance Painter and Photoshop, then assembled and lit in Unreal Engine.',
    description: [
      'I built this for an environment art class at SCAD, and it was my first time taking a space from nothing to a finished, explorable scene while touching every tool in the chain myself.',
      'I modeled the assets in Autodesk Maya, textured them in Substance Painter with Photoshop for supporting texture work, then brought everything into Unreal Engine to assemble the scene, light it, and render it in real time.',
      'The goal was atmosphere over asset count: compose the space first, then let lighting and mood do the heavy lifting so it reads as a real place instead of a collection of props.',
    ],
    tech: ['Unreal Engine', 'Autodesk Maya', 'Substance Painter', 'Photoshop', 'Lighting & Composition'],
    highlights: [
      'Full pipeline solo: Maya modeling, Substance Painter texturing, Unreal assembly and lighting',
      'Real-time explorable scene, not a pre-rendered still',
      'Lighting and atmosphere carry the mood of the space',
    ],
    media: [{ type: 'video', src: 'game236.mp4', caption: 'Environment walkthrough' }],
    live: null,
    repo: null,
  },
  {
    slug: 'medieval-environment',
    name: 'Medieval Environment',
    type: 'game',
    year: '2026',
    category: 'Game · 3D Environment Art',
    role: 'Solo, modeling, texturing, lighting & real-time scene',
    disciplines: ['3D / Environment Art', 'Modeling', 'PBR Texturing', 'Lighting', 'Real-Time Rendering'],
    summary:
      'A moody, real-time medieval environment, stone corridors, a candlelit altar, and a sword on its pedestal, built as a cinematic flythrough in Unreal Engine.',
    description: [
      'A real-time environment I built end to end for my environment art coursework at SCAD, working the full art pipeline: modeling in Maya, texturing in Substance Painter, then assembling, lighting, and rendering the scene in Unreal Engine.',
      'The space is a dim medieval interior, brick corridors, wooden benches, barred gates, and a shrine where a sword stands on a pedestal, lit by candles and volumetric light.',
      'The whole thing was about mood: leaning on lighting, atmosphere, and composition so the space feels lived-in and cinematic as the camera moves through it.',
    ],
    tech: ['Autodesk Maya', 'Substance Painter', 'Unreal Engine', '3D Modeling', 'PBR Texturing', 'Lighting'],
    highlights: [
      'Full pipeline solo: modeled in Maya, textured in Substance Painter, lit and rendered in Unreal Engine',
      'Atmospheric lighting: candlelight, volumetric glow, and a controlled, moody palette',
      'Composed as a cinematic flythrough that reads clearly from every camera angle',
    ],
    media: [{ type: 'video', src: 'unreal-environment.mp4', caption: 'Real-time flythrough, Unreal Engine' }],
    live: null,
    repo: null,
  },
  {
    slug: 'the-collision',
    name: 'The Collision',
    type: 'game',
    year: '2026',
    category: 'Game · Gameplay & Systems Programming',
    role: 'Solo, gameplay, systems & optimization',
    disciplines: ['Gameplay Programming', 'Systems Programming', 'VFX (Niagara)', 'Procedural Generation (PCG)', 'Performance Optimization'],
    summary:
      'A real-time systems build I coded: a storm front and a snow front collide across one world, driven by a single balance value, with Niagara weather, PCG territory, and a real performance-optimization pass.',
    description: [
      'A programming-focused SCAD project I built to push real-time systems rather than art, all of it in Unreal Engine.',
      'Everything keys off one balance value: as it shifts between the storm and snow sides, the Niagara weather, PCG-generated crystal territory, lightning, collector feedback, and the HUD all react, with a contested middle range where both sides show at once.',
      'The back half of the project was optimization. I profiled the scene with Stat Unit, Stat GPU, and Shader Complexity, then made the expensive weather and PCG react to the balance value instead of running at full strength all the time, which cut GPU time from about 18 ms to 13-14 ms.',
    ],
    tech: ['Unreal Engine', 'Niagara VFX', 'PCG (Procedural Generation)', 'Gameplay Systems', 'Performance Optimization', 'Emissive Materials & Lighting', 'HUD'],
    highlights: [
      'One balance value drives Niagara weather, PCG territory, lighting, and the HUD across storm and snow states',
      'PCG-generated territory that swaps per side, with collision turned off so the player never snags on it',
      'Profiled with Stat GPU / Shader Complexity and cut GPU time from ~18 ms to ~13-14 ms in the heavy-weather test',
    ],
    media: [{ type: 'video', src: 'the-collision.mp4', caption: 'Live gameplay' }],
    live: null,
    repo: null,
  },
]
