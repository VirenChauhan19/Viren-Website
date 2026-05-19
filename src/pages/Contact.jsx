import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { profile } from '../data/content'

// FormSubmit AJAX endpoint — no backend/signup; first submission sends a
// one-time activation email to the address below to confirm ownership.
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${profile.email}`

export default function Contact() {
  const cardRef = useRef()
  const [status, setStatus] = useState('idle') // idle | sending | sent | error

  const onMove = (e) => {
    const el = cardRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width - 0.5
    const py = (e.clientY - r.top) / r.height - 0.5
    el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`)
    el.style.setProperty('--mx', `${(px * 100 + 50).toFixed(1)}%`)
    el.style.setProperty('--my', `${(py * 100 + 50).toFixed(1)}%`)
  }
  const onLeave = () => {
    const el = cardRef.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    const form = e.target
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
      _subject: `Portfolio message from ${form.name.value}`,
    }
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('bad status')
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="block contact-block">
      <div className="container">
        <div className="contact-tilt-wrap">
          <motion.div
            ref={cardRef}
            className="contact-card-3d"
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
          >
            <div className="contact-glow" />
            <div className="contact-inner">
              <span className="kicker" style={{ color: 'var(--accent)' }}>
                Let’s build something
              </span>
              <h2>Get in touch</h2>
              <p className="contact-sub">
                Internships, collaborations, or just want to talk games and AI? Drop me a
                message and I’ll get back to you.
              </p>

              {status === 'sent' ? (
                <motion.div
                  className="form-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="form-success-mark">✓</div>
                  <h3>Message sent</h3>
                  <p>Thanks for reaching out, I’ll reply soon.</p>
                  <button className="btn btn-ghost" onClick={() => setStatus('idle')}>
                    Send another
                  </button>
                </motion.div>
              ) : (
                <form className="contact-form" onSubmit={onSubmit}>
                  <div className="field-row">
                    <div className="field">
                      <input type="text" name="name" required placeholder=" " />
                      <label>Your name</label>
                    </div>
                    <div className="field">
                      <input type="email" name="email" required placeholder=" " />
                      <label>Your email</label>
                    </div>
                  </div>
                  <div className="field">
                    <textarea name="message" rows="5" required placeholder=" " />
                    <label>Message</label>
                  </div>
                  {status === 'error' && (
                    <p className="form-error">
                      Something went wrong. Email me directly at{' '}
                      <a href={`mailto:${profile.email}`}>{profile.email}</a>.
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary submit-btn"
                    disabled={status === 'sending'}
                  >
                    {status === 'sending' ? 'Sending…' : 'Send message →'}
                  </button>
                </form>
              )}

              <div className="contact-divider">
                <span>or reach me at</span>
              </div>
              <div className="contact-links">
                <a className="contact-pill" href={`mailto:${profile.email}`}>
                  ✉ {profile.email}
                </a>
                {profile.links
                  .filter((l) => l.label !== 'Email')
                  .map((l) => (
                    <a
                      key={l.label}
                      className="contact-pill"
                      href={l.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ↗ {l.label}
                    </a>
                  ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
