// All canvas drawing lives here. Everything is rendered procedurally with
// canvas primitives (no sprite assets), so the bundle stays tiny and the look
// stays consistent. The aesthetic: dark floor, neon-glow stations, soft pixel
// vibe through `imageSmoothingEnabled = false` on the canvas.

import { TILE, TILES, WORLD_W, WORLD_H, STATION_BLOCKS } from './world.js'

const COLORS = {
  bg: '#06070b',
  floor: '#0e1219',
  floor2: '#11161e',
  floorCyan: '#0d1620',
  floorWarm: '#1a1410',
  grid: 'rgba(255, 255, 255, 0.025)',
  gridStrong: 'rgba(255, 255, 255, 0.05)',
  wallTop: '#1c2333',
  wallSide: '#0d111a',
  wallEdge: 'rgba(94, 232, 255, 0.18)',
  wallEdgeWarm: 'rgba(255, 154, 90, 0.16)',
  cyan: '#5ee8ff',
  cyanGlow: 'rgba(94, 232, 255, 0.45)',
  warm: '#ff9a5a',
  warmGlow: 'rgba(255, 154, 90, 0.45)',
  green: '#6cf5a9',
  greenGlow: 'rgba(108, 245, 169, 0.4)',
  gold: '#ffd166',
  goldGlow: 'rgba(255, 209, 102, 0.45)',
  pink: '#ff6ec7',
  ink: '#e8ecf2',
  inkDim: '#98a0b0',
  skin: '#f1c9a5',
  skinShadow: '#c19474',
  hair: '#2a2018',
  hairHi: '#3d2f24',
  shirt: '#2e4a7a',
  shirtHi: '#3e6098',
  shirtShadow: '#1e3258',
  pants: '#1a1f2a',
  shoe: '#0a0d12',
}

export { COLORS }

// ───────────────────────── Floor + Walls ─────────────────────────

export function drawFloor(ctx, camX, camY, viewW, viewH, time) {
  // Background fill.
  ctx.fillStyle = COLORS.bg
  ctx.fillRect(0, 0, viewW, viewH)

  // Determine visible tile range.
  const startCol = Math.max(0, Math.floor(camX / TILE) - 1)
  const endCol = Math.min(WORLD_W, Math.ceil((camX + viewW) / TILE) + 1)
  const startRow = Math.max(0, Math.floor(camY / TILE) - 1)
  const endRow = Math.min(WORLD_H, Math.ceil((camY + viewH) / TILE) + 1)

  for (let r = startRow; r < endRow; r++) {
    for (let c = startCol; c < endCol; c++) {
      const t = TILES[r][c]
      const x = c * TILE - camX
      const y = r * TILE - camY
      if (t === 'h') {
        drawWallTile(ctx, x, y, c, r)
      } else if (t === ',') {
        // Cyan-tinted floor.
        ctx.fillStyle = COLORS.floorCyan
        ctx.fillRect(x, y, TILE, TILE)
        ctx.fillStyle = COLORS.grid
        ctx.fillRect(x, y, TILE, 1)
        ctx.fillRect(x, y, 1, TILE)
      } else if (t === '-') {
        // Warm-tinted floor.
        ctx.fillStyle = COLORS.floorWarm
        ctx.fillRect(x, y, TILE, TILE)
        ctx.fillStyle = COLORS.grid
        ctx.fillRect(x, y, TILE, 1)
        ctx.fillRect(x, y, 1, TILE)
      } else {
        // Plain floor with subtle checker.
        ctx.fillStyle = (c + r) % 2 === 0 ? COLORS.floor : COLORS.floor2
        ctx.fillRect(x, y, TILE, TILE)
        ctx.fillStyle = COLORS.grid
        ctx.fillRect(x, y, TILE, 1)
        ctx.fillRect(x, y, 1, TILE)
      }
    }
  }

  // Zone labels (rendered into the world, faint).
  drawZoneLabel(ctx, 'AI · APPLIED INTELLIGENCE', 18, 2.6, COLORS.cyan, 0.18, camX, camY)
  drawZoneLabel(ctx, 'GAMES · INTERACTIVE WORK', 18, 13.6, COLORS.warm, 0.16, camX, camY)
}

function drawWallTile(ctx, x, y, col, row) {
  // Top face.
  ctx.fillStyle = COLORS.wallTop
  ctx.fillRect(x, y, TILE, TILE)
  // Top edge highlight.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)'
  ctx.fillRect(x, y, TILE, 2)
  // Bottom dark edge.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.fillRect(x, y + TILE - 2, TILE, 2)
  // Glowing accent on top wall row (visual flair).
  if (row === 0) {
    ctx.fillStyle = COLORS.wallEdge
    ctx.fillRect(x, y + TILE - 1, TILE, 1)
  }
  if (row === WORLD_H - 1) {
    ctx.fillStyle = COLORS.wallEdgeWarm
    ctx.fillRect(x, y, TILE, 1)
  }
}

