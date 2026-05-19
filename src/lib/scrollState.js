// Shared scroll/pointer state read inside the R3F render loop without
// triggering React re-renders. Updated by a single global listener.
export const scrollState = {
  y: 0,
  progress: 0, // 0..1 over the full document
  pointerX: 0, // -1..1
  pointerY: 0, // -1..1
  velocity: 0,
}

let last = 0
let attached = false

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const y = window.scrollY
  scrollState.velocity = y - last
  last = y
  scrollState.y = y
  scrollState.progress = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
}

function onPointer(e) {
  scrollState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
  scrollState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
}

export function attachScrollState() {
  if (attached) return
  attached = true
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('pointermove', onPointer, { passive: true })
  onScroll()
}
