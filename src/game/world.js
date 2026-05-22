// Isometric tile world. Coordinates are in tile units. Movement and
// collision happen in tile space; the renderer projects to iso pixels.

import { WORLD_W, WORLD_H, TILE_W, TILE_H } from './iso.js'

export { WORLD_W, WORLD_H, TILE_W, TILE_H }

// 'h' = hard wall, '.' = floor, ',' = AI zone tint (cyan), '-' = game zone tint (warm).
// 32 wide × 22 tall.
const ROWS = [
  'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
  'h..............................h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h.,,,,,,,,,,,,,,,,,,,,,,,,,,,,.h',
  'h..............................h',
  'h..............................h',
  'h..............................h',
  'h.----------------------------.h',
  'h.----------------------------.h',
  'h.----------------------------.h',
  'h.----------------------------.h',
  'h.----------------------------.h',
  'h.----------------------------.h',
  'h.----------------------------.h',
  'h..............................h',
  'hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh',
]

export const TILES = ROWS.map((r) => r.split(''))

export function tileAt(col, row) {
  if (row < 0 || row >= WORLD_H || col < 0 || col >= WORLD_W) return 'h'
  return TILES[row][col]
}

export function isWall(col, row) {
  return tileAt(col, row) === 'h'
}

// Stations. Each occupies a 2x2 footprint. We have 11 in total: 6 in the
// AI zone (row 5-6 footprint) and 5 in the game zone (row 15-16 footprint).
export const STATIONS = [
  // Top-row (AI zone)
  { key: 'about',                              kind: 'pedestal', accent: 'green', col: 3,  row: 5, label: 'About Viren',          subtitle: 'NPC dialogue' },
  { key: 'skills',                             kind: 'skillTree', accent: 'gold', col: 8,  row: 5, label: 'Skills Loadout',        subtitle: 'Perk tree' },
  { key: 'project:study-command-center',       kind: 'aiDesk',   accent: 'cyan',  col: 13, row: 5, label: 'Study Command Center',  subtitle: 'AI · 2025', slug: 'study-command-center' },
  { key: 'aria',                               kind: 'aria',     accent: 'cyan',  col: 18, row: 5, label: "Viren's Assistant",     subtitle: 'AI guide' },
  { key: 'project:la-ultra-running-plans',     kind: 'aiDesk',   accent: 'cyan',  col: 22, row: 5, label: 'La Ultra: AI Plans',    subtitle: 'AI · 2025', slug: 'la-ultra-running-plans' },
  { key: 'showreel',                           kind: 'tv',       accent: 'green', col: 27, row: 5, label: 'Showreel',              subtitle: 'Film & video' },

  // Bottom-row (Game zone)
  { key: 'trophy',                             kind: 'trophy',   accent: 'gold',  col: 3,  row: 15, label: 'Experience Timeline',  subtitle: 'Career path' },
  { key: 'project:top-down-shooter',           kind: 'arcade',   accent: 'warm',  col: 8,  row: 15, label: 'Top Down Shooter',      subtitle: 'Game · 2024', slug: 'top-down-shooter' },
  { key: 'project:peggle',                     kind: 'arcade',   accent: 'warm',  col: 13, row: 15, label: 'Peggle-Style Physics',  subtitle: 'Game · 2024', slug: 'peggle' },
  { key: 'project:3d-environment',             kind: 'arcade',   accent: 'warm',  col: 18, row: 15, label: '3D Environment',        subtitle: 'Game · 2024', slug: '3d-environment' },
  { key: 'contact',                            kind: 'phone',    accent: 'warm',  col: 26, row: 15, label: 'Recruitment Terminal',  subtitle: 'Contact / hire' },
]

// Player spawn in tile coords (fractional, centered on tile).
export const PLAYER_SPAWN = { col: 15.5, row: 11.5 }

// Pre-compute station occupancy + interaction centers.
export const STATION_BLOCKS = STATIONS.map((s) => ({
  ...s,
  blockCols: [s.col, s.col + 1],
  blockRows: [s.row, s.row + 1],
  // Interaction point: directly in front (south) of the station.
  interactCol: s.col + 1,
  interactRow: s.row + 2.5,
}))

export function isStationBlocked(col, row) {
  for (const s of STATION_BLOCKS) {
    if (col >= s.blockCols[0] && col <= s.blockCols[1] && row >= s.blockRows[0] && row <= s.blockRows[1]) {
      return true
    }
  }
  return false
}

export function isSolid(col, row) {
  return isWall(col, row) || isStationBlocked(col, row)
}

// Tile-space nearest interactable.
export function nearestInteractable(playerCol, playerRow, radius = 2.0) {
  let best = null
  let bestDist = Infinity
  for (const s of STATION_BLOCKS) {
    const dx = s.interactCol - playerCol
    const dy = s.interactRow - playerRow
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < radius && d < bestDist) {
      best = s
      bestDist = d
    }
  }
  return best
}