function drawZoneLabel(ctx, text, col, row, color, alpha, camX, camY) {
  const x = col * TILE - camX
  const y = row * TILE - camY
  ctx.save()
  ctx.font = '700 11px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = color
  ctx.globalAlpha = alpha
  ctx.textBaseline = 'top'
  ctx.letterSpacing = '2px'
  ctx.fillText(text, x, y)
  ctx.restore()
}

// ───────────────────────── Stations ─────────────────────────

export function drawStation(ctx, station, camX, camY, time, isNear) {
  const x = station.col * TILE - camX
  const y = station.row * TILE - camY
  const w = TILE * 2
  const h = TILE * 2

  // Ambient glow under station.
  const glowColor = pickGlow(station.accent)
  drawGroundGlow(ctx, x + w / 2, y + h + 6, w * 0.9, glowColor, isNear ? 0.7 : 0.4, time)

  switch (station.kind) {
    case 'arcade':
      drawArcade(ctx, x, y, w, h, time, isNear, station)
      break
    case 'aiDesk':
      drawAIDesk(ctx, x, y, w, h, time, isNear, station)
      break
    case 'aria':
      drawAria(ctx, x, y, w, h, time, isNear)
      break
    case 'tv':
      drawTV(ctx, x, y, w, h, time, isNear)
      break
    case 'pedestal':
      drawPedestal(ctx, x, y, w, h, time, isNear)
      break
    case 'trophy':
      drawTrophy(ctx, x, y, w, h, time, isNear)
      break
    case 'phone':
      drawPhoneBooth(ctx, x, y, w, h, time, isNear)
      break
  }

  // Floating label when nearby.
  if (isNear) {
    drawFloatingLabel(ctx, x + w / 2, y - 8, station.label, station.subtitle, glowColor, time)
  }
}

function pickGlow(accent) {
  if (accent === 'cyan') return COLORS.cyan
  if (accent === 'warm') return COLORS.warm
  if (accent === 'green') return COLORS.green
  if (accent === 'gold') return COLORS.gold
  return COLORS.cyan
}

function drawGroundGlow(ctx, cx, cy, radius, color, intensity, time) {
  const pulse = 0.8 + 0.2 * Math.sin(time / 600)
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * pulse)
  grd.addColorStop(0, color + '44')
  grd.addColorStop(0.5, color + '14')
  grd.addColorStop(1, color + '00')
  ctx.save()
  ctx.globalAlpha = intensity
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = grd
  ctx.fillRect(cx - radius, cy - radius * 0.6, radius * 2, radius * 1.2)
  ctx.restore()
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

