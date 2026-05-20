import { useEffect, useState } from 'react'
import { QUESTS, QUEST_BY_ID } from '../data/quests.js'

// ───────────────────── Quest Tracker (persistent HUD panel) ─────────────────────

export function QuestTracker({ activeKey, completedSet, onQuestClick, collapsed, onToggleCollapsed }) {
  const total = QUESTS.length
  const done = QUESTS.filter((q) => completedSet.has(q.id)).length
  const pct = Math.round((done / total) * 100)

  return (
    <div className={`quest-tracker ${collapsed ? 'collapsed' : ''}`}>
      <button className="qt-toggle" onClick={onToggleCollapsed} aria-label={collapsed ? 'Show quests' : 'Hide quests'}>
        {collapsed ? '⏵' : '⏷'}
      </button>
      <div className="qt-head">
        <div className="qt-title">
          <span className="qt-badge">QUEST LOG</span>
          <span className="qt-progress">{done} / {total}</span>
        </div>
        <div className="qt-bar">
          <div className="qt-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <ul className="qt-list">
        {QUESTS.map((q) => {
          const completed = completedSet.has(q.id)
          const isActive = q.id === activeKey
          return (
            <li
              key={q.id}
              className={`qt-item ${completed ? 'done' : ''} ${isActive ? 'active' : ''}`}
              onClick={() => onQuestClick && onQuestClick(q.id)}
              title={q.objective}
            >
              <span className="qt-mark">
                {completed ? '✓' : isActive ? '◆' : '○'}
              </span>
              <span className="qt-text">
                <span className="qt-q-title">{q.title}</span>
                <span className="qt-q-obj">{q.objective}</span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ───────────────────── Quest Completed animation ─────────────────────

export function QuestCompleted({ questId, onDismiss }) {
  const quest = QUEST_BY_ID[questId]
  const [phase, setPhase] = useState('in') // in | hold | out

  useEffect(() => {
    if (!quest) return
    const t1 = setTimeout(() => setPhase('hold'), 600)
    const t2 = setTimeout(() => setPhase('out'), 2800)
    const t3 = setTimeout(() => onDismiss(), 3400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [questId, quest, onDismiss])

  if (!quest) return null

  return (
    <div className={`quest-complete phase-${phase}`} onClick={onDismiss}>
      <div className="qc-flash" />
      <div className="qc-stack">
        <div className="qc-banner">
          <div className="qc-stars">
            <span /><span /><span /><span /><span />
          </div>
          <div className="qc-headline">{quest.completion.headline}</div>
          <div className="qc-sub">{quest.completion.sub}</div>
          <div className="qc-reward">{quest.reward}</div>
        </div>
      </div>
    </div>
  )
}
