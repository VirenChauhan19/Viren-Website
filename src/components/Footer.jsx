import { profile } from '../data/content'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>© {new Date().getFullYear()} {profile.name} · built with React & Three.js</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {profile.links.map((l) => (
            <a key={l.label} href={l.url} target="_blank" rel="noreferrer">
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