// Arcade cabinet — tall block with marquee + screen + control panel.
function drawArcade(ctx, x, y, w, h, time, isNear, station) {
  // Cabinet body (shifted up so it stands taller than 2 tiles visually).
  const bx = x + 6
  const by = y - 18
  const bw = w - 12
  const bh = h + 18

  // Shadow base
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
  roundRect(ctx, bx - 2, by + bh - 6, bw + 4, 8, 4)
  ctx.fill()

  // Cabinet side gradient.
  const sideGrd = ctx.createLinearGradient(bx, by, bx + bw, by)
  sideGrd.addColorStop(0, '#1a1018')
  sideGrd.addColorStop(0.5, '#2a1a26')
  sideGrd.addColorStop(1, '#1a1018')
  ctx.fillStyle = sideGrd
  roundRect(ctx, bx, by, bw, bh, 6)
  ctx.fill()

  // Marquee (top strip).
  const my = by + 4
  const mh = 12
  ctx.fillStyle = '#000'
  roundRect(ctx, bx + 4, my, bw - 8, mh, 3)
  ctx.fill()
  // Marquee glow text.
  const marqueeColor = isNear ? COLORS.warm : '#cc7748'
  ctx.fillStyle = marqueeColor
  ctx.globalAlpha = 0.85 + 0.15 * Math.sin(time / 350)
  ctx.font = '700 7px ui-monospace, Menlo, Consolas, monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('VIREN ARCADE', bx + bw / 2, my + mh / 2 + 0.5)
  ctx.globalAlpha = 1
  ctx.textAlign = 'left'

  // Screen (the heart of it).
  const sx = bx + 6
  const sy = my + mh + 4
  const sw = bw - 12
  const sh = bh * 0.5
  ctx.fillStyle = '#000'
  roundRect(ctx, sx, sy, sw, sh, 3)
  ctx.fill()

  // Screen content — animated mini-preview.
  drawArcadeScreen(ctx, sx + 2, sy + 2, sw - 4, sh - 4, station.slug, time)

  // Screen border glow.
  ctx.strokeStyle = COLORS.warm + (isNear ? 'cc' : '66')
  ctx.lineWidth = 1
  roundRect(ctx, sx, sy, sw, sh, 3)
  ctx.stroke()

  // Control panel below screen.
  const cx = sx
  const cy = sy + sh + 4
  const cw = sw
  const ch = bh - (cy - by) - 8
  ctx.fillStyle = '#0a0a10'
  roundRect(ctx, cx, cy, cw, ch, 3)
  ctx.fill()
  // Joystick + buttons
  ctx.fillStyle = '#222'
  ctx.beginPath()
  ctx.arc(cx + cw * 0.3, cy + ch * 0.55, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = isNear ? COLORS.warm : '#553'
  ctx.beginPath()
  ctx.arc(cx + cw * 0.3, cy + ch * 0.55, 1.5, 0, Math.PI * 2)
  ctx.fill()
  // Three buttons.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = ['#e94f4f', '#f3c43c', '#5cd17f'][i]
    ctx.globalAlpha = isNear ? 1 : 0.65
    ctx.beginPath()
    ctx.arc(cx + cw * 0.55 + i * 6, cy + ch * 0.55, 1.7, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

// Tiny animated screens unique to each game project.
function drawArcadeScreen(ctx, x, y, w, h, slug, time) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  // CRT scanline base
  ctx.fillStyle = '#02050a'
  ctx.fillRect(x, y, w, h)

  if (slug === 'top-down-shooter') {
    // Top-down player + enemies + bullets
    const cx = x + w / 2
    const cy = y + h / 2
    // Bullets
    for (let i = 0; i < 4; i++) {
      const t = (time / 250 + i * 0.5) % 1
      const ex = cx + Math.cos(i * 1.5) * t * w * 0.5
      const ey = cy + Math.sin(i * 1.5) * t * h * 0.5
      ctx.fillStyle = COLORS.warm
      ctx.fillRect(Math.round(ex), Math.round(ey), 1, 1)
    }
    // Enemies (red dots)
    for (let i = 0; i < 3; i++) {
      const a = time / 800 + (i * Math.PI * 2) / 3
      ctx.fillStyle = '#e94f4f'
      ctx.fillRect(Math.round(cx + Math.cos(a) * w * 0.3), Math.round(cy + Math.sin(a) * h * 0.3), 2, 2)
    }
    // Player (center)
    ctx.fillStyle = COLORS.cyan
    ctx.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 2, 2)
  } else if (slug === 'peggle') {
    // Peg field + bouncing ball
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        const px = x + 4 + c * (w - 8) / 5
        const py = y + 6 + r * (h - 14) / 4
        const lit = (Math.floor(time / 400) + r * 6 + c) % 9 === 0
        ctx.fillStyle = lit ? COLORS.gold : '#3a3550'
        ctx.fillRect(Math.round(px), Math.round(py), 1, 1)
      }
    }
    // Bouncing ball
    const t = (time / 1400) % 1
    const bx = x + w / 2 + Math.sin(t * Math.PI * 4) * w * 0.3
    const by = y + 4 + t * (h - 8)
    ctx.fillStyle = COLORS.ink
    ctx.fillRect(Math.round(bx), Math.round(by), 2, 2)
  } else if (slug === '3d-environment') {
    // Faux 3D perspective grid
    const horizon = y + h * 0.45
    const scroll = (time / 30) % 8
    // Sky gradient
    const skyG = ctx.createLinearGradient(x, y, x, horizon)
    skyG.addColorStop(0, '#3a2c4a')
    skyG.addColorStop(1, '#a06464')
    ctx.fillStyle = skyG
    ctx.fillRect(x, y, w, horizon - y)
    // Sun
    ctx.fillStyle = COLORS.gold
    ctx.beginPath()
    ctx.arc(x + w / 2, horizon - 2, 4, 0, Math.PI * 2)
    ctx.fill()
    // Ground
    ctx.fillStyle = '#1a0e22'
    ctx.fillRect(x, horizon, w, h - (horizon - y))
    // Grid lines (faux 3D)
    ctx.strokeStyle = COLORS.pink
    ctx.lineWidth = 0.5
    for (let i = 0; i < 6; i++) {
      const yy = horizon + i * 4 + (scroll % 4)
      if (yy > y + h) continue
      ctx.beginPath()
      ctx.moveTo(x, yy)
      ctx.lineTo(x + w, yy)
      ctx.stroke()
    }
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo(x + w / 2, horizon)
      ctx.lineTo(x + w / 2 + i * w * 0.25, y + h)
      ctx.stroke()
    }
  }

  // Subtle scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  for (let yy = y; yy < y + h; yy += 2) {
    ctx.fillRect(x, yy, w, 1)
  }
  ctx.restore()
}

