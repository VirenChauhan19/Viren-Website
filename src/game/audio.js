// Synthesized game audio — ambient menu music + UI SFX via the Web Audio API.
// No asset files: everything is generated from oscillators, so it ships in the
// bundle for free and starts instantly. Audio can only begin after a user
// gesture (browser autoplay policy), so call resume() from a click/keypress.

const SETTINGS_KEY = 'viren_exe_settings_v1'

const DEFAULT_SETTINGS = {
  master: 0.7,
  music: true,
  sfx: true,
  motion: true, // animations on
  quality: 'high', // low | medium | high
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(s) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* ignore disabled storage */
  }
}

let ctx = null
let masterGain = null
let musicGain = null
let sfxGain = null
let musicNodes = null
let started = false
let arpTimer = 0

const state = loadSettings()

function ensureContext() {
  if (ctx) return ctx
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    masterGain = ctx.createGain()
    masterGain.gain.value = state.master
    masterGain.connect(ctx.destination)

    musicGain = ctx.createGain()
    musicGain.gain.value = state.music ? 0.5 : 0
    musicGain.connect(masterGain)

    sfxGain = ctx.createGain()
    sfxGain.gain.value = state.sfx ? 1 : 0
    sfxGain.connect(masterGain)
  } catch {
    ctx = null
  }
  return ctx
}

// ── Ambient music: a slow evolving minor pad with a soft, sparse arp. ──
function startMusic() {
  if (!ctx || musicNodes) return
  const now = ctx.currentTime

  // Pad: a stack of detuned oscillators forming an Am9-ish chord, run through
  // a lowpass with a slow LFO so the timbre breathes.
  const pad = ctx.createGain()
  pad.gain.value = 0
  pad.gain.linearRampToValueAtTime(0.16, now + 4)

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 600
  filter.Q.value = 6
  filter.connect(pad)
  pad.connect(musicGain)

  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfo.frequency.value = 0.05
  lfoGain.gain.value = 340
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  lfo.start()

  // A2, E3, A3, C4, E4 — warm, slightly melancholic
  const freqs = [110, 164.81, 220, 261.63, 329.63]
  const oscs = freqs.map((f, i) => {
    const o = ctx.createOscillator()
    o.type = i % 2 === 0 ? 'sawtooth' : 'triangle'
    o.frequency.value = f
    o.detune.value = (i - 2) * 4
    const g = ctx.createGain()
    g.gain.value = i === 0 ? 0.5 : 0.26
    o.connect(g)
    g.connect(filter)
    o.start()
    return o
  })

  musicNodes = { pad, filter, lfo, oscs }

  // Sparse arpeggio of soft sine plucks for a little life.
  const arpNotes = [880, 659.25, 987.77, 1318.51, 659.25, 783.99]
  let step = 0
  const tick = () => {
    if (!ctx || !musicNodes) return
    if (state.music) {
      const f = arpNotes[step % arpNotes.length]
      pluck(f, 0.04, 1.6)
    }
    step++
    arpTimer = window.setTimeout(tick, 1400)
  }
  arpTimer = window.setTimeout(tick, 1600)
}

