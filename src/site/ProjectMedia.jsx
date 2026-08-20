import { useState } from 'react'
import { asset } from './asset.js'

export function Media({ m, name }) {
  const [failed, setFailed] = useState(false)
  if (!m) return null

  if (m.type === 'video') {
    if (failed) {
      return (
        <a className="proj-media fallback" href={asset(m.src)} target="_blank" rel="noreferrer">
          <span>{m.caption || name}</span>
          <strong>Open video ↗</strong>
        </a>
      )
    }
    // poster + preload="none" keeps the (large) capture files off the wire
    // until someone actually presses play.
    return (
      <div className="proj-media">
        <video
          src={asset(m.src)}
          poster={m.poster ? asset(m.poster) : undefined}
          muted
          loop
          playsInline
          controls
          preload="none"
          aria-label={`${m.caption || name} video`}
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  if (m.type === 'image') {
    if (failed) return null
    return (
      <div className="proj-media">
        <img
          src={asset(m.src)}
          alt={m.caption || name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  return null
}

// Shows the deployed app inside a faux browser so people can use it right here.
export function LiveEmbed({ url, name }) {
  let host = url
  try { host = new URL(url).host } catch { /* keep raw url */ }
  return (
    <div className="live-embed">
      <div className="browser-bar">
        <span className="bdot r" />
        <span className="bdot y" />
        <span className="bdot g" />
        <span className="b-url">{host}</span>
        <a className="b-open" href={url} target="_blank" rel="noreferrer">open ↗</a>
      </div>
      <div className="browser-view">
        <iframe
          src={url}
          title={`${name} live site`}
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
      <div className="live-cap">This is the real app, running live. Click around it, or open it full screen.</div>
    </div>
  )
}