// AI desk — monitor + keyboard.
function drawAIDesk(ctx, x, y, w, h, time, isNear, station) {
  // Desk top
  const dy = y + h - 16
  const dx = x + 2
  const dw = w - 4
  ctx.fillStyle = '#191e2a'
  roundRect(ctx, dx, dy, dw, 14, 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(255,255,255,0.04)'
  ctx.fillRect(dx, dy, dw, 1)
  // Desk legs
  ctx.fillStyle = '#0d1118'
  ctx.fillRect(dx + 2, dy + 14, 3, 6)
  ctx.fillRect(dx + dw - 5, dy + 14, 3, 6)

  // Monitor
  const mx = x + 8
  const my = y + 4
  const mw = w - 16
  const mh = h - 26
  // Stand
  ctx.fillStyle = '#23293a'
  ctx.fillRect(mx + mw / 2 - 2, my + mh, 4, 6)
  ctx.fillRect(mx + mw / 2 - 6, my + mh + 4, 12, 2)
  // Screen frame
  ctx.fillStyle = '#0a0c12'
  roundRect(ctx, mx, my, mw, mh, 3)
  ctx.fill()
  // Screen content
  drawAIScreen(ctx, mx + 2, my + 2, mw - 4, mh - 4, station.slug, time, isNear)
  // Bezel glow
  ctx.strokeStyle = COLORS.cyan + (isNear ? 'cc' : '55')
  ctx.lineWidth = 1
  roundRect(ctx, mx, my, mw, mh, 3)
  ctx.stroke()

  // Keyboard
  ctx.fillStyle = '#0e1119'
  roundRect(ctx, dx + dw / 2 - 10, dy + 2, 20, 5, 1)
  ctx.fill()
  // Keys
  ctx.fillStyle = '#2a3146'
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(dx + dw / 2 - 9 + i * 2.6, dy + 3, 2, 2)
  }
}

function drawAIScreen(ctx, x, y, w, h, slug, time, isNear) {
  ctx.save()
  ctx.beginPath()
  ctx.rect(x, y, w, h)
  ctx.clip()

  // Dark IDE-like background
  ctx.fillStyle = '#070a12'
  ctx.fillRect(x, y, w, h)

  // Top bar
  ctx.fillStyle = '#11151e'
  ctx.fillRect(x, y, w, 4)
  // Dots
  ctx.fillStyle = '#e94f4f'; ctx.fillRect(x + 2, y + 1, 2, 2)
  ctx.fillStyle = '#f3c43c'; ctx.fillRect(x + 5, y + 1, 2, 2)
  ctx.fillStyle = '#5cd17f'; ctx.fillRect(x + 8, y + 1, 2, 2)

  if (slug === 'study-command-center') {
    // Calendar grid + chat lines
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
        // Highlight a few events
        if ((r * 5 + c + Math.floor(time / 500)) % 7 === 0) {
          ctx.fillStyle = COLORS.cyan
          ctx.fillRect(Math.round(cellX) + 1, Math.round(cellY) + 1, 2, 1)
        }
      }
    }
    // Chat lines on the right
    const chatX = x + gridW + 5
    const chatW = w - (gridW + 8)
    const lineCount = 5
    for (let i = 0; i < lineCount; i++) {
      const lw = chatW * (0.4 + ((i * 13 + Math.floor(time / 700)) % 6) * 0.1)
      ctx.fillStyle = i % 2 === 0 ? COLORS.cyan + '88' : '#3a4258'
      ctx.fillRect(Math.round(chatX), Math.round(y + 8 + i * 4), Math.max(2, Math.round(lw)), 2)
    }
  } else if (slug === 'la-ultra-running-plans') {
    // ECG/heart-rate trace + plan blocks
    const trX = x + 2
    const trY = y + h * 0.35
    const trW = w - 4
    ctx.strokeStyle = COLORS.cyan
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 0; i < trW; i++) {
      const t = i / 6 + time / 200
      let yy = trY + Math.sin(t) * 1.5
      // Spike pulses
      const beat = (i - (time / 8) % 30) % 30
      if (beat > 0 && beat < 5) yy -= 6
      else if (beat >= 5 && beat < 8) yy += 3
      if (i === 0) ctx.moveTo(trX + i, yy)
      else ctx.lineTo(trX + i, yy)
    }
    ctx.stroke()
    // Plan blocks at bottom
    const blockY = y + h * 0.65
    for (let i = 0; i < 5; i++) {
      const lit = (i + Math.floor(time / 600)) % 5 === 0
      ctx.fillStyle = lit ? COLORS.cyan : '#2a3548'
      ctx.fillRect(x + 3 + i * (w - 6) / 5, blockY, (w - 8) / 5 - 1, 4)
    }
  }

  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  for (let yy = y; yy < y + h; yy += 2) {
    ctx.fillRect(x, yy, w, 1)
  }

  ctx.restore()
}

