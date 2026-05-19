// All site content in one place. Edit here to update the portfolio.

export const profile = {
  name: 'Viren Chauhan',
  title: 'Game Developer & Applied AI',
  tagline:
    'I build games, intelligent tools, and interactive experiences where creative tech meets real-world problems.',
  about: [
    "I'm an undergraduate Game Development student at the Savannah College of Art and Design (SCAD) in Atlanta, GA, pursuing a minor in Applied AI.",
    'My work sits at the intersection of game design and applied artificial intelligence, from gameplay systems and 3D environments to AI assistants that help students study and tools that help doctors care for patients.',
    "I'm also a student athlete with a background in ultra-endurance sport, which shapes how I approach hard problems: long game, steady reps, finish what you start.",
  ],
  email: 'vchauh21@student.scad.edu',
  links: [
    { label: 'GitHub', url: 'https://github.com/VirenChauhan19' },
    { label: 'Email', url: 'mailto:vchauh21@student.scad.edu' },
  ],
  photo: 'headshot.jpeg',
}

export const education = [
  {
    school: 'Savannah College of Art and Design (SCAD)',
    location: 'Atlanta, GA',
    degree: 'B.F.A. Game Development',
    detail: 'Minor in Applied AI: ethics, intelligent tools, creative computing, and agentic design.',
  },
]

export const experience = [
  {
    role: 'Assistant Production Executive',
    org: 'Moving Mountains Within (Documentary Film)',
    detail:
      'Contributed to an award-winning documentary covering the 2019 La Ultra ultra-marathon in Ladakh.',
    media: [{ type: 'youtube', src: 'FJnZ0Qukpjo', caption: 'Moving Mountains Within' }],
  },
  {
    role: 'Race Director, 55 km Category',
    org: 'La Ultra: The High',
    detail:
      'Directed the 55 km category of one of the world’s toughest 555 km ultra-marathons, held at high altitude in Ladakh.',
    media: [{ type: 'video', src: 'la-ultra-race.mp4', caption: 'La Ultra: The High' }],
  },
  {
    role: 'Video Editor',
    org: 'Run2Fly Initiative',
    detail:
      'Produced promotional films for an organization empowering underprivileged girls in rural India through running.',
    media: [
      { type: 'youtube', src: 'VCubJmdrExA', caption: 'Run2Fly' },
      { type: 'youtube', src: 'qswe4uUq1lc', caption: 'Run2Fly Field Film' },
    ],
  },
]

// type: 'ai' | 'game' sets the accent color and 3D shape per project.
export const projects = [
  {
    slug: 'study-command-center',
    name: 'Study Command Center',
    type: 'ai',
    year: '2025',
    role: 'Solo, built for my Applied AI class',
    summary:
      'An AI study assistant for students. Upload your notes and syllabus, sync deadlines straight to Google Calendar, and ask the chatbot anything about your class.',
    description: [
      'Built for my Applied AI coursework, Study Command Center turns a messy pile of notes and syllabi into an organized, queryable study hub.',
      'Students upload their notes and syllabus; the app parses the schedule and pushes assignment and exam deadlines into Google Calendar automatically.',
      'A retrieval-based AI chatbot answers questions about the uploaded material ("When is the midterm?", "Summarize lecture 4", "What’s the late policy?"), grounding answers in the student’s own documents.',
    ],
    tech: ['React', 'AI Chatbot / RAG', 'Google Calendar API', 'Document Parsing'],
    highlights: [
      'Notes & syllabus upload with automatic deadline extraction',
      'One-click Google Calendar sync for assignments and exams',
      'Conversational Q&A grounded in your own class material',
    ],
    live: 'https://virenchauhan19.github.io/ReactBox/',
    repo: 'https://github.com/VirenChauhan19/ReactBox',
  },
  {
    slug: 'la-ultra-running-plans',
    name: 'La Ultra: AI Running Plans for Patients',
    type: 'ai',
    year: '2025',
    role: 'Solo, built for my father, a doctor',
    summary:
      'A health app that generates personalized AI running plans for a doctor’s patients, plus tools to track progress and manage care.',
    description: [
      'My father is a doctor, and he asked me to build something that would genuinely help him with his patients. The result is an app that creates AI-generated running and activity plans tailored to each patient.',
      'Plans adapt to the patient’s profile and goals, giving the doctor a structured, prescribable program instead of generic advice, and giving patients a clear path to follow.',
      'Beyond plan generation, the app includes additional patient-management features to support day-to-day care, all in one place.',
    ],
    tech: ['Flutter / Web', 'AI Plan Generation', 'Patient Management', 'Firebase'],
    highlights: [
      'Personalized AI-generated running & activity plans',
      'Designed with a practicing doctor for real clinical use',
      'Patient tracking and care tools beyond just plans',
    ],
    live: 'https://gentle-badass.web.app/#/',
    repo: null,
  },
  {
    slug: 'top-down-shooter',
    name: 'Top Down Shooter',
    type: 'game',
    year: '2024',
    role: 'Solo, gameplay & systems',
    summary:
      'A fast-paced top-down shooter focused on tight controls, enemy waves, and responsive combat feel.',
    description: [
      'A top-down arcade shooter built to practice core gameplay programming: player movement, aiming, projectile systems, and enemy AI.',
      'The focus was game feel: snappy controls, satisfying feedback, and escalating difficulty through enemy waves.',
    ],
    tech: ['Game Engine', 'C# / Gameplay Scripting', 'Enemy AI', 'Combat Systems'],
    highlights: [
      'Responsive top-down movement and aiming',
      'Wave-based enemy spawning and AI',
      'Tuned combat feedback and difficulty curve',
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
    role: 'Solo, physics & game logic',
    summary:
      'A Peggle-inspired physics game built around ball bounce dynamics, peg clearing, and score chasing.',
    description: [
      'A recreation of the classic Peggle loop: aim, launch, watch the ball ricochet through pegs, and chase a high score.',
      'Built to dig into 2D physics, collision response, and the addictive risk/reward of a single well-aimed shot.',
    ],
    tech: ['Game Engine', '2D Physics', 'Collision Systems', 'Scoring Logic'],
    highlights: [
      'Physics-driven ball and peg interactions',
      'Aim-and-launch core loop with scoring',
      'Level layouts that reward precision',
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
    role: 'Solo, environment art & lighting',
    summary:
      'A real-time 3D environment built to explore composition, lighting, and atmosphere in a game engine.',
    description: [
      'An explorable 3D scene focused on environment design: modeling, texturing, lighting, and mood.',
      'The goal was to compose a believable space and use lighting and atmosphere to give it a sense of place.',
    ],
    tech: ['Game Engine', '3D Modeling', 'Lighting', 'Environment Art'],
    highlights: [
      'Composed, explorable real-time 3D space',
      'Lighting and atmosphere driven mood',
      'Environment art and texturing practice',
    ],
    media: [{ type: 'video', src: 'game236.mp4', caption: 'Environment walkthrough' }],
    live: null,
    repo: null,
  },
]
