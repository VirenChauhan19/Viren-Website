import { useEffect, useRef, useState } from 'react'

// Self-playing, ad-style product demos for the web apps. Each recreates the
// real app's UI in code and auto-advances through its core flow with feature
// captions. No video: it is a coded mockup, modeled on how the app works.
// Click to step through; auto-play pauses off-screen and for reduced motion.

const SCRIPTS = {
  study: [
    { screen: 'upload',    dur: 3000, cap: <>Drop in your <b>notes &amp; syllabus</b></> },
    { screen: 'deadlines', dur: 3200, cap: <>It pulls out <b>every deadline</b> automatically</> },
    { screen: 'calendar',  dur: 3400, cap: <>Synced straight to <b>Google Calendar</b></> },
    { screen: 'chat',      dur: 4400, cap: <>Ask anything, <b>answered from your own notes</b></> },
  ],
  laultra: [
    { screen: 'patients',  dur: 3000, cap: <>Manage <b>every patient</b> in one place</> },
    { screen: 'plan',      dur: 3800, cap: <>Build a <b>personalized plan</b> in one tap</> },
    { screen: 'progress',  dur: 3400, cap: <>Track <b>real progress</b> over time</> },
  ],
}

const APP_NAME = { study: 'Study Command Center', laultra: 'La Ultra · Patient App' }

const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Scene({ kind, screen }) {
  if (kind === 'study') {
    if (screen === 'upload') {
      return (
        <>
          <div className="sc-head">New semester setup</div>
          <div className="dropzone">
            <div className="dz-ico">⤓</div>
            <div className="dz-t">Drop your syllabus &amp; notes here</div>
            <div className="dz-file">
              <span>📄</span>
              <span className="fn">BIO-201_syllabus.pdf</span>
              <span className="fbar"><i /></span>
            </div>
          </div>
          <span className="cur" aria-hidden="true" />
        </>
      )
    }
    if (screen === 'deadlines') {
      return (
        <>
          <div className="sc-head">Deadlines found in your docs</div>
          <ul className="dl">
            <li><span className="dl-n">Midterm exam</span><span className="dl-d">Oct 14</span><span className="dl-go">added →</span></li>
            <li><span className="dl-n">Essay 1</span><span className="dl-d">Oct 22</span><span className="dl-go">added →</span></li>
            <li><span className="dl-n">Final project</span><span className="dl-d">Dec 8</span><span className="dl-go">added →</span></li>
          </ul>
        </>
      )
    }
    if (screen === 'calendar') {
      const days = [
        { d: 13 }, { d: 14, ev: 'Midterm', g: true }, { d: 15 }, { d: 16 },
        { d: 17 }, { d: 18, ev: 'Essay prep' }, { d: 19 },
      ]
      return (
        <>
          <div className="sc-head">Google Calendar · October</div>
          <div className="cal">
            {days.map((c, i) => (
              <div className="cell" key={c.d}>
                <span className="dnum">{c.d}</span>
                {c.ev && <span className={`ev ev${i} ${c.g ? 'g' : ''}`}>{c.ev}</span>}
              </div>
            ))}
          </div>
        </>
      )
    }
    return (
      <>
        <div className="sc-head">Study assistant</div>
        <div className="bubbles">
          <div className="bub me">When is my midterm?</div>
          <div className="bub ai">
            Your <b>BIO-201 midterm is Oct 14</b>. It is already on your calendar — want a study block the week before?
          </div>
        </div>
        <div className="composer"><span className="ph">Ask about your notes…</span><span className="send">↑</span></div>
      </>
    )
  }

  // La Ultra
  if (screen === 'patients') {
    return (
      <>
        <div className="sc-head">Patients</div>
        <ul className="pt">
          <li className="sel"><span className="pt-n">Anaya R.</span><span className="pt-m">34 · Marathon goal</span></li>
          <li><span className="pt-n">David M.</span><span className="pt-m">41 · Return to run</span></li>
          <li><span className="pt-n">Priya S.</span><span className="pt-m">28 · 10K build</span></li>
        </ul>
        <span className="cur" aria-hidden="true" />
      </>
    )
  }
  if (screen === 'plan') {
    return (
      <>
        <div className="sc-head">Anaya R. — generate week 3</div>
        <button className="genbtn" type="button" tabIndex={-1}>⚡ Generate plan</button>
        <ul className="wk">
          <li><b>Mon</b> Easy run · 5 km</li>
          <li><b>Tue</b> Mobility + core</li>
          <li><b>Wed</b> Tempo · 6 × 800 m</li>
          <li><b>Thu</b> Rest day</li>
          <li><b>Fri</b> Long run · 14 km</li>
        </ul>
        <span className="cur" aria-hidden="true" />
      </>
    )
  }
  const bars = [40, 58, 50, 72, 66, 88]
  return (
    <>
      <div className="sc-head">Anaya R. — progress</div>
      <div className="chart">
        {bars.map((h, i) => (
          <span className={`bar bar${i}`} key={i} style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="stat"><b>86%</b> plan adherence · last 4 weeks</div>
    </>
  )
}

export default function AppDemo({ kind = 'study', title }) {
  const script = SCRIPTS[kind] || SCRIPTS.study
  const [step, setStep] = useState(0)
  const [inView, setInView] = useState(false)
  const reduced = useRef(prefersReduced()).current
  const rootRef = useRef(null)

  useEffect(() => {
    const el = rootRef.current
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return undefined }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (reduced || !inView) return undefined
    const t = setTimeout(() => setStep((s) => (s + 1) % script.length), script[step].dur)
    return () => clearTimeout(t)
  }, [step, inView, reduced, script])

  const advance = () => setStep((s) => (s + 1) % script.length)
  const cur = script[step]
  const appName = APP_NAME[kind] || APP_NAME.study

  return (
    <div
      ref={rootRef}
      className={`appdemo appdemo-${kind}`}
      onClick={advance}
      role="img"
      aria-label={`Animated demo of ${title || appName}`}
      title="Tap to step through"
    >
      <div className="appdemo-bar" aria-hidden="true">
        <i /><i /><i />
        <span className="appdemo-app">{appName}</span>
        <span className="appdemo-tag">live demo</span>
      </div>

      <div className="appdemo-stage">
        <div className={`appdemo-screen sc-${cur.screen}`} key={step}>
          <Scene kind={kind} screen={cur.screen} />
        </div>
      </div>

      <div className="appdemo-cap">
        <span className="cap-txt">{cur.cap}</span>
        <span className="appdemo-dots" aria-hidden="true">
          {script.map((_, i) => <span key={i} className={i === step ? 'on' : ''} />)}
        </span>
      </div>
    </div>
  )
}
