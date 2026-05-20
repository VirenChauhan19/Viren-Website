import { useEffect, useRef, useState } from 'react'
import { skills } from '../data/content.js'

const BRANCH_META = {
  game:  { label: 'GAME DEV',     color: '#ff9a5a', accent: '#ffd166', desc: 'Gameplay, engines, level design.' },
  ai:    { label: 'APPLIED AI',   color: '#5ee8ff', accent: '#9d7cff', desc: 'RAG, document parsing, deployed tools.' },
  tools: { label: 'TOOLS',        color: '#6cf5a9', accent: '#5ee8ff', desc: 'React, C#, Flutter, Firebase, Git.' },
  soft:  { label: 'ENDURANCE',    color: '#ffd166', accent: '#ff6ec7', desc: 'Field leadership, ops, crisis management.' },
}

const BRANCH_ORDER = ['game', 'ai', 'tools', 'soft']

export function SkillTreeOverlay({ onClose }) {
  const [selected, setSelected] = useState(skills[0]?.id || null)
  const selectedSkill = skills.find((s) => s.id === selected) || skills[0]

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="overlay-panel tinted-skills" onClick={(e) => e.stopPropagation()}>
        <button className="overlay-close" onClick={onClose}>×</button>

        <div className="overlay-tag" style={{ color: '#ffd166' }}>⚔ SKILLS · LOADOUT</div>
        <h2 className="overlay-title">Perk Tree</h2>
        <p className="overlay-role">Click a node to inspect. Levels are filled dots out of 5.</p>

        <div className="perk-grid">
          {BRANCH_ORDER.map((branch) => {
            const meta = BRANCH_META[branch]
            const nodes = skills.filter((s) => s.branch === branch)
            return (
              <div className="perk-branch" key={branch} style={{ '--branch-color': meta.color }}>
                <div className="perk-branch-head">
                  <div className="perk-branch-label">{meta.label}</div>
                  <div className="perk-branch-desc">{meta.desc}</div>
                </div>
                <div className="perk-line" />
                <div className="perk-nodes">
                  {nodes.map((s, i) => {
                    const active = s.id === selected
                    return (
                      <button
                        key={s.id}
                        className={`perk-node ${active ? 'active' : ''}`}
                        onClick={() => setSelected(s.id)}
                        style={{ '--node-color': meta.color }}
                      >
                        <div className="perk-node-dot" />
                        <div className="perk-node-name">{s.name}</div>
                        <div className="perk-node-level">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <span key={j} className={`lv ${j < s.level ? 'on' : ''}`} />
                          ))}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {selectedSkill && (
          <div className="perk-detail">
            <div className="perk-detail-head">
              <span className="perk-detail-branch" style={{ color: BRANCH_META[selectedSkill.branch].color }}>
                {BRANCH_META[selectedSkill.branch].label}
              </span>
              <span className="perk-detail-name">{selectedSkill.name}</span>
              <span className="perk-detail-level">Lv {selectedSkill.level} / 5</span>
            </div>
            <div className="perk-detail-desc">{selectedSkill.desc}</div>
          </div>
        )}
      </div>
    </div>
  )
}
