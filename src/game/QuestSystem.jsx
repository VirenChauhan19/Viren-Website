import { useEffect, useState } from 'react'
import { QUESTS, QUEST_BY_ID } from '../data/quests.js'

// ───────────────────── Quest Tracker (persistent HUD panel) ─────────────────────

export function QuestTracker({ activeKey, completedSet, onQuestClick, collapsed, onToggleCollapsed, finalUnlocked = false }) {
  const total = QUESTS.length
  const done = QUESTS.filter((q) => completedSet.has(q.id)).length
  const pct = Math.round((done / total) * 100)
  const nextQuest = QUESTS.find((q) => !completedSet.has(q.id))

  return (
    <div className={`quest-tracker ${collapsed ? 'collapsed' : ''}`}>
      <button className="qt-toggle" onClick={onToggleCollapsed} aria-label={collapsed ? 'Show quests' : 'Hide quests'}>
        {collapsed ? '⏵' : '⏷'}
      </button>
      <div className="qt-head">
        <div className="qt-title">
          <span className="qt-badge">GUIDED PATH</span>
          <span className="qt-progress">{done} / {total}</span>
        </div>
        <div className="qt-bar">
          <div className="qt-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="qt-current">
          <span>{finalUnlocked ? 'READY TO CONTACT' : 'NEXT STEP'}</span>
          <strong>{finalUnlocked ? 'Contact Viren' : nextQuest?.title || 'All milestones reviewed'}</strong>
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
      <button
        className={`qt-final ${finalUnlocked ? 'unlocked' : ''}`}
        onClick={() => onQuestClick && onQuestClick('contact')}
      >
        <span>{finalUnlocked ? 'CONTACT READY' : 'FINAL STEP'}</span>
        <strong>Contact Viren</strong>
      </button>
    </div>
  )
}

// ───────────────────── Quest Completed animation ─────────────────────

export function QuestCompleted({ questId, onDismiss }) {
  const quest = QUEST_BY_ID[questId]
  const [phase, setPhase] = useState('in') // in | hold | out
  const isProject = questId?.startsWith('project:')
  const reward = quest?.reward || ''
  const xpMatch = reward.match(/\+?\d+\s*XP/i)
  const skillMatch = reward.match(/-\s*(.+)$/i)
  const xp = xpMatch ? xpMatch[0].toUpperCase() : '+100 XP'
  const skill = skillMatch ? skillMatch[1].trim() : (isProject ? 'Portfolio Review' : 'Progress')

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
      <div className="qc-particles" aria-hidden>
        <span /><span /><span /><span /><span /><span /><span /><span />
      </div>
      <div className="qc-stack">
        <div className="qc-banner">
          <div className="qc-sfx">PROGRESS SAVED</div>
          <div className="qc-stars">
            <span /><span /><span /><span /><span />
          </div>
          <div className="qc-kicker">{isProject ? 'PROJECT REVIEWED' : 'MILESTONE REVIEWED'}</div>
          <div className="qc-headline">{isProject ? 'Project Reviewed' : quest.completion.headline}</div>
          <div className="qc-sub">{quest.completion.sub}</div>
          <div className="qc-reward-grid">
            <span><b>XP ADDED</b>{xp}</span>
            <span><b>FOCUS</b>{skill}</span>
            <span><b>NEXT</b>{isProject ? 'Continue review' : 'Follow guided path'}</span>
          </div>
          <div className="qc-reward">{reward}</div>
        </div>
      </div>
    </div>
  )
}