// ARIA the AI NPC — a friendly bobbing holographic helper.
function drawAria(ctx, x, y, w, h, time, isNear) {
  const cx = x + w / 2
  const cy = y + h / 2 + Math.sin(time / 500) * 3
  // Hover platform
  const platY = y + h - 6
  ctx.fillStyle = '#0a1117'
  roundRect(ctx, x + 6, platY, w - 12, 6, 3)
  ctx.fill()
  // Glow ring
  const ringGrd = ctx.createRadialGradient(cx, platY + 2, 0, cx, platY + 2, w * 0.7)
  ringGrd.addColorStop(0, COLORS.cyan + '88')
  ringGrd.addColorStop(1, COLORS.cyan + '00')
  ctx.save()
  ctx.globalAlpha = 0.55 + 0.15 * Math.sin(time / 400)
  ctx.globalCompositeOperation = 'lighter'
  ctx.fillStyle = ringGrd
  ctx.fillRect(x - 8, platY - 4, w + 16, 12)
  ctx.restore()

  // Hovering robot body
  const bw = 22
  const bh = 26
  const bx = cx - bw / 2
  const by = cy - bh / 2
  ctx.fillStyle = '#0e1620'
  roundRect(ctx, bx, by, bw, bh, 6)
  ctx.fill()
  ctx.strokeStyle = COLORS.cyan
  ctx.lineWidth = 1
  roundRect(ctx, bx, by, bw, bh, 6)
  ctx.stroke()
  // Inner screen
  ctx.fillStyle = '#020812'
  roundRect(ctx, bx + 3, by + 4, bw - 6, bh - 12, 3)
  ctx.fill()
  // Eye
  const eyeW = 8
  const eyeH = (Math.sin(time / 1800) > 0.97) ? 1 : 4 // blink
  ctx.fillStyle = COLORS.cyan
  roundRect(ctx, cx - eyeW / 2, cy - 2, eyeW, eyeH, 1)
  ctx.fill()
  // Mouth indicator
  ctx.fillStyle = COLORS.cyan + '88'
  ctx.fillRect(cx - 3, cy + 5, 6, 1)
  // Antenna
  ctx.strokeStyle = COLORS.cyan
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, by)
  ctx.lineTo(cx, by - 4)
  ctx.stroke()
  ctx.fillStyle = COLORS.cyan
  ctx.beginPath()
  ctx.arc(cx, by - 5, 1.4, 0, Math.PI * 2)
  ctx.fill()

  // Hover particles
  for (let i = 0; i < 4; i++) {
    const t = (time / 1400 + i / 4) % 1
    const px = cx + Math.cos(i * 1.5 + time / 800) * (w * 0.35)
    const py = platY - 4 + (1 - t) * -8
    ctx.fillStyle = COLORS.cyan
    ctx.globalAlpha = (1 - t) * 0.7
    ctx.fillRect(Math.round(px), Math.round(py), 1, 1)
    ctx.globalAlpha = 1
  }

  if (isNear) {
    // Speech bubble hint
    ctx.fillStyle = COLORS.cyan
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 200)
    ctx.font = '700 7px ui-monospace'
    ctx.textAlign = 'center'
    ctx.fillText('...', cx + 14, cy + 1)
    ctx.globalAlpha = 1
    ctx.textAlign = 'left'
  }
}

// TV wall — large screen with animated reel preview.
function drawTV(ctx, x, y, w, h, time, isNear) {
  // Wall mount shadow
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  roundRect(ctx, x + 4, y + h - 4, w - 8, 6, 3)
  ctx.fill()

  // Stand
  ctx.fillStyle = '#0a0d14'
  ctx.fillRect(x + w / 2 - 6, y + h - 8, 12, 8)
  ctx.fillRect(x + w / 2 - 14, y + h - 2, 28, 4)

  // TV body
  const tx = x + 2
  const ty = y + 2
  const tw = w - 4
  const th = h - 12
  ctx.fillStyle = '#0a0d14'
  roundRect(ctx, tx, ty, tw, th, 4)
  ctx.fill()
  // Screen
  const sx = tx + 3
  const sy = ty + 3
  const sw = tw - 6
  const sh = th - 6
  ctx.fillStyle = '#000'
  roundRect(ctx, sx, sy, sw, sh, 2)
  ctx.fill()

  // Animated reel content
  ctx.save()
  ctx.beginPath()
  ctx.rect(sx, sy, sw, sh)
  ctx.clip()
  const reelIdx = Math.floor(time / 2200) % 3
  const reelColors = [['#e94f4f', COLORS.gold], ['#5ee8ff', '#9d7cff'], ['#ff9a5a', '#6cf5a9']]
  // Backdrop
  const reelG = ctx.createLinearGradient(sx, sy, sx, sy + sh)
  reelG.addColorStop(0, reelColors[reelIdx][0] + '33')
  reelG.addColorStop(1, reelColors[reelIdx][1] + '11')
  ctx.fillStyle = reelG
  ctx.fillRect(sx, sy, sw, sh)
  // "Mountains" silhouettes (La Ultra vibe)
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.moveTo(sx, sy + sh)
  ctx.lineTo(sx, sy + sh * 0.6)
  ctx.lineTo(sx + sw * 0.2, sy + sh * 0.35)
  ctx.lineTo(sx + sw * 0.4, sy + sh * 0.55)
  ctx.lineTo(sx + sw * 0.6, sy + sh * 0.3)
  ctx.lineTo(sx + sw * 0.8, sy + sh * 0.5)
  ctx.lineTo(sx + sw, sy + sh * 0.4)
  ctx.lineTo(sx + sw, sy + sh)
  ctx.closePath()
  ctx.fill()
  // Scrolling text bar
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(sx, sy + sh - 8, sw, 8)
  ctx.fillStyle = reelColors[reelIdx][1]
  ctx.font = '700 6px ui-monospace, Menlo'
  ctx.textBaseline = 'middle'
  const titles = ['LA ULTRA · THE HIGH', 'MOVING MOUNTAINS WITHIN', 'RUN2FLY INITIATIVE']
  const scroll = (time / 60) % (sw + 80)
  ctx.fillText(titles[reelIdx], sx + sw - scroll + 4, sy + sh - 4)
  // REC indicator
  ctx.fillStyle = '#e94f4f'
  ctx.globalAlpha = 0.6 + 0.4 * Math.sin(time / 250)
  ctx.beginPath()
  ctx.arc(sx + sw - 5, sy + 5, 2, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.2)'
  for (let yy = sy; yy < sy + sh; yy += 2) ctx.fillRect(sx, yy, sw, 1)
  ctx.restore()

  // Frame glow when nearby
  ctx.strokeStyle = COLORS.green + (isNear ? 'cc' : '44')
  ctx.lineWidth = 1
  roundRect(ctx, tx, ty, tw, th, 4)
  ctx.stroke()
}

