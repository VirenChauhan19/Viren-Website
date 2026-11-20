import { useEffect, useRef, useState, useCallback } from 'react'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const isTouch = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

// Cycles through words with a typing + deleting effect.
export function useTypewriter(words, { type = 75, del = 38, pause = 1500 } = {}) {
  const [text, setText] = useState(words && words[0] ? '' : '')
  useEffect(() => {
    if (!words || !words.length) return undefined
    if (reduced()) { setText(words[0]); return undefined }
    let w = 0
    let i = 0
    let deleting = false
    let timer = 0
    const tick = () => {
      const word = words[w]
      if (!deleting) {
        i += 1
        setText(word.slice(0, i))
        if (i >= word.length) { deleting = true; timer = setTimeout(tick, pause); return }
      } else {
        i -= 1
        setText(word.slice(0, i))
        if (i <= 0) { deleting = false; w = (w + 1) % words.length }
      }
      timer = setTimeout(tick, deleting ? del : type)
    }
    timer = setTimeout(tick, type)
    return () => clearTimeout(timer)
    // words is expected to be a stable module-level constant
  }, [words, type, del, pause])
  return text
}

// 3D tilt + a cursor-tracked spotlight (sets CSS vars on the element).
export function useTilt(max = 8) {
  const ref = useRef(null)
  const onMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el || reduced() || isTouch()) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
    el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
    el.style.setProperty('--rx', `${((0.5 - py) * max).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((px - 0.5) * max).toFixed(2)}deg`)
  }, [max])
  const onMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])
  return { ref, onMouseMove, onMouseLeave }
}

// Fraction of the page scrolled, 0..1.
export function useScrollProgress() {
  const [p, setP] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      setP(max > 0 ? Math.min(1, el.scrollTop / max) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return p
}

// Reveal-on-scroll, re-runs on each page mount (multi-page friendly).
export function useReveal(ref) {
  useEffect(() => {
    const root = ref?.current || document
    const els = Array.from(root.querySelectorAll('.reveal:not(.is-in), .career-highlights, .career-honors, .career-entry, .career-outro, .atl-preview figure'))
    els.forEach((el) => el.classList.add('reveal'))
    if (reduced() || !('IntersectionObserver' in window) || els.length === 0) {
      els.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver(
      (entries) => {
        let stagger = 0
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.setProperty('--reveal-delay', `${Math.min(stagger++, 3) * 55}ms`)
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        })
      },
      { rootMargin: '0px 0px -24px 0px', threshold: 0 },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
