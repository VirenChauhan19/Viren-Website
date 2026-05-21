// Isometric renderer. Everything is procedural canvas drawing, no
// sprite assets. The world is in tile space (col, row); we project to
// iso pixels at render time. The visible look:
//   • Dark gradient sky with two drifting cloud layers
//   • Glass-tile floor with zone tints (AI cyan, Game warm)
//   • Slow sun beam panning across the floor
//   • Extruded perimeter walls + extruded station "buildings"
//   • All sortable items depth-sorted by (col + row)
//   • Floating "!" quest markers, ambient particles, glow halos

import {
  TILE_W, TILE_H, HALF_W, HALF_H,
  WORLD_W, WORLD_H, WORLD_ISO_W, WORLD_ISO_H,
  isoProject, isoTileCenter, drawExtrudedBox,
} from './iso.js'
import { STATION_BLOCKS, TILES, isWall } from './world.js'

export const COLORS = {
  bg: '#06070b',
  skyTop: '#0a0e1c',
  skyBottom: '#15182a',
  floor: '#11151f',
  floorDeep: '#0a0d14',
  floorCyan: '#0d1a26',
  floorCyan2: '#0f2334',
  floorWarm: '#1c1410',
  floorWarm2: '#241812',
  gridDot: 'rgba(255, 255, 255, 0.06)',
  zoneCyanGlow: 'rgba(94, 232, 255, 0.06)',
  zoneWarmGlow: 'rgba(255, 154, 90, 0.06)',
  wallTop: '#222a3c',
  wallSide: '#141a26',
  wallSideDark: '#0a0e16',
  wallEdge: 'rgba(94, 232, 255, 0.15)',
  cyan: '#5ee8ff',
  warm: '#ff9a5a',
  green: '#6cf5a9',
  gold: '#ffd166',
  pink: '#ff6ec7',
  ink: '#e8ecf2',
  inkDim: '#98a0b0',
  skin: '#f1c9a5',
  skinShadow: '#c19474',
  hair: '#2a2018',
  shirt: '#2e4a7a',
  shirtHi: '#3e6098',
  shirtShadow: '#1e3258',
  pants: '#1a1f2a',
  shoe: '#0a0d12',
}

function pickAccent(a) {
  if (a === 'cyan') return COLORS.cyan
  if (a === 'warm') return COLORS.warm
  if (a === 'green') return COLORS.green
  if (a === 'gold') return COLORS.gold
  return COLORS.cyan
}

// ───────────────── Sky + clouds ─────────────────