// Pedestal — glowing column with profile silhouette.
function drawPedestal(ctx, x, y, w, h, time, isNear) {
  const cx = x + w / 2

  // Base
  ctx.fillStyle = '#11161e'
  roundRect(ctx, x + 6, y + h - 12, w - 12, 12, 3)
  ctx.fill()
  ctx.fillStyle = '#1a2030'
  roundRect(ctx, x + 10, y + h - 16, w - 20, 6, 2)
  ctx.fill()

  // Glowing column
  const colX = cx - 8
  const colY = y + 4
  const colW = 16
  const colH = h - 22

  // Inner light
  const grd = ctx.createLinearGradient(colX, colY, colX, colY + colH)
  grd.addColorStop(0, COLORS.green + '88')
  grd.addColorStop(1, COLORS.green + '22')
  ctx.fillStyle = grd
  roundRect(ctx, colX, colY, colW, colH, 2)
  ctx.fill()

  // Floating "i" / portrait silhouette
  ctx.fillStyle = COLORS.green
  ctx.globalAlpha = isNear ? 1 : 0.85
  ctx.beginPath()
  ctx.arc(cx, colY + 10 + Math.sin(time / 700) * 2, 3, 0, Math.PI * 2)
  ctx.fill()
  // Body silhouette
  ctx.fillRect(cx - 4, colY + 14 + Math.sin(time / 700) * 2, 8, 10)
  ctx.globalAlpha = 1

  // Particle wisps rising
  for (let i = 0; i < 3; i++) {
    const t = ((time / 1600) + i / 3) % 1
    const px = cx + Math.sin(i * 1.7 + time / 600) * 5
    const py = colY + colH - t * colH
    ctx.fillStyle = COLORS.green
    ctx.globalAlpha = (1 - t) * 0.8
    ctx.fillRect(Math.round(px), Math.round(py), 1, 1)
  }
  ctx.globalAlpha = 1
}

// Trophy wall — pedestal with star + medal.
function drawTrophy(ctx, x, y, w, h, time, isNear) {
  const cx = x + w / 2
  // Base
  ctx.fillStyle = '#1a1410'
  roundRect(ctx, x + 4, y + h - 10, w - 8, 10, 3)
  ctx.fill()
  ctx.fillStyle = '#23180f'
  roundRect(ctx, x + 8, y + h - 14, w - 16, 6, 2)
  ctx.fill()

  // Trophy cup
  const ty = y + 10
  ctx.fillStyle = COLORS.gold
  ctx.beginPath()
  ctx.moveTo(cx - 10, ty)
  ctx.lineTo(cx + 10, ty)
  ctx.lineTo(cx + 8, ty + 14)
  ctx.lineTo(cx - 8, ty + 14)
  ctx.closePath()
  ctx.fill()
  // Highlights
  ctx.fillStyle = '#fff3b8'
  ctx.fillRect(cx - 9, ty + 2, 2, 8)
  // Stem
  ctx.fillStyle = COLORS.gold
  ctx.fillRect(cx - 2, ty + 14, 4, 6)
  ctx.fillRect(cx - 6, ty + 20, 12, 3)

  // Star above
  const sa = time / 1000
  ctx.save()
  ctx.translate(cx, ty - 6 + Math.sin(time / 700) * 1.5)
  ctx.rotate(sa * 0.3)
  ctx.fillStyle = COLORS.gold
  ctx.globalAlpha = isNear ? 1 : 0.85
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 5 : 2.2
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2
    const px = Math.cos(a) * r
    const py = Math.sin(a) * r
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // Sparkle particles
  for (let i = 0; i < 3; i++) {
    const t = ((time / 1500) + i / 3) % 1
    const angle = i * 2.1
    const px = cx + Math.cos(angle) * (1 - t) * 20
    const py = ty + 4 + Math.sin(angle) * (1 - t) * 12 - t * 5
    ctx.fillStyle = COLORS.gold
    ctx.globalAlpha = (1 - t) * 0.9
    ctx.fillRect(Math.round(px), Math.round(py), 1, 1)
  }
  ctx.globalAlpha = 1
}