function pluck(freq, vol, dur) {
  if (!ctx) return
  const now = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = 'sine'
  o.frequency.value = freq
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(vol, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  o.connect(g)
  g.connect(musicGain)
  o.start(now)
  o.stop(now + dur + 0.05)
}

// ── UI SFX ──
function blip(freqStart, freqEnd, dur, vol, type = 'square') {
  if (!ctx || !state.sfx) return
  const now = ctx.currentTime
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.setValueAtTime(freqStart, now)
  if (freqEnd !== freqStart) o.frequency.exponentialRampToValueAtTime(freqEnd, now + dur)
  g.gain.setValueAtTime(0, now)
  g.gain.linearRampToValueAtTime(vol, now + 0.006)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  o.connect(g)
  g.connect(sfxGain)
  o.start(now)
  o.stop(now + dur + 0.02)
}

// Filtered noise burst (whoosh / scan texture).
function noise(dur, vol, freq, q = 1) {
  if (!ctx || !state.sfx) return
  const now = ctx.currentTime
  const len = Math.floor(ctx.sampleRate * dur)
  const buf = ctx.createBuffer(1, len, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = ctx.createBufferSource()
  src.buffer = buf
  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = q
  const g = ctx.createGain()
  g.gain.value = vol
  src.connect(bp); bp.connect(g); g.connect(sfxGain)
  src.start(now)
}

export const sfx = {
  hover() { blip(540, 720, 0.08, 0.12, 'sine') },
  move() { blip(380, 440, 0.06, 0.10, 'triangle') },
  select() { blip(520, 880, 0.14, 0.18, 'square') },
  back() { blip(480, 300, 0.14, 0.16, 'square') },
  start() {
    blip(330, 660, 0.18, 0.2, 'sawtooth')
    setTimeout(() => blip(660, 990, 0.22, 0.18, 'sawtooth'), 90)
  },
  tick() { blip(900, 900, 0.03, 0.06, 'square') },
  confirm() { blip(660, 990, 0.2, 0.2, 'triangle') },

  // ── Gameplay ──
  // Opening a station: a confident whoosh-up + tone.
  open() {
    blip(300, 720, 0.16, 0.18, 'sawtooth')
    blip(520, 1040, 0.14, 0.10, 'triangle')
    noise(0.18, 0.06, 1400, 0.8)
  },
  // Closing an overlay: gentle down-sweep.
  close() {
    blip(680, 360, 0.16, 0.15, 'square')
    noise(0.12, 0.04, 900, 0.8)
  },
  // Q scan pulse: a sweeping radar sound.
  scan() {
    if (!ctx || !state.sfx) return
    const now = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(280, now)
    o.frequency.exponentialRampToValueAtTime(1500, now + 0.5)
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.16, now + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
    o.connect(g); g.connect(sfxGain)
    o.start(now); o.stop(now + 0.65)
    noise(0.5, 0.05, 1100, 0.6)
  },
  // Picking up a data shard: bright sparkle.
  pickup() {
    blip(880, 1320, 0.1, 0.16, 'square')
    setTimeout(() => blip(1320, 1760, 0.1, 0.12, 'sine'), 60)
  },
  // Quest / station completed: little ascending fanfare.
  complete() {
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => setTimeout(() => blip(f, f, 0.16, 0.16, 'triangle'), i * 90))
  },
  // Walking into a station's range: soft ping.
  proximity() { blip(660, 880, 0.07, 0.07, 'sine') },
  // Pause / resume.
  pause() { blip(300, 180, 0.18, 0.18, 'sawtooth') },
  resume() { blip(180, 360, 0.16, 0.16, 'sawtooth') },
  // Level up: bright rising arpeggio with a shimmer.
  levelup() {
    const notes = [659.25, 830.61, 987.77, 1318.51, 1567.98]
    notes.forEach((f, i) => setTimeout(() => {
      blip(f, f, 0.18, 0.16, 'square')
      blip(f * 2, f * 2, 0.16, 0.06, 'sine')
    }, i * 70))
  },
  // Final victory fanfare.
  victory() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1046.5, 1318.51, 1567.98]
    notes.forEach((f, i) => setTimeout(() => {
      blip(f, f, 0.26, 0.18, 'sawtooth')
      blip(f * 1.5, f * 1.5, 0.2, 0.07, 'triangle')
    }, i * 130))
  },
}

// ── Public control ──
export function startAudio() {
  ensureContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()
  if (!started) {
    started = true
    startMusic()
  }
}

export function isAudioStarted() {
  return started
}

export function getSettings() {
  return { ...state }
}

export function updateSettings(patch) {
  Object.assign(state, patch)
  saveSettings(state)
  if (ctx) {
    // Linear ramps (not setTargetAtTime, which only approaches the target
    // asymptotically and never reaches an exact 0 → audible residual at "0").
    const ramp = (param, value, time = 0.06) => {
      const now = ctx.currentTime
      param.cancelScheduledValues(now)
      param.setValueAtTime(param.value, now)
      param.linearRampToValueAtTime(value, now + time)
    }
    if ('master' in patch && masterGain) ramp(masterGain.gain, state.master)
    if ('music' in patch && musicGain) ramp(musicGain.gain, state.music ? 0.5 : 0, 0.12)
    if ('sfx' in patch && sfxGain) ramp(sfxGain.gain, state.sfx ? 1 : 0)
  }
  return { ...state }
}