export function drawSky(ctx, viewW, viewH, time) {
  const g = ctx.createLinearGradient(0, 0, 0, viewH)
  g.addColorStop(0, COLORS.skyTop)
  g.addColorStop(1, COLORS.skyBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, viewW, viewH)

  // Soft horizon glow
  const hg = ctx.createRadialGradient(viewW / 2, viewH * 0.35, 0, viewW / 2, viewH * 0.35, viewW * 0.6)
  hg.addColorStop(0, 'rgba(94, 232, 255, 0.05)')
  hg.addColorStop(1, 'rgba(94, 232, 255, 0)')
  ctx.fillStyle = hg
  ctx.fillRect(0, 0, viewW, viewH)

  drawAuroraRibbons(ctx, viewW, viewH, time)

  // Stars layer (cheap pseudo-random)
  for (let i = 0; i < 30; i++) {
    const x = ((i * 91.73) % viewW + (time * 0.002 + i)) % viewW
    const y = ((i * 53.41) % (viewH * 0.45))
    const tw = 0.5 + ((Math.sin(time / 800 + i) + 1) / 2) * 0.5
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * tw})`
    ctx.fillRect(Math.round(x), Math.round(y), 1, 1)
  }

  // Cloud layers: two depths, scrolling at different speeds.
  drawDistantSkyline(ctx, viewW, viewH, time)
  drawCloudLayer(ctx, viewW, viewH, time, 0.012, 0.17, 0.10, 7, 60)
  drawCloudLayer(ctx, viewW, viewH, time, 0.022, 0.31, 0.06, 5, 90)
  drawCloudLayer(ctx, viewW, viewH, time, -0.016, 0.55, 0.035, 6, 120)
  drawFogSheets(ctx, viewW, viewH, time)
}

function drawAuroraRibbons(ctx, viewW, viewH, time) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let r = 0; r < 3; r++) {
    const yBase = viewH * (0.12 + r * 0.075)
    const amp = 18 + r * 7
    const alpha = 0.035 + r * 0.018
    const grd = ctx.createLinearGradient(0, yBase - 40, viewW, yBase + 80)
    grd.addColorStop(0, 'rgba(94, 232, 255, 0)')
    grd.addColorStop(0.38, r === 1 ? `rgba(255, 110, 199, ${alpha})` : `rgba(94, 232, 255, ${alpha})`)
    grd.addColorStop(0.7, `rgba(108, 245, 169, ${alpha * 0.8})`)
    grd.addColorStop(1, 'rgba(94, 232, 255, 0)')
    ctx.strokeStyle = grd
    ctx.lineWidth = 22 + r * 10
    ctx.beginPath()
    for (let x = -80; x <= viewW + 80; x += 28) {
      const y = yBase + Math.sin(x / 160 + time / (4200 + r * 900) + r) * amp
      if (x === -80) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  ctx.restore()
}

function drawDistantSkyline(ctx, viewW, viewH, time) {
  const horizon = viewH * 0.74
  const drift = (time / 180) % 96

  ctx.save()
  ctx.globalAlpha = 0.42
  ctx.fillStyle = '#050811'
  ctx.beginPath()
  ctx.moveTo(0, viewH)
  for (let i = -2; i < 18; i++) {
    const x = i * 96 - drift
    const top = horizon - 28 - ((i * 31) % 72)
    ctx.lineTo(x, horizon)
    ctx.lineTo(x + 16, top + 14)
    ctx.lineTo(x + 36, top)
    ctx.lineTo(x + 58, top + 18)
    ctx.lineTo(x + 96, horizon)
  }
  ctx.lineTo(viewW, viewH)
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < 13; i++) {
    const x = ((i * 137 + time / 65) % (viewW + 220)) - 110
    const y = horizon - 58 + ((i * 19) % 76)
    const pulse = 0.35 + 0.25 * Math.sin(time / 700 + i)
    ctx.fillStyle = `rgba(94, 232, 255, ${pulse})`
    ctx.fillRect(Math.round(x), Math.round(y), 2, 7)
    ctx.fillStyle = `rgba(255, 154, 90, ${pulse * 0.7})`
    ctx.fillRect(Math.round(x + 9), Math.round(y + 18), 2, 5)
  }
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.18
  ctx.fillStyle = '#02040a'
  const foregroundY = viewH * 0.82
  const drift2 = (time / 110) % 140
  for (let i = -2; i < 12; i++) {
    const x = i * 140 - drift2
    const h = 72 + ((i * 47) % 95)
    ctx.fillRect(x, foregroundY - h, 42, h)
    ctx.fillRect(x + 55, foregroundY - h * 0.7, 26, h * 0.7)
    ctx.fillRect(x + 92, foregroundY - h * 1.15, 36, h * 1.15)
  }
  ctx.restore()
}

function drawFogSheets(ctx, viewW, viewH, time) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (let i = 0; i < 5; i++) {
    const w = viewW * (0.32 + i * 0.05)
    const x = ((i * 260 + time / (55 + i * 18)) % (viewW + w)) - w
    const y = viewH * (0.44 + i * 0.095)
    const grd = ctx.createLinearGradient(x, y, x + w, y)
    grd.addColorStop(0, 'rgba(94, 232, 255, 0)')
    grd.addColorStop(0.5, i % 2 ? 'rgba(255, 154, 90, 0.055)' : 'rgba(94, 232, 255, 0.06)')
    grd.addColorStop(1, 'rgba(94, 232, 255, 0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.ellipse(x + w / 2, y, w / 2, 32 + i * 6, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawCloudLayer(ctx, viewW, viewH, time, speed, bandTop, alpha, count, baseW) {
  const y = viewH * bandTop
  const totalW = viewW + baseW * 4
  for (let i = 0; i < count; i++) {
    const seed = i * 211 + 17
    const baseX = (seed % totalW)
    const x = ((baseX - time * speed * 100) % totalW + totalW) % totalW - baseW * 2
    const cy = y + ((i * 7) % 30) - 15
    const w = baseW + (seed % 60)
    drawSoftCloud(ctx, x, cy, w, alpha)
  }
}

function drawSoftCloud(ctx, x, y, w, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = '#cfd6e8'
  const h = w * 0.32
  // Three overlapping ellipses for a soft puff.
  ctx.beginPath()
  ctx.ellipse(x, y, w * 0.5, h * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x + w * 0.3, y + 2, w * 0.4, h * 0.6, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(x - w * 0.25, y + 1, w * 0.35, h * 0.55, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// ───────────────── Floor + sun beam ─────────────────

function fillDiamond(ctx, col, row, color) {
  const { x, y } = isoProject(col, row)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x + HALF_W, y)
  ctx.lineTo(x + TILE_W, y + HALF_H)
  ctx.lineTo(x + HALF_W, y + TILE_H)
  ctx.lineTo(x, y + HALF_H)
  ctx.closePath()
  ctx.fill()
}

export function drawFloor(ctx, camX, camY, viewW, viewH, time) {
  // Compute the bounding box of tiles we need to render.
  // It's easier to just iterate the whole world (32×22 = 704 tiles).
  ctx.save()
  ctx.translate(-camX, -camY)

  // Single fill: deep floor across the whole iso footprint.
  // Compute the four world iso corners and fill a polygon.
  const tl = isoProject(0, 0)
  const tr = isoProject(WORLD_W, 0)
  const br = isoProject(WORLD_W, WORLD_H)
  const bl = isoProject(0, WORLD_H)
  // Each iso corner is the diamond's top-left coord; the visible polygon
  // corners are: top = (0,0).top, right = (W,0).right, bottom = (W,H).bottom, left = (0,H).left.
  const polyTop = { x: tl.x + HALF_W, y: tl.y }
  const polyRight = { x: tr.x + TILE_W, y: tr.y + HALF_H }
  const polyBottom = { x: br.x + HALF_W, y: br.y + TILE_H }
  const polyLeft = { x: bl.x, y: bl.y + HALF_H }

  ctx.fillStyle = COLORS.floor
  ctx.beginPath()
  ctx.moveTo(polyTop.x, polyTop.y)
  ctx.lineTo(polyRight.x, polyRight.y)
  ctx.lineTo(polyBottom.x, polyBottom.y)
  ctx.lineTo(polyLeft.x, polyLeft.y)
  ctx.closePath()
  ctx.fill()

  // Zone tints as filled diamonds (cyan top, warm bottom).
  ctx.save()
  ctx.beginPath()
  // Cyan zone covers rows 2..10, cols 2..30
  const cyTL = isoProject(2, 2)
  const cyTR = isoProject(30, 2)
  const cyBR = isoProject(30, 10)
  const cyBL = isoProject(2, 10)
  ctx.moveTo(cyTL.x + HALF_W, cyTL.y)
  ctx.lineTo(cyTR.x + TILE_W, cyTR.y + HALF_H)
  ctx.lineTo(cyBR.x + HALF_W, cyBR.y + TILE_H)
  ctx.lineTo(cyBL.x, cyBL.y + HALF_H)
  ctx.closePath()
  const cyG = ctx.createLinearGradient(0, cyTL.y, 0, cyBL.y + TILE_H)
  cyG.addColorStop(0, COLORS.floorCyan2)
  cyG.addColorStop(1, COLORS.floorCyan)
  ctx.fillStyle = cyG
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.beginPath()
  const wmTL = isoProject(2, 13)
  const wmTR = isoProject(30, 13)
  const wmBR = isoProject(30, 20)
  const wmBL = isoProject(2, 20)
  ctx.moveTo(wmTL.x + HALF_W, wmTL.y)
  ctx.lineTo(wmTR.x + TILE_W, wmTR.y + HALF_H)
  ctx.lineTo(wmBR.x + HALF_W, wmBR.y + TILE_H)
  ctx.lineTo(wmBL.x, wmBL.y + HALF_H)
  ctx.closePath()
  const wmG = ctx.createLinearGradient(0, wmTL.y, 0, wmBL.y + TILE_H)
  wmG.addColorStop(0, COLORS.floorWarm2)
  wmG.addColorStop(1, COLORS.floorWarm)
  ctx.fillStyle = wmG
  ctx.fill()
  ctx.restore()

  // Subtle grid intersection dots: every 2 tiles.
  ctx.fillStyle = COLORS.gridDot
  for (let r = 0; r <= WORLD_H; r += 2) {
    for (let c = 0; c <= WORLD_W; c += 2) {
      const p = isoProject(c, r)
      ctx.beginPath()
      ctx.arc(p.x + HALF_W, p.y + HALF_H, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  drawFloorConduits(ctx, time)
  drawRunwayLights(ctx, time)

  // Zone labels (faint, in world space)
  ctx.save()
  ctx.font = '700 12px ui-monospace, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const labelCy = isoTileCenter(16, 1.4)
  ctx.fillStyle = COLORS.cyan
  ctx.globalAlpha = 0.22
  ctx.fillText('· AI · APPLIED INTELLIGENCE ·', labelCy.x, labelCy.y)
  const labelWm = isoTileCenter(16, 12.4)
  ctx.fillStyle = COLORS.warm
  ctx.fillText('· GAMES · INTERACTIVE WORK ·', labelWm.x, labelWm.y)
  ctx.restore()

  // Sun beam: animated radial gradient panning across the floor.
  drawDistrictHolograms(ctx, time)

  const t = time / 14000
  const beamCol = 16 + Math.sin(t) * 12
  const beamRow = 11 + Math.cos(t * 0.7) * 5
  const beamCenter = isoTileCenter(beamCol, beamRow)
  const beamR = 220
  const beamGrd = ctx.createRadialGradient(beamCenter.x, beamCenter.y, 0, beamCenter.x, beamCenter.y, beamR)
  beamGrd.addColorStop(0, 'rgba(255, 234, 180, 0.10)')
  beamGrd.addColorStop(0.4, 'rgba(255, 234, 180, 0.04)')
  beamGrd.addColorStop(1, 'rgba(255, 234, 180, 0)')
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = beamGrd
  ctx.beginPath()
  ctx.arc(beamCenter.x, beamCenter.y, beamR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.restore()
}

// ───────────────── Walls (extruded around perimeter) ─────────────────

function drawFloorConduits(ctx, time) {
  const rows = [
    STATION_BLOCKS.filter((s) => s.row < 10),
    STATION_BLOCKS.filter((s) => s.row >= 10),
  ]

  rows.forEach((rowStations, rowIndex) => {
    const color = rowIndex === 0 ? COLORS.cyan : COLORS.warm
    const sorted = [...rowStations].sort((a, b) => a.col - b.col)
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = isoTileCenter(sorted[i].col + 1, sorted[i].row + 2.25)
      const to = isoTileCenter(sorted[i + 1].col + 1, sorted[i + 1].row + 2.25)
      drawConduitSegment(ctx, from, to, color, time, i + rowIndex * 7)
    }
  })
}

function drawRunwayLights(ctx, time) {
  const points = [
    ...Array.from({ length: 13 }, (_, i) => ({ col: 3 + i * 2.1, row: 2.1, color: COLORS.cyan })),
    ...Array.from({ length: 13 }, (_, i) => ({ col: 3 + i * 2.1, row: 20.1, color: COLORS.warm })),
    ...Array.from({ length: 8 }, (_, i) => ({ col: 1.4, row: 4 + i * 2, color: COLORS.green })),
    ...Array.from({ length: 8 }, (_, i) => ({ col: 30.7, row: 4 + i * 2, color: COLORS.gold })),
  ]

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < points.length; i++) {
    const p = points[i]
    const c = isoTileCenter(p.col, p.row)
    const pulse = 0.35 + 0.45 * ((Math.sin(time / 520 + i * 0.8) + 1) / 2)
    const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 18)
    g.addColorStop(0, p.color + Math.floor(160 * pulse).toString(16).padStart(2, '0'))
    g.addColorStop(1, p.color + '00')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(c.x, c.y, 18, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = p.color
    ctx.globalAlpha = pulse
    ctx.fillRect(Math.round(c.x - 1), Math.round(c.y - 1), 2, 2)
    ctx.globalAlpha = 1
  }
  ctx.restore()
}

function drawDistrictHolograms(ctx, time) {
  const labels = [
    { text: 'AI LABS', col: 7.6, row: 3.2, color: COLORS.cyan },
    { text: 'SIMULATION DECK', col: 23.2, row: 3.9, color: COLORS.green },
    { text: 'ARCADE DOCKS', col: 7.4, row: 13.4, color: COLORS.warm },
    { text: 'RECRUIT SIGNAL', col: 24.9, row: 13.2, color: COLORS.gold },
  ]

  ctx.save()
  ctx.font = '800 10px ui-monospace, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const label of labels) {
    const p = isoTileCenter(label.col, label.row)
    const y = p.y - 38 + Math.sin(time / 900 + label.col) * 2
    ctx.save()
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = label.color
    ctx.globalAlpha = 0.42 + 0.16 * Math.sin(time / 700 + label.row)
    ctx.fillText(label.text, p.x, y)
    ctx.strokeStyle = label.color + '55'
    ctx.beginPath()
    ctx.moveTo(p.x - 38, y + 10)
    ctx.lineTo(p.x + 38, y + 10)
    ctx.stroke()
    ctx.restore()
  }
  ctx.restore()
}

function drawConduitSegment(ctx, from, to, color, time, seed) {
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = color + '36'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()

  ctx.strokeStyle = color + '88'
  ctx.lineWidth = 0.8
  ctx.setLineDash([8, 14])
  ctx.lineDashOffset = -time / 55 - seed * 9
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.stroke()
  ctx.setLineDash([])

  const t = ((time / 1250) + seed * 0.17) % 1
  const x = from.x + (to.x - from.x) * t
  const y = from.y + (to.y - from.y) * t
  const g = ctx.createRadialGradient(x, y, 0, x, y, 22)
  g.addColorStop(0, color + 'dd')
  g.addColorStop(1, color + '00')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawWalls(ctx, camX, camY) {
  ctx.save()
  ctx.translate(-camX, -camY)

  // Collect wall tiles, depth-sort, then draw.
  const wallTiles = []
  for (let r = 0; r < WORLD_H; r++) {
    for (let c = 0; c < WORLD_W; c++) {
      if (TILES[r][c] === 'h') wallTiles.push({ col: c, row: r, depth: c + r })
    }
  }
  wallTiles.sort((a, b) => a.depth - b.depth)
  const wallHeight = 28
  for (const w of wallTiles) {
    drawExtrudedBox(ctx, w.col, w.row, 1, 1, wallHeight, {
      top: COLORS.wallTop,
      rightFace: COLORS.wallSide,
      leftFace: COLORS.wallSideDark,
      edge: 'rgba(94, 232, 255, 0.06)',
    })
  }

  ctx.restore()
}

// ───────────────── Stations ─────────────────

export function drawStation(ctx, station, camX, camY, time, isNear, isCompleted = false, scanBoost = false) {
  ctx.save()
  ctx.translate(-camX, -camY)

  const accent = pickAccent(station.accent)
  const active = isNear
  const boosted = active || scanBoost
  // Soft ground glow under the station.
  const groundCenter = isoTileCenter(station.col + 1, station.row + 2.1)
  drawGroundGlow(ctx, groundCenter.x, groundCenter.y, boosted ? 190 : 138, accent, boosted ? 0.86 : 0.36, time)
  drawStationQuestPad(ctx, station, accent, time, boosted, isCompleted)

  switch (station.kind) {
    case 'arcade':    drawArcadeIso(ctx, station, time, boosted); break
    case 'aiDesk':    drawAIDeskIso(ctx, station, time, boosted); break
    case 'aria':      drawAriaIso(ctx, station, time, boosted); break
    case 'tv':        drawTVIso(ctx, station, time, boosted); break
    case 'pedestal':  drawPedestalIso(ctx, station, time, boosted); break
    case 'trophy':    drawTrophyIso(ctx, station, time, boosted); break
    case 'phone':     drawPhoneIso(ctx, station, time, boosted); break
    case 'skillTree': drawSkillTreeIso(ctx, station, time, boosted); break
  }

  drawStationPopRim(ctx, station, accent, time, boosted)
  drawStationBeacon(ctx, station, accent, time, boosted, isCompleted)
  if (isCompleted) drawCompletedSeal(ctx, station, time)

  // Floating label when near.
  if (active) {
    const top = isoTileCenter(station.col + 1, station.row)
    drawStationIntelCard(ctx, top.x, top.y - 118, station, accent, time, isCompleted)
  }

  ctx.restore()
}

function drawStationQuestPad(ctx, station, color, time, active, isCompleted) {
  const p = isoProject(station.col - 0.22, station.row - 0.18)
  const w = TILE_W * 2.44
  const h = TILE_H * 2.36
  const cx = p.x + w / 2
  const cy = p.y + h / 2
  const pulse = 0.6 + 0.4 * Math.sin(time / 520 + station.col)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = color + (active ? 'cc' : isCompleted ? '88' : '44')
  ctx.lineWidth = active ? 1.6 : 0.9
  ctx.beginPath()
  ctx.moveTo(cx, p.y)
  ctx.lineTo(p.x + w, cy)
  ctx.lineTo(cx, p.y + h)
  ctx.lineTo(p.x, cy)
  ctx.closePath()
  ctx.stroke()

  const scan = ((time / 900 + station.col * 0.07) % 1)
  const sx1 = p.x + w * scan
  ctx.strokeStyle = color + (active ? 'aa' : '3a')
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(sx1 - 42, cy - 22)
  ctx.lineTo(sx1 + 42, cy + 22)
  ctx.stroke()

  if (active || isCompleted) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, active ? 96 : 72)
    g.addColorStop(0, color + (active ? '30' : '1c'))
    g.addColorStop(1, color + '00')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(cx, cy, active ? 110 : 82, active ? 48 : 35, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4
    const px = cx + Math.cos(a) * w * 0.42
    const py = cy + Math.sin(a) * h * 0.42
    ctx.fillStyle = color
    ctx.globalAlpha = (active ? 0.8 : 0.35) + pulse * 0.2
    ctx.fillRect(Math.round(px), Math.round(py), 2, 2)
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

function drawStationPopRim(ctx, station, color, time, active) {
  const p = isoProject(station.col, station.row)
  const cx = p.x + TILE_W
  const cy = p.y + TILE_H
  const breathe = 0.75 + 0.25 * Math.sin(time / 360 + station.row)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = color + (active ? 'f0' : '70')
  ctx.lineWidth = active ? 2.2 : 1.2
  ctx.beginPath()
  ctx.moveTo(cx, p.y - 3)
  ctx.lineTo(p.x + TILE_W * 2 + 4, cy)
  ctx.lineTo(cx, p.y + TILE_H * 2 + 5)
  ctx.lineTo(p.x - 4, cy)
  ctx.closePath()
  ctx.stroke()

  if (active) {
    ctx.strokeStyle = color + '55'
    ctx.lineWidth = 4 + breathe * 2
    ctx.beginPath()
    ctx.moveTo(cx, p.y - 7)
    ctx.lineTo(p.x + TILE_W * 2 + 9, cy)
    ctx.lineTo(cx, p.y + TILE_H * 2 + 10)
    ctx.lineTo(p.x - 9, cy)
    ctx.closePath()
    ctx.stroke()
  }

  ctx.restore()
}

function drawStationBeacon(ctx, station, color, time, active, isCompleted) {
  const c = isoTileCenter(station.col + 1, station.row + 1)
  const h = active ? 150 : 94
  const alpha = active ? 0.34 : isCompleted ? 0.14 : 0.1

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createLinearGradient(c.x, c.y - h, c.x, c.y)
  g.addColorStop(0, color + '00')
  g.addColorStop(0.36, color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
  g.addColorStop(1, color + '00')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(c.x - 22, c.y)
  ctx.lineTo(c.x + 22, c.y)
  ctx.lineTo(c.x + 8, c.y - h)
  ctx.lineTo(c.x - 8, c.y - h)
  ctx.closePath()
  ctx.fill()
  if (active) {
    ctx.strokeStyle = color + '88'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(c.x - 28, c.y)
    ctx.lineTo(c.x - 10, c.y - h)
    ctx.moveTo(c.x + 28, c.y)
    ctx.lineTo(c.x + 10, c.y - h)
    ctx.stroke()
  }
  ctx.restore()
}

function stationIntel(station) {
  if (station.key === 'project:study-command-center') return 'RAG assistant, syllabus parsing, calendar sync'
  if (station.key === 'project:la-ultra-running-plans') return 'AI running plans for doctor-led patient care'
  if (station.key === 'project:top-down-shooter') return 'Wave combat, enemy AI, responsive game feel'
  if (station.key === 'project:peggle') return 'Physics bounce loop, scoring, collision systems'
  if (station.key === 'project:3d-environment') return 'Real-time environment art, lighting, atmosphere'
  if (station.key === 'contact') return 'Final mission: open recruitment channel'
  return station.subtitle || 'Quest station online'
}

function drawStationIntelCard(ctx, cx, baseY, station, color, time, isCompleted) {
  const bob = Math.sin(time / 400) * 2
  const y = baseY + bob
  const title = station.label
  const subtitle = isCompleted ? 'Reviewed - revisit mission' : stationIntel(station)

  ctx.save()
  ctx.font = '800 12px ui-monospace, Menlo, Consolas, monospace'
  const titleW = ctx.measureText(title).width
  ctx.font = '600 10px ui-monospace, Menlo, Consolas, monospace'
  const subW = ctx.measureText(subtitle).width
  const w = Math.min(260, Math.max(156, titleW, subW) + 28)
  const h = 54
  const bx = cx - w / 2
  const by = y - h - 6

  ctx.fillStyle = 'rgba(8, 10, 16, 0.96)'
  roundRect(ctx, bx, by, w, h, 8)
  ctx.fill()
  ctx.strokeStyle = color + 'dd'
  ctx.lineWidth = 1
  roundRect(ctx, bx, by, w, h, 8)
  ctx.stroke()

  ctx.fillStyle = color
  ctx.globalAlpha = 0.16 + 0.08 * Math.sin(time / 260)
  ctx.fillRect(bx + 1, by + h - 7, w - 2, 2)
  ctx.globalAlpha = 1

  ctx.font = '700 9px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = isCompleted ? COLORS.green : color
  ctx.textAlign = 'left'
  ctx.fillText(isCompleted ? 'QUEST REVIEWED' : 'QUEST AVAILABLE', bx + 12, by + 13)
  ctx.font = '800 12px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = COLORS.ink
  ctx.fillText(title, bx + 12, by + 30)
  ctx.font = '600 10px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = COLORS.inkDim
  ctx.fillText(subtitle.slice(0, 36), bx + 12, by + 44)

  ctx.fillStyle = 'rgba(8, 10, 16, 0.96)'
  ctx.beginPath()
  ctx.moveTo(cx - 5, by + h)
  ctx.lineTo(cx + 5, by + h)
  ctx.lineTo(cx, by + h + 6)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawCompletedSeal(ctx, station, time) {
  const c = isoTileCenter(station.col + 1, station.row + 0.35)
  const y = c.y - 92 + Math.sin(time / 500 + station.col) * 2

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = COLORS.green + 'aa'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(c.x, y, 12, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = COLORS.green
  ctx.font = '800 8px ui-monospace, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('OK', c.x, y)
  ctx.restore()
}

function drawGroundGlow(ctx, cx, cy, r, color, intensity, time) {
  const pulse = 0.85 + 0.15 * Math.sin(time / 600)
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * pulse)
  grd.addColorStop(0, color + '44')
  grd.addColorStop(0.4, color + '14')
  grd.addColorStop(1, color + '00')
  ctx.save()
  ctx.globalAlpha = intensity
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = grd
  ctx.beginPath()
  ctx.ellipse(cx, cy, r, r * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

// Helper: get the screen position of the station's front-bottom point
// (south corner of footprint diamond), the top-back point at height h,
// and a "front face" approximation rectangle for drawing flat panels.
function stationBounds(s, height) {
  const front = isoProject(s.col + 1, s.row + 1)
  return {
    centerX: front.x + HALF_W,
    bottomY: front.y + TILE_H + 4,
    topY: front.y + TILE_H + 4 - height,
    height,
  }
}

function drawArcadeIso(ctx, s, time, isNear) {
  const H = 100
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#1d1118',
    rightFace: '#1f1019',
    leftFace: '#15090f',
    edge: 'rgba(255, 154, 90, 0.18)',
  })

  // Marquee on the top (use the top diamond center).
  const topCx = (top.x + bottom.x) / 2
  const topCy = (top.y + bottom.y) / 2
  ctx.save()
  ctx.font = '700 8px ui-monospace, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = isNear ? COLORS.warm : '#a06848'
  ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time / 350)
  ctx.fillText('VIREN ARCADE', topCx, topCy - 16)
  ctx.restore()

  // Front face panel: draw a screen rectangle attached to the right (south-east) face.
  // We map the right face's quad to a rectangle and draw inside it.
  const faceX = (right.x + bottom.x) / 2 - 30
  const faceY = (right.y + bottom.y) / 2 - 40
  const faceW = 56
  const faceH = 36
  // Screen background
  ctx.save()
  ctx.beginPath()
  ctx.rect(faceX, faceY, faceW, faceH)
  ctx.clip()
  ctx.fillStyle = '#020812'
  ctx.fillRect(faceX, faceY, faceW, faceH)
  drawArcadeScreen(ctx, faceX, faceY, faceW, faceH, s.slug, time)
  ctx.restore()

  // Screen bezel glow.
  ctx.strokeStyle = COLORS.warm + (isNear ? 'cc' : '88')
  ctx.lineWidth = 1
  ctx.strokeRect(faceX, faceY, faceW, faceH)

  // Joystick + buttons on the lower front face.
  ctx.fillStyle = '#0a0c14'
  ctx.fillRect(faceX, faceY + faceH + 2, faceW, 16)
  // Joystick ball
  ctx.fillStyle = isNear ? COLORS.warm : '#553'
  ctx.beginPath()
  ctx.arc(faceX + 12, faceY + faceH + 10, 2.5, 0, Math.PI * 2)
  ctx.fill()
  // Buttons
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#e94f4f', '#f3c43c', '#5cd17f'][i]
    ctx.globalAlpha = isNear ? 1 : 0.65
    ctx.beginPath()
    ctx.arc(faceX + 30 + i * 8, faceY + faceH + 10, 2.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

function drawArcadeScreen(ctx, x, y, w, h, slug, time) {
  if (slug === 'top-down-shooter') {
    const cx = x + w / 2
    const cy = y + h / 2
    for (let i = 0; i < 5; i++) {
      const t = (time / 280 + i * 0.55) % 1
      const ex = cx + Math.cos(i * 1.3) * t * w * 0.45
      const ey = cy + Math.sin(i * 1.3) * t * h * 0.45
      ctx.fillStyle = COLORS.warm
      ctx.fillRect(Math.round(ex), Math.round(ey), 2, 2)
    }
    for (let i = 0; i < 4; i++) {
      const a = time / 900 + (i * Math.PI * 2) / 4
      ctx.fillStyle = '#e94f4f'
      ctx.fillRect(Math.round(cx + Math.cos(a) * w * 0.35), Math.round(cy + Math.sin(a) * h * 0.35), 3, 3)
    }
    ctx.fillStyle = COLORS.cyan
    ctx.fillRect(Math.round(cx) - 2, Math.round(cy) - 2, 3, 3)
  } else if (slug === 'peggle') {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        const px = x + 6 + c * (w - 12) / 6
        const py = y + 6 + r * (h - 14) / 4
        const lit = (Math.floor(time / 350) + r * 6 + c) % 9 === 0
        ctx.fillStyle = lit ? COLORS.gold : '#3a3550'
        ctx.fillRect(Math.round(px), Math.round(py), 2, 2)
      }
    }
    const t = (time / 1400) % 1
    const bx = x + w / 2 + Math.sin(t * Math.PI * 4) * w * 0.35
    const by = y + 4 + t * (h - 8)
    ctx.fillStyle = COLORS.ink
    ctx.fillRect(Math.round(bx), Math.round(by), 3, 3)
  } else if (slug === '3d-environment') {
    const horizon = y + h * 0.45
    const scroll = (time / 30) % 8
    const skyG = ctx.createLinearGradient(x, y, x, horizon)
    skyG.addColorStop(0, '#3a2c4a')
    skyG.addColorStop(1, '#a06464')
    ctx.fillStyle = skyG
    ctx.fillRect(x, y, w, horizon - y)
    ctx.fillStyle = COLORS.gold
    ctx.beginPath()
    ctx.arc(x + w / 2, horizon - 2, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a0e22'
    ctx.fillRect(x, horizon, w, h - (horizon - y))
    ctx.strokeStyle = COLORS.pink
    ctx.lineWidth = 0.5
    for (let i = 0; i < 7; i++) {
      const yy = horizon + i * 5 + (scroll % 5)
      if (yy > y + h) continue
      ctx.beginPath()
      ctx.moveTo(x, yy)
      ctx.lineTo(x + w, yy)
      ctx.stroke()
    }
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath()
      ctx.moveTo(x + w / 2, horizon)
      ctx.lineTo(x + w / 2 + i * w * 0.25, y + h)
      ctx.stroke()
    }
  }

  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  for (let yy = y; yy < y + h; yy += 2) {
    ctx.fillRect(x, yy, w, 1)
  }
}

function drawAIDeskIso(ctx, s, time, isNear) {
  const H = 50
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#1a212e',
    rightFace: '#181d28',
    leftFace: '#10141d',
    edge: 'rgba(94, 232, 255, 0.18)',
  })

  // Monitor: placed on the top, slightly behind center, with stand.
  const topCx = (top.x + bottom.x) / 2
  const topCy = (top.y + bottom.y) / 2
  const monW = 54
  const monH = 36
  const monX = topCx - monW / 2
  const monY = topCy - monH - 4
  // Monitor frame
  ctx.fillStyle = '#0a0c12'
  ctx.fillRect(monX, monY, monW, monH)
  drawAIScreen(ctx, monX + 2, monY + 2, monW - 4, monH - 4, s.slug, time)
  ctx.strokeStyle = COLORS.cyan + (isNear ? 'cc' : '77')
  ctx.lineWidth = 1
  ctx.strokeRect(monX, monY, monW, monH)
  // Stand
  ctx.fillStyle = '#15192a'
  ctx.fillRect(topCx - 2, monY + monH, 4, 6)
  ctx.fillRect(topCx - 8, monY + monH + 6, 16, 3)

  // Keyboard on the front edge of the top diamond.
  ctx.fillStyle = '#10141d'
  ctx.fillRect(topCx - 14, topCy + 4, 28, 6)
  // Keys
  ctx.fillStyle = '#2a3146'
  for (let i = 0; i < 9; i++) {
    ctx.fillRect(topCx - 13 + i * 3, topCy + 5, 2, 2)
  }
}

function drawAIScreen(ctx, x, y, w, h, slug, time) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.fillStyle = '#070a12'
  ctx.fillRect(x, y, w, h)

  // Top bar
  ctx.fillStyle = '#11151e'
  ctx.fillRect(x, y, w, 4)
  ctx.fillStyle = '#e94f4f'; ctx.fillRect(x + 2, y + 1, 2, 2)
  ctx.fillStyle = '#f3c43c'; ctx.fillRect(x + 5, y + 1, 2, 2)
  ctx.fillStyle = '#5cd17f'; ctx.fillRect(x + 8, y + 1, 2, 2)

  if (slug === 'study-command-center') {
    const gridX = x + 3
    const gridY = y + 7
    const gridW = w * 0.5
    const gridH = h - 10
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        const cellX = gridX + c * (gridW / 5)
        const cellY = gridY + r * (gridH / 4)
        ctx.fillStyle = '#1a2030'
        ctx.fillRect(Math.round(cellX), Math.round(cellY), Math.round(gridW / 5 - 1), Math.round(gridH / 4 - 1))
        if ((r * 5 + c + Math.floor(time / 500)) % 7 === 0) {
          ctx.fillStyle = COLORS.cyan
          ctx.fillRect(Math.round(cellX) + 1, Math.round(cellY) + 1, 3, 2)
        }
      }
    }
    const chatX = x + gridW + 5
    const chatW = w - (gridW + 8)
    for (let i = 0; i < 6; i++) {
      const lw = chatW * (0.4 + ((i * 13 + Math.floor(time / 700)) % 6) * 0.1)
      ctx.fillStyle = i % 2 === 0 ? COLORS.cyan + '99' : '#3a4258'
      ctx.fillRect(Math.round(chatX), Math.round(y + 8 + i * 4), Math.max(2, Math.round(lw)), 2)
    }
  } else if (slug === 'la-ultra-running-plans') {
    const trY = y + h * 0.4
    ctx.strokeStyle = COLORS.cyan
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i < w - 4; i++) {
      const t = i / 6 + time / 200
      let yy = trY + Math.sin(t) * 1.5
      const beat = (i - (time / 8) % 30) % 30
      if (beat > 0 && beat < 5) yy -= 7
      else if (beat >= 5 && beat < 8) yy += 3
      if (i === 0) ctx.moveTo(x + 2 + i, yy)
      else ctx.lineTo(x + 2 + i, yy)
    }
    ctx.stroke()
    const blockY = y + h * 0.7
    for (let i = 0; i < 5; i++) {
      const lit = (i + Math.floor(time / 600)) % 5 === 0
      ctx.fillStyle = lit ? COLORS.cyan : '#2a3548'
      ctx.fillRect(x + 3 + i * (w - 6) / 5, blockY, (w - 8) / 5 - 1, 5)
    }
  }

  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  for (let yy = y; yy < y + h; yy += 2) ctx.fillRect(x, yy, w, 1)
  ctx.restore()
}

function drawAriaIso(ctx, s, time, isNear) {
  // Hover pad: small low extruded base.
  const H = 6
  drawExtrudedBox(ctx, s.col, s.row + 1, 2, 1, H, {
    top: '#0c1521',
    rightFace: '#091018',
    leftFace: '#050a10',
    edge: 'rgba(94, 232, 255, 0.3)',
  })

  // Hovering robot body, drawn floating above the pad.
  const c = isoTileCenter(s.col + 1, s.row + 1.5)
  const hover = Math.sin(time / 500) * 4
  const bx = c.x - 16
  const by = c.y - 60 + hover
  // Glow halo
  const haloG = ctx.createRadialGradient(c.x, c.y - 40 + hover, 0, c.x, c.y - 40 + hover, 60)
  haloG.addColorStop(0, COLORS.cyan + '88')
  haloG.addColorStop(1, COLORS.cyan + '00')
  ctx.save()
  ctx.globalAlpha = 0.5 + 0.15 * Math.sin(time / 400)
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = haloG
  ctx.beginPath()
  ctx.ellipse(c.x, c.y - 30 + hover, 50, 28, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Robot body
  ctx.fillStyle = '#0e1620'
  ctx.fillRect(bx, by, 32, 36)
  ctx.strokeStyle = COLORS.cyan
  ctx.lineWidth = 1.2
  ctx.strokeRect(bx, by, 32, 36)
  // Inner screen
  ctx.fillStyle = '#020812'
  ctx.fillRect(bx + 4, by + 6, 24, 22)
  // Eye
  const eyeH = (Math.sin(time / 1800) > 0.97) ? 1 : 6
  ctx.fillStyle = COLORS.cyan
  ctx.fillRect(bx + 12, by + 14, 8, eyeH)
  // Mouth line
  ctx.fillStyle = COLORS.cyan + '99'
  ctx.fillRect(bx + 12, by + 24, 8, 1)
  // Antenna
  ctx.strokeStyle = COLORS.cyan
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(bx + 16, by)
  ctx.lineTo(bx + 16, by - 6)
  ctx.stroke()
  ctx.fillStyle = COLORS.cyan
  ctx.beginPath()
  ctx.arc(bx + 16, by - 7, 2, 0, Math.PI * 2)
  ctx.fill()

  // Hover particles
  for (let i = 0; i < 5; i++) {
    const t = (time / 1400 + i / 5) % 1
    const px = c.x + Math.cos(i * 1.5 + time / 800) * 24
    const py = c.y - 6 + hover + (1 - t) * -16
    ctx.fillStyle = COLORS.cyan
    ctx.globalAlpha = (1 - t) * 0.7
    ctx.fillRect(Math.round(px), Math.round(py), 2, 2)
    ctx.globalAlpha = 1
  }

  if (isNear) {
    ctx.fillStyle = COLORS.cyan
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 200)
    ctx.font = '700 9px ui-monospace'
    ctx.textAlign = 'center'
    ctx.fillText('...', c.x + 22, c.y - 36 + hover)
    ctx.globalAlpha = 1
    ctx.textAlign = 'left'
  }
}

function drawTVIso(ctx, s, time, isNear) {
  const H = 80
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#0a0d14',
    rightFace: '#0a0d14',
    leftFace: '#05080e',
    edge: 'rgba(108, 245, 169, 0.18)',
  })

  // Big screen on the front (right) face.
  const screenW = 64
  const screenH = 42
  const sx = (right.x + bottom.x) / 2 - screenW / 2
  const sy = (right.y + bottom.y) / 2 - screenH - 4

  ctx.save()
  ctx.beginPath()
  ctx.rect(sx, sy, screenW, screenH)
  ctx.clip()
  // Animated reel
  const reelIdx = Math.floor(time / 2400) % 3
  const reelColors = [['#e94f4f', COLORS.gold], ['#5ee8ff', '#9d7cff'], ['#ff9a5a', '#6cf5a9']]
  const reelG = ctx.createLinearGradient(sx, sy, sx, sy + screenH)
  reelG.addColorStop(0, reelColors[reelIdx][0] + '44')
  reelG.addColorStop(1, reelColors[reelIdx][1] + '14')
  ctx.fillStyle = reelG
  ctx.fillRect(sx, sy, screenW, screenH)
  // Mountain silhouettes
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(sx, sy + screenH)
  ctx.lineTo(sx, sy + screenH * 0.55)
  ctx.lineTo(sx + screenW * 0.18, sy + screenH * 0.3)
  ctx.lineTo(sx + screenW * 0.36, sy + screenH * 0.5)
  ctx.lineTo(sx + screenW * 0.56, sy + screenH * 0.25)
  ctx.lineTo(sx + screenW * 0.78, sy + screenH * 0.45)
  ctx.lineTo(sx + screenW, sy + screenH * 0.35)
  ctx.lineTo(sx + screenW, sy + screenH)
  ctx.closePath()
  ctx.fill()
  // Scrolling text bar
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(sx, sy + screenH - 10, screenW, 10)
  ctx.fillStyle = reelColors[reelIdx][1]
  ctx.font = '700 7px ui-monospace, Menlo'
  ctx.textBaseline = 'middle'
  const titles = ['LA ULTRA · THE HIGH', 'MOVING MOUNTAINS WITHIN', 'RUN2FLY INITIATIVE']
  const scroll = (time / 60) % (screenW + 100)
  ctx.fillText(titles[reelIdx], sx + screenW - scroll + 4, sy + screenH - 5)
  // REC indicator
  ctx.fillStyle = '#e94f4f'
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 250)
  ctx.beginPath()
  ctx.arc(sx + screenW - 6, sy + 6, 2.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  for (let yy = sy; yy < sy + screenH; yy += 2) ctx.fillRect(sx, yy, screenW, 1)
  ctx.restore()

  ctx.strokeStyle = COLORS.green + (isNear ? 'cc' : '66')
  ctx.lineWidth = 1.2
  ctx.strokeRect(sx, sy, screenW, screenH)

  // Stand
  ctx.fillStyle = '#0a0c14'
  ctx.fillRect((bottom.x + (right.x + left.x) / 2) / 2 - 4, (right.y + bottom.y) / 2 - 4, 8, 8)
}

function drawPedestalIso(ctx, s, time, isNear) {
  const H = 60
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#1a2030',
    rightFace: '#141a26',
    leftFace: '#0d1119',
    edge: 'rgba(108, 245, 169, 0.25)',
  })

  // Glowing column on top.
  const topCx = (top.x + bottom.x) / 2
  const topCy = (top.y + bottom.y) / 2
  const colW = 24
  const colH = 40
  const colX = topCx - colW / 2
  const colY = topCy - colH - 4

  const colG = ctx.createLinearGradient(colX, colY, colX, colY + colH)
  colG.addColorStop(0, COLORS.green + 'cc')
  colG.addColorStop(1, COLORS.green + '22')
  ctx.fillStyle = colG
  ctx.fillRect(colX, colY, colW, colH)
  // Bevel
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.fillRect(colX, colY, 2, colH)
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(colX + colW - 2, colY, 2, colH)

  // Floating "i" badge
  ctx.fillStyle = COLORS.green
  ctx.globalAlpha = isNear ? 1 : 0.85
  ctx.beginPath()
  ctx.arc(topCx, colY + 12 + Math.sin(time / 700) * 2, 3.5, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillRect(topCx - 4, colY + 18 + Math.sin(time / 700) * 2, 8, 12)
  ctx.globalAlpha = 1

  // Wisps rising
  for (let i = 0; i < 4; i++) {
    const t = ((time / 1700) + i / 4) % 1
    const px = topCx + Math.sin(i * 1.7 + time / 600) * 7
    const py = colY + colH - t * (colH + 14)
    ctx.fillStyle = COLORS.green
    ctx.globalAlpha = (1 - t) * 0.8
    ctx.fillRect(Math.round(px), Math.round(py), 1.5, 1.5)
  }
  ctx.globalAlpha = 1
}

function drawTrophyIso(ctx, s, time, isNear) {
  const H = 50
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#231811',
    rightFace: '#1a1209',
    leftFace: '#100a06',
    edge: 'rgba(255, 209, 102, 0.22)',
  })

  const topCx = (top.x + bottom.x) / 2
  const topCy = (top.y + bottom.y) / 2

  // Trophy cup on top
  const ty = topCy - 26
  ctx.fillStyle = COLORS.gold
  ctx.beginPath()
  ctx.moveTo(topCx - 12, ty)
  ctx.lineTo(topCx + 12, ty)
  ctx.lineTo(topCx + 9, ty + 16)
  ctx.lineTo(topCx - 9, ty + 16)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#fff3b8'
  ctx.fillRect(topCx - 11, ty + 2, 2, 10)
  ctx.fillStyle = COLORS.gold
  ctx.fillRect(topCx - 3, ty + 16, 6, 6)
  ctx.fillRect(topCx - 8, ty + 22, 16, 4)

  // Spinning star above
  ctx.save()
  ctx.translate(topCx, ty - 10 + Math.sin(time / 700) * 1.5)
  ctx.rotate((time / 1000) * 0.3)
  ctx.fillStyle = COLORS.gold
  ctx.globalAlpha = isNear ? 1 : 0.85
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 6 : 2.6
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const px = Math.cos(a) * r
    const py = Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Sparkles
  for (let i = 0; i < 4; i++) {
    const t = ((time / 1500) + i / 4) % 1
    const angle = i * 1.7
    const px = topCx + Math.cos(angle) * (1 - t) * 26
    const py = ty + 4 + Math.sin(angle) * (1 - t) * 12 - t * 8
    ctx.fillStyle = COLORS.gold
    ctx.globalAlpha = (1 - t) * 0.9
    ctx.fillRect(Math.round(px), Math.round(py), 2, 2)
  }
  ctx.globalAlpha = 1
}

function drawPhoneIso(ctx, s, time, isNear) {
  const H = 110
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#1a0f0a',
    rightFace: '#150a06',
    leftFace: '#0b0503',
    edge: 'rgba(255, 154, 90, 0.28)',
  })

  // Glass panel on the front (right) face.
  const gx = (right.x + bottom.x) / 2 - 20
  const gy = (right.y + bottom.y) / 2 - 56
  const gw = 40
  const gh = 50
  ctx.fillStyle = '#050d18'
  ctx.fillRect(gx, gy, gw, gh)
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(gx + 2, gy + 2, 3, gh - 4)
  // Animated CRT terminal lines inside
  ctx.save()
  ctx.beginPath()
  ctx.rect(gx + 4, gy + 6, gw - 8, gh - 14)
  ctx.clip()
  ctx.font = '700 6px ui-monospace, Menlo'
  ctx.fillStyle = COLORS.warm + '99'
  for (let i = 0; i < 6; i++) {
    const lw = 12 + ((i * 11 + Math.floor(time / 400)) % 18)
    ctx.fillRect(gx + 4, gy + 8 + i * 6, lw, 1.5)
  }
  ctx.restore()
  // Glowing "@" symbol
  ctx.font = '700 18px ui-monospace, Menlo'
  ctx.fillStyle = COLORS.warm
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = isNear ? 1 : 0.7 + 0.3 * Math.sin(time / 400)
  ctx.fillText('@', gx + gw / 2, gy + gh - 8)
  ctx.globalAlpha = 1
  ctx.textAlign = 'left'

  ctx.strokeStyle = COLORS.warm + (isNear ? 'cc' : '77')
  ctx.lineWidth = 1.2
  ctx.strokeRect(gx, gy, gw, gh)

  // Light strip on top
  ctx.fillStyle = COLORS.warm + '88'
  ctx.fillRect(top.x + 8, top.y + 4, TILE_W - 12, 1.5)
}

function drawSkillTreeIso(ctx, s, time, isNear) {
  const H = 80
  const { top, right, bottom, left } = drawExtrudedBox(ctx, s.col, s.row, 2, 2, H, {
    top: '#1a1408',
    rightFace: '#13100a',
    leftFace: '#09060a',
    edge: 'rgba(255, 209, 102, 0.28)',
  })

  // Holographic tree branch glyph on top.
  const topCx = (top.x + bottom.x) / 2
  const topCy = (top.y + bottom.y) / 2

  // Pillar
  ctx.fillStyle = '#0a0810'
  ctx.fillRect(topCx - 6, topCy - 60, 12, 50)
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fillRect(topCx - 6, topCy - 60, 2, 50)

  // 4 floating skill-branch nodes around the top
  const branches = [
    { c: COLORS.warm, dx: -18, dy: -54 }, // game (left)
    { c: COLORS.cyan, dx: 18, dy: -54 },  // ai (right)
    { c: COLORS.green, dx: -10, dy: -68 },// tools (top-left)
    { c: COLORS.gold, dx: 10, dy: -68 },  // soft (top-right)
  ]
  // Connecting lines from pillar top to each branch
  ctx.strokeStyle = 'rgba(255, 209, 102, 0.5)'
  ctx.lineWidth = 1
  for (const b of branches) {
    ctx.beginPath()
    ctx.moveTo(topCx, topCy - 56)
    ctx.lineTo(topCx + b.dx, topCy + b.dy)
    ctx.stroke()
  }
  // Nodes with pulse
  branches.forEach((b, i) => {
    const pulse = 0.7 + 0.3 * Math.sin(time / 400 + i)
    ctx.fillStyle = b.c
    ctx.globalAlpha = isNear ? 1 : 0.85
    ctx.beginPath()
    ctx.arc(topCx + b.dx, topCy + b.dy, 3.5 * pulse, 0, Math.PI * 2)
    ctx.fill()
    // Glow
    const g = ctx.createRadialGradient(topCx + b.dx, topCy + b.dy, 0, topCx + b.dx, topCy + b.dy, 12)
    g.addColorStop(0, b.c + '88')
    g.addColorStop(1, b.c + '00')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(topCx + b.dx, topCy + b.dy, 12, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

// ───────────────── Floating label ─────────────────

function drawFloatingLabel(ctx, cx, baseY, title, subtitle, color, time) {
  const bob = Math.sin(time / 400) * 2
  const y = baseY + bob
  ctx.save()
  ctx.font = '700 12px ui-monospace, Menlo, Consolas, monospace'
  const titleW = ctx.measureText(title).width
  ctx.font = '600 10px ui-monospace, Menlo, Consolas, monospace'
  const subW = ctx.measureText(subtitle || '').width
  const w = Math.max(titleW, subW) + 20
  const h = subtitle ? 32 : 22
  const bx = cx - w / 2
  const by = y - h - 6

  ctx.fillStyle = 'rgba(8, 10, 16, 0.94)'
  roundRect(ctx, bx, by, w, h, 8)
  ctx.fill()
  ctx.strokeStyle = color + 'cc'
  ctx.lineWidth = 1
  roundRect(ctx, bx, by, w, h, 8)
  ctx.stroke()

  ctx.font = '700 12px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, cx, by + (subtitle ? 10 : h / 2))
  if (subtitle) {
    ctx.font = '600 10px ui-monospace, Menlo, Consolas, monospace'
    ctx.fillStyle = COLORS.inkDim
    ctx.fillText(subtitle, cx, by + 22)
  }
  ctx.fillStyle = 'rgba(8, 10, 16, 0.94)'
  ctx.beginPath()
  ctx.moveTo(cx - 5, by + h)
  ctx.lineTo(cx + 5, by + h)
  ctx.lineTo(cx, by + h + 5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
  ctx.textAlign = 'left'
}

function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.lineTo(x + w - rr, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr)
  ctx.lineTo(x + w, y + h - rr)
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h)
  ctx.lineTo(x + rr, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr)
  ctx.lineTo(x, y + rr)
  ctx.quadraticCurveTo(x, y, x + rr, y)
  ctx.closePath()
}

// ───────────────── Quest markers (floating "!" + ring) ─────────────────

export function drawQuestMarker(ctx, station, camX, camY, time, isCompleted, scanBoost = false) {
  ctx.save()
  ctx.translate(-camX, -camY)
  const c = isoTileCenter(station.col + 1, station.row)
  const baseY = c.y - (scanBoost ? 132 : 116)
  const bob = Math.sin(time / 400 + (station.col + station.row)) * (scanBoost ? 6 : 4)
  const x = c.x
  const y = baseY + bob

  const accent = isCompleted ? COLORS.green : pickAccent(station.accent)

  // Halo
  const haloR = scanBoost ? 34 : isCompleted ? 14 : 19
  const haloG = ctx.createRadialGradient(x, y + 6, 0, x, y + 6, haloR)
  haloG.addColorStop(0, accent + 'cc')
  haloG.addColorStop(0.35, accent + (scanBoost ? '70' : '28'))
  haloG.addColorStop(1, accent + '00')
  ctx.fillStyle = haloG
  ctx.beginPath()
  ctx.arc(x, y + 6, haloR, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(x, y + 6)
  ctx.rotate(Math.sin(time / 800 + station.col) * 0.08)
  ctx.strokeStyle = accent + (isCompleted ? '88' : 'dd')
  ctx.lineWidth = scanBoost ? 2 : 1
  ctx.beginPath()
  ctx.moveTo(0, scanBoost ? -22 : -16)
  ctx.lineTo(scanBoost ? 18 : 13, 0)
  ctx.lineTo(0, scanBoost ? 22 : 16)
  ctx.lineTo(scanBoost ? -18 : -13, 0)
  ctx.closePath()
  ctx.stroke()
  if (scanBoost && !isCompleted) {
    ctx.strokeStyle = accent + '55'
    ctx.lineWidth = 5
    ctx.stroke()
  }
  ctx.restore()

  // Glyph
  ctx.font = isCompleted
    ? '800 9px ui-monospace, Menlo, Consolas, monospace'
    : '900 18px ui-monospace, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const glyph = isCompleted ? 'OK' : '!'
  ctx.fillStyle = '#0c0d12'
  ctx.fillText(glyph, x, y + 6 + 1)
  ctx.fillStyle = accent
  ctx.fillText(glyph, x, y + 6)

  if (scanBoost && !isCompleted) {
    const label = station.label.toUpperCase().slice(0, 18)
    ctx.font = '800 9px ui-monospace, Menlo, Consolas, monospace'
    const labelW = Math.min(150, ctx.measureText(label).width + 18)
    const bx = x - labelW / 2
    const by = y + 34
    ctx.fillStyle = 'rgba(5, 8, 14, 0.94)'
    roundRect(ctx, bx, by, labelW, 18, 5)
    ctx.fill()
    ctx.strokeStyle = accent + 'bb'
    ctx.lineWidth = 1
    roundRect(ctx, bx, by, labelW, 18, 5)
    ctx.stroke()
    ctx.fillStyle = accent
    ctx.fillText(label, x, by + 9)
  }
  ctx.textAlign = 'left'
  ctx.restore()
}

// ───────────────── Player ─────────────────

export function drawPlayer(ctx, isoX, isoY, dir, animFrame, moving, time) {
  const x = Math.round(isoX)
  const y = Math.round(isoY)

  ctx.fillStyle = 'rgba(0,0,0,0.5)'
  ctx.beginPath()
  ctx.ellipse(x, y + 6, 10, 4, 0, 0, Math.PI * 2)
  ctx.fill()

  const bob = moving ? Math.sin(animFrame * Math.PI) * 1 : Math.sin(time / 700) * 0.5
  const ox = x - 9
  const oy = y - 28 + bob

  // Legs
  const legSwing = moving ? Math.sin(animFrame * Math.PI) * 2 : 0
  ctx.fillStyle = COLORS.pants
  if (dir === 'left' || dir === 'right') {
    ctx.fillRect(ox + 5, oy + 18, 3, 8 - Math.abs(legSwing))
    ctx.fillRect(ox + 10, oy + 18, 3, 8 + Math.abs(legSwing) * 0.5)
  } else {
    ctx.fillRect(ox + 5 + legSwing * 0.3, oy + 18, 3, 8)
    ctx.fillRect(ox + 10 - legSwing * 0.3, oy + 18, 3, 8)
  }
  ctx.fillStyle = COLORS.shoe
  ctx.fillRect(ox + 5, oy + 25, 4, 2)
  ctx.fillRect(ox + 10, oy + 25, 4, 2)

  // Torso
  ctx.fillStyle = COLORS.shirt
  ctx.fillRect(ox + 4, oy + 10, 10, 9)
  ctx.fillStyle = COLORS.shirtShadow
  ctx.fillRect(ox + 4, oy + 17, 10, 2)
  ctx.fillStyle = COLORS.shirtHi
  if (dir === 'left') ctx.fillRect(ox + 11, oy + 10, 3, 7)
  else if (dir === 'right') ctx.fillRect(ox + 4, oy + 10, 3, 7)
  else ctx.fillRect(ox + 7, oy + 10, 3, 7)

  // Arms
  ctx.fillStyle = COLORS.shirt
  const armSwing = moving ? Math.sin(animFrame * Math.PI + Math.PI) * 1.5 : 0
  if (dir === 'down') {
    ctx.fillRect(ox + 1, oy + 11 + armSwing * 0.4, 3, 5)
    ctx.fillRect(ox + 14, oy + 11 - armSwing * 0.4, 3, 5)
  } else if (dir === 'up') {
    ctx.fillRect(ox + 1, oy + 11 - armSwing * 0.4, 3, 5)
    ctx.fillRect(ox + 14, oy + 11 + armSwing * 0.4, 3, 5)
  } else if (dir === 'left') {
    ctx.fillRect(ox + 2, oy + 11, 3, 5 + armSwing)
  } else if (dir === 'right') {
    ctx.fillRect(ox + 13, oy + 11, 3, 5 + armSwing)
  }
  ctx.fillStyle = COLORS.skin
  if (dir === 'down' || dir === 'up') {
    ctx.fillRect(ox + 1, oy + 15, 3, 2)
    ctx.fillRect(ox + 14, oy + 15, 3, 2)
  } else if (dir === 'left') {
    ctx.fillRect(ox + 2, oy + 15 + armSwing, 3, 2)
  } else if (dir === 'right') {
    ctx.fillRect(ox + 13, oy + 15 + armSwing, 3, 2)
  }

  // Head
  ctx.fillStyle = COLORS.skin
  ctx.fillRect(ox + 5, oy + 2, 8, 8)
  ctx.fillStyle = COLORS.skinShadow
  ctx.fillRect(ox + 5, oy + 9, 8, 1)
  ctx.fillStyle = COLORS.hair
  ctx.fillRect(ox + 5, oy + 1, 8, 3)
  if (dir === 'left') ctx.fillRect(ox + 5, oy + 2, 1, 6)
  if (dir === 'right') ctx.fillRect(ox + 12, oy + 2, 1, 6)
  if (dir === 'up') ctx.fillRect(ox + 5, oy + 1, 8, 8)

  if (dir !== 'up') {
    ctx.fillStyle = '#0a0d12'
    if (dir === 'left') {
      ctx.fillRect(ox + 6, oy + 5, 1, 1)
    } else if (dir === 'right') {
      ctx.fillRect(ox + 11, oy + 5, 1, 1)
    } else {
      ctx.fillRect(ox + 6, oy + 5, 1, 1)
      ctx.fillRect(ox + 11, oy + 5, 1, 1)
    }
  }
}

// Ambient drone NPC: patrols a small loop on the floor between zones.
export function drawDroneNPC(ctx, isoX, isoY, time) {
  const x = Math.round(isoX)
  const y = Math.round(isoY)
  // Floor shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.beginPath()
  ctx.ellipse(x, y + 4, 6, 2, 0, 0, Math.PI * 2)
  ctx.fill()
  // Drone body
  const hover = Math.sin(time / 400) * 2
  ctx.fillStyle = '#1a1f30'
  ctx.beginPath()
  ctx.ellipse(x, y - 10 + hover, 6, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  // Top light
  ctx.fillStyle = COLORS.pink
  ctx.beginPath()
  ctx.arc(x, y - 13 + hover, 1.6, 0, Math.PI * 2)
  ctx.fill()
  // Glow
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(x, y - 10 + hover, 0, x, y - 10 + hover, 14)
  g.addColorStop(0, 'rgba(255, 110, 199, 0.6)')
  g.addColorStop(1, 'rgba(255, 110, 199, 0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y - 10 + hover, 14, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  // Trail
  ctx.fillStyle = COLORS.pink + '66'
  ctx.beginPath()
  ctx.arc(x, y - 6 + hover, 1.2, 0, Math.PI * 2)
  ctx.fill()
}

// Ambient dust particles drifting over the camera viewport.
export function drawAmbientDust(ctx, viewW, viewH, time) {
  const count = 58
  for (let i = 0; i < count; i++) {
    const seed = i * 12.9898
    const baseX = ((seed * 78.233) % 1) * viewW
    const baseY = ((seed * 41.221) % 1) * viewH
    const drift = (time / (20 + (i % 5) * 6) + i * 60) % (viewW + 200) - 100
    const x = (baseX + drift) % viewW
    const y = baseY + Math.sin(time / 1200 + i) * 8
    const size = (i % 6 === 0) ? 1.8 : (i % 3 === 0) ? 1.2 : 0.8
    const alpha = 0.06 + (i % 5) * 0.035
    const warm = i % 7 === 0
    ctx.fillStyle = warm ? `rgba(255, 154, 90, ${alpha})` : `rgba(94, 232, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawForegroundAtmosphere(ctx, viewW, viewH, time) {
  ctx.save()
  ctx.globalCompositeOperation = 'screen'

  for (let i = 0; i < 3; i++) {
    const x = viewW * (0.18 + i * 0.31) + Math.sin(time / 3000 + i) * 38
    const grd = ctx.createLinearGradient(x - 70, 0, x + 40, viewH)
    grd.addColorStop(0, 'rgba(94, 232, 255, 0)')
    grd.addColorStop(0.45, i % 2 ? 'rgba(255, 154, 90, 0.04)' : 'rgba(94, 232, 255, 0.05)')
    grd.addColorStop(1, 'rgba(94, 232, 255, 0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.moveTo(x - 90, 0)
    ctx.lineTo(x + 20, 0)
    ctx.lineTo(x + 110, viewH)
    ctx.lineTo(x - 80, viewH)
    ctx.closePath()
    ctx.fill()
  }

  for (let i = 0; i < 42; i++) {
    const seed = i * 73
    const x = ((seed + time / (7 + (i % 5))) % (viewW + 160)) - 80
    const y = ((seed * 1.9 + time / (15 + (i % 4))) % (viewH + 120)) - 60
    const len = 26 + (i % 4) * 11
    ctx.strokeStyle = i % 6 === 0 ? 'rgba(255, 154, 90, 0.07)' : 'rgba(173, 220, 235, 0.065)'
    ctx.lineWidth = i % 7 === 0 ? 1.2 : 0.7
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x - len * 0.42, y + len)
    ctx.stroke()
  }

  drawAnamorphicFlares(ctx, viewW, viewH, time)

  for (let i = 0; i < 4; i++) {
    const w = viewW * (0.42 + i * 0.04)
    const x = ((time / (42 + i * 11) + i * 230) % (viewW + w)) - w
    const y = viewH * (0.78 + i * 0.05)
    const g = ctx.createRadialGradient(x + w / 2, y, 0, x + w / 2, y, w / 2)
    g.addColorStop(0, 'rgba(173, 204, 220, 0.045)')
    g.addColorStop(1, 'rgba(173, 204, 220, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x + w / 2, y, w / 2, 34, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawAnamorphicFlares(ctx, viewW, viewH, time) {
  const flares = [
    { x: viewW * 0.25 + Math.sin(time / 2100) * 40, y: viewH * 0.28, color: 'rgba(94, 232, 255, 0.13)' },
    { x: viewW * 0.63 + Math.sin(time / 2600 + 2) * 36, y: viewH * 0.42, color: 'rgba(255, 154, 90, 0.10)' },
    { x: viewW * 0.78 + Math.sin(time / 2400 + 4) * 30, y: viewH * 0.66, color: 'rgba(255, 209, 102, 0.09)' },
  ]

  ctx.save()
  ctx.globalCompositeOperation = 'screen'
  for (const f of flares) {
    const g = ctx.createLinearGradient(f.x - 180, f.y, f.x + 180, f.y)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.5, f.color)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(f.x - 180, f.y - 1, 360, 2)
  }
  ctx.restore()
}

export function drawDataShard(ctx, shard, camX, camY, time) {
  const p = isoTileCenter(shard.col, shard.row)
  const x = p.x - camX
  const y = p.y - camY - 18 + Math.sin(time / 420 + shard.col) * 4
  const color = shard.kind === 'game' ? COLORS.warm : shard.kind === 'career' ? COLORS.gold : COLORS.cyan

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  const g = ctx.createRadialGradient(x, y, 0, x, y, 28)
  g.addColorStop(0, color + 'aa')
  g.addColorStop(1, color + '00')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, 28, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(time / 900 + shard.col)
  ctx.fillStyle = '#071019'
  ctx.strokeStyle = color
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, -9)
  ctx.lineTo(8, 0)
  ctx.lineTo(0, 9)
  ctx.lineTo(-8, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = color
  ctx.fillRect(-2, -2, 4, 4)
  ctx.restore()

  ctx.fillStyle = color + '77'
  ctx.beginPath()
  ctx.ellipse(x, y + 22, 12, 4, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

export function drawScanPulse(ctx, player, camX, camY, age) {
  const center = isoTileCenter(player.col - 0.5, player.row - 0.5)
  const x = center.x - camX
  const y = center.y - camY
  const t = Math.min(1, age / 1200)
  const radius = 40 + t * 420
  const alpha = Math.max(0, 1 - t)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.strokeStyle = `rgba(94, 232, 255, ${0.42 * alpha})`
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(x, y, radius, radius * 0.46, 0, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = `rgba(255, 209, 102, ${0.24 * alpha})`
  ctx.lineWidth = 1
  ctx.setLineDash([10, 10])
  ctx.lineDashOffset = -age / 18
  ctx.beginPath()
  ctx.ellipse(x, y, radius * 0.72, radius * 0.32, 0, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()
}
