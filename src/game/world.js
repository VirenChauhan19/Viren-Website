// Tile-based world definition. Coordinates are in tile units; multiply by TILE
// to convert to world pixels. The camera projects world pixels into the
// render-target canvas, which is then scaled up to the screen.

export const TILE = 32
export const WORLD_W = 36 // tiles
export const WORLD_H = 22

// 'h' = hard wall, '.' = floor, ',' = cyan-tinted floor (AI zone),
// '-' = warm-tinted floor (game zone). Decorative only — actual collision
// for stations is computed from STATIONS below.
const ROWS = [
  'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  'h..................................h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h..................................h',
  'h..................................h',
  'h..................................h',
  'h.--------------------------------.h',
  'h.--------------------------------.h',
  'h.--------------------------------.h',
  'h.--------------------------------.h',
  'h.--------------------------------.h',
  'h.--------------------------------.h',
  'h.--------------------------------.h',
  'h..................................h',
  'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
]

export const TILES = ROWS.map((row) => row.split(''))

export function tileAt(col, row) {
  if (row < 0 || row >= WORLD_H || col < 0 || col >= WORLD_W) return 'h'
  return TILES[row][col]
}

export function isWall(col, row) {
  return tileAt(col, row) === 'h'
}

// Each station has:
//   key      — unique id (used by overlay router)
//   kind     — visual variant: 'aiDesk' | 'arcade' | 'aria' | 'tv' | 'pedestal' | 'trophy' | 'phone'
//   accent   — 'cyan' | 'warm' | 'green'
//   slug     — optional projects[slug] reference
//   col,row  — top-left tile of footprint (2 wide × 2 tall)
//   facing   — direction the station faces ('south' default)
//   label    — short title for proximity HUD prompt
//   subtitle — small subtitle line
//
// Footprint: cols col..col+1 × rows row..row+1 are solid (player can't walk
// through). Interaction zone: a 3×3 box centered on the station bottom-center.
export const STATIONS = [
  {
    key: 'about',
    kind: 'pedestal',
    accent: 'green',
    col: 4,
    row: 9,
    label: 'About Viren',
    subtitle: 'Profile pedestal',
  },
  {
    key: 'project:study-command-center',
    kind: 'aiDesk',
    accent: 'cyan',
    col: 8,
    row: 5,
    label: 'Study Command Center',
    subtitle: 'AI · 2025',
    slug: 'study-command-center',
  },
  {
    key: 'aria',
    kind: 'aria',
    accent: 'cyan',
    col: 17,
    row: 5,
    label: 'Talk to ARIA',
    subtitle: 'AI assistant · ask anything',
  },
  {
    key: 'project:la-ultra-running-plans',
    kind: 'aiDesk',
    accent: 'cyan',
    col: 26,
    row: 5,
    label: 'La Ultra: AI Running Plans',
    subtitle: 'AI · 2025',
    slug: 'la-ultra-running-plans',
  },
  {
    key: 'showreel',
    kind: 'tv',
    accent: 'green',
    col: 30,
    row: 9,
    label: 'Showreel',
    subtitle: 'Film & video work',
  },
  {
    key: 'project:top-down-shooter',
    kind: 'arcade',
    accent: 'warm',
    col: 6,
    row: 15,
    label: 'Top Down Shooter',
    subtitle: 'Game · 2024',
    slug: 'top-down-shooter',
  },
  {
    key: 'project:peggle',
    kind: 'arcade',
    accent: 'warm',
    col: 17,
    row: 15,
    label: 'Peggle-Style Physics',
    subtitle: 'Game · 2024',
    slug: 'peggle',
  },
  {
    key: 'project:3d-environment',
    kind: 'arcade',
    accent: 'warm',
    col: 28,
    row: 15,
    label: '3D Environment',
    subtitle: 'Game · 2024',
    slug: '3d-environment',
  },
  {
    key: 'trophy',
    kind: 'trophy',
    accent: 'gold',
    col: 4,
    row: 19,
    label: 'Experience & Wins',
    subtitle: 'Trophy cabinet',
  },
  {
    key: 'contact',
    kind: 'phone',
    accent: 'warm',
    col: 30,
    row: 19,
    label: 'Get in touch',
    subtitle: 'Contact booth',
  },
]

// Player spawn (tile coords, will be centered on this tile).
export const PLAYER_SPAWN = { col: 17, row: 11 }

// Pre-compute station occupancy + interaction centers.
export const STATION_BLOCKS = STATIONS.map((s) => ({
  ...s,
  blockCols: [s.col, s.col + 1],
  blockRows: [s.row, s.row + 1],
  // Player stands one tile in front (south-facing default).
  interactCol: s.col + 0.5,
  interactRow: s.row + 2.2,
}))

export function isStationBlocked(col, row) {
  for (const s of STATION_BLOCKS) {
    if (col >= s.blockCols[0] && col <= s.blockCols[1] && row >= s.blockRows[0] && row <= s.blockRows[1]) {
      return true
    }
  }
  return false
}

// Solid for player movement: walls OR station footprints.
export function isSolid(col, row) {
  return isWall(col, row) || isStationBlocked(col, row)
}

// Find the nearest interactable station within proximity radius (tile units).
export function nearestInteractable(playerColF, playerRowF, radius = 1.4) {
  let best = null
  let bestDist = Infinity
  for (const s of STATION_BLOCKS) {
    const dx = s.interactCol - playerColF
    const dy = s.interactRow - playerRowF
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < radius && d < bestDist) {
      best = s
      bestDist = d
    }
  }
  return best
}