// Phone booth — door with glowing knob.
function drawPhoneBooth(ctx, x, y, w, h, time, isNear) {
  const cx = x + w / 2
  // Booth body
  ctx.fillStyle = '#1a0f0a'
  roundRect(ctx, x + 6, y + 2, w - 12, h - 4, 4)
  ctx.fill()
  // Glass panel
  const gx = x + 10
  const gy = y + 6
  const gw = w - 20
  const gh = h * 0.55
  ctx.fillStyle = '#050d18'
  roundRect(ctx, gx, gy, gw, gh, 2)
  ctx.fill()
  // Reflection
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.fillRect(gx + 2, gy + 2, 3, gh - 4)
  // "@" mail symbol glowing inside
  ctx.fillStyle = COLORS.warm
  ctx.globalAlpha = isNear ? 1 : 0.7 + 0.3 * Math.sin(time / 400)
  ctx.font = '700 14px ui-monospace, Menlo'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('@', cx, gy + gh / 2)
  ctx.globalAlpha = 1
  ctx.textAlign = 'left'
  // Door handle
  ctx.fillStyle = COLORS.warm
  ctx.beginPath()
  ctx.arc(x + w - 10, y + h - 14, 2, 0, Math.PI * 2)
  ctx.fill()
  // Light strip
  ctx.fillStyle = COLORS.warm + '88'
  ctx.fillRect(x + 8, y + 4, w - 16, 1)
}

// ───────────────────────── Floating label ─────────────────────────

function drawFloatingLabel(ctx, cx, baseY, title, subtitle, color, time) {
  const bob = Math.sin(time / 400) * 2
  const y = baseY + bob
  ctx.save()
  ctx.font = '700 10px ui-monospace, Menlo, Consolas, monospace'
  const titleW = ctx.measureText(title).width
  ctx.font = '600 8px ui-monospace, Menlo, Consolas, monospace'
  const subW = ctx.measureText(subtitle || '').width
  const w = Math.max(titleW, subW) + 16
  const h = subtitle ? 26 : 18
  const bx = cx - w / 2
  const by = y - h - 4

  // Background pill
  ctx.fillStyle = 'rgba(8, 10, 16, 0.92)'
  roundRect(ctx, bx, by, w, h, 6)
  ctx.fill()
  ctx.strokeStyle = color + 'cc'
  ctx.lineWidth = 1
  roundRect(ctx, bx, by, w, h, 6)
  ctx.stroke()

  // Title
  ctx.font = '700 10px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, cx, by + (subtitle ? 8 : h / 2))
  // Subtitle
  if (subtitle) {
    ctx.font = '600 8px ui-monospace, Menlo, Consolas, monospace'
    ctx.fillStyle = COLORS.inkDim
    ctx.fillText(subtitle, cx, by + 18)
  }

  // Pointer triangle below
  ctx.fillStyle = 'rgba(8, 10, 16, 0.92)'
  ctx.beginPath()
  ctx.moveTo(cx - 4, by + h)
  ctx.lineTo(cx + 4, by + h)
  ctx.lineTo(cx, by + h + 4)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
  ctx.textAlign = 'left'
}

// ───────────────────────── Player ─────────────────────────

// Player is a small humanoid drawn in 4 directions. ~14×22 px.
// We draw at fractional player position; the player coordinates are in
// world pixels.
export function drawPlayer(ctx, px, py, dir, animFrame, moving, time) {
  const x = Math.round(px)
  const y = Math.round(py)

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.45)'
  ctx.beginPath()
  ctx.ellipse(x, y + 10, 7, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Walking bob: small vertical offset when moving.
  const bob = moving ? Math.sin(animFrame * Math.PI) * 1 : Math.sin(time / 700) * 0.5
  const ox = x - 7
  const oy = y - 18 + bob

  // Legs (back to front)
  const legSwing = moving ? Math.sin(animFrame * Math.PI) * 2 : 0
  ctx.fillStyle = COLORS.pants
  if (dir === 'left' || dir === 'right') {
    ctx.fillRect(ox + 4, oy + 14, 2, 6 - Math.abs(legSwing))
    ctx.fillRect(ox + 8, oy + 14, 2, 6 + Math.abs(legSwing) * 0.5)
  } else {
    ctx.fillRect(ox + 4 + legSwing * 0.3, oy + 14, 2, 6)
    ctx.fillRect(ox + 8 - legSwing * 0.3, oy + 14, 2, 6)
  }
  // Shoes
  ctx.fillStyle = COLORS.shoe
  ctx.fillRect(ox + 4, oy + 19, 3, 1)
  ctx.fillRect(ox + 8, oy + 19, 3, 1)

  // Torso (shirt)
  ctx.fillStyle = COLORS.shirt
  ctx.fillRect(ox + 3, oy + 8, 8, 7)
  // Shading
  ctx.fillStyle = COLORS.shirtShadow
  ctx.fillRect(ox + 3, oy + 13, 8, 2)
  ctx.fillStyle = COLORS.shirtHi
  if (dir === 'left') ctx.fillRect(ox + 9, oy + 8, 2, 6)
  else if (dir === 'right') ctx.fillRect(ox + 3, oy + 8, 2, 6)
  else ctx.fillRect(ox + 6, oy + 8, 2, 6)

  // Arms
  ctx.fillStyle = COLORS.shirt
  const armSwing = moving ? Math.sin(animFrame * Math.PI + Math.PI) * 1.5 : 0
  if (dir === 'down') {
    ctx.fillRect(ox + 1, oy + 9 + armSwing * 0.4, 2, 4)
    ctx.fillRect(ox + 11, oy + 9 - armSwing * 0.4, 2, 4)
  } else if (dir === 'up') {
    ctx.fillRect(ox + 1, oy + 9 - armSwing * 0.4, 2, 4)
    ctx.fillRect(ox + 11, oy + 9 + armSwing * 0.4, 2, 4)
  } else if (dir === 'left') {
    ctx.fillRect(ox + 2, oy + 9, 2, 4 + armSwing)
  } else if (dir === 'right') {
    ctx.fillRect(ox + 10, oy + 9, 2, 4 + armSwing)
  }
  // Hands
  ctx.fillStyle = COLORS.skin
  if (dir === 'down' || dir === 'up') {
    ctx.fillRect(ox + 1, oy + 12 + (dir === 'down' ? armSwing * 0.4 : -armSwing * 0.4), 2, 1)
    ctx.fillRect(ox + 11, oy + 12 + (dir === 'down' ? -armSwing * 0.4 : armSwing * 0.4), 2, 1)
  } else if (dir === 'left') {
    ctx.fillRect(ox + 2, oy + 12 + armSwing, 2, 1)
  } else if (dir === 'right') {
    ctx.fillRect(ox + 10, oy + 12 + armSwing, 2, 1)
  }

  // Head
  ctx.fillStyle = COLORS.skin
  ctx.fillRect(ox + 4, oy + 2, 6, 6)
  // Head shadow
  ctx.fillStyle = COLORS.skinShadow
  ctx.fillRect(ox + 4, oy + 7, 6, 1)
  // Hair (top)
  ctx.fillStyle = COLORS.hair
  ctx.fillRect(ox + 4, oy + 1, 6, 2)
  if (dir === 'left') ctx.fillRect(ox + 4, oy + 2, 1, 4)
  if (dir === 'right') ctx.fillRect(ox + 9, oy + 2, 1, 4)
  if (dir === 'up') {
    // back of head: full hair patch
    ctx.fillRect(ox + 4, oy + 1, 6, 6)
  }

  // Eyes
  if (dir !== 'up') {
    ctx.fillStyle = '#0a0d12'
    if (dir === 'left') {
      ctx.fillRect(ox + 5, oy + 4, 1, 1)
    } else if (dir === 'right') {
      ctx.fillRect(ox + 8, oy + 4, 1, 1)
    } else {
      ctx.fillRect(ox + 5, oy + 4, 1, 1)
      ctx.fillRect(ox + 8, oy + 4, 1, 1)
    }
  }
}

// ───────────────────────── Particles ─────────────────────────

export function drawAmbientDust(ctx, viewW, viewH, time) {
  // Floating dust motes — cheap parallax depth.
  const count = 28
  for (let i = 0; i < count; i++) {
    const seed = i * 12.9898
    const baseX = ((seed * 78.233) % 1) * viewW
    const baseY = ((seed * 41.221) % 1) * viewH
    const drift = (time / 30 + i * 60) % (viewW + 200) - 100
    const x = (baseX + drift) % viewW
    const y = baseY + Math.sin(time / 1200 + i) * 6
    const size = (i % 3 === 0) ? 1.4 : 0.9
    const alpha = 0.08 + (i % 4) * 0.04
    ctx.fillStyle = `rgba(94, 232, 255, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
}

export function drawInteractSparkle(ctx, x, y, time) {
  // Small pulsing diamond above an interactable.
  const t = (time / 600) % 1
  const s = 6 + t * 4
  const alpha = 1 - t
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = COLORS.cyan
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y - s)
  ctx.lineTo(x + s * 0.7, y)
  ctx.lineTo(x, y + s)
  ctx.lineTo(x - s * 0.7, y)
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}
