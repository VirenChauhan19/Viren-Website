// Lightweight architecture diagram: plain HTML/CSS boxes and arrows, no images
// and no diagramming library. Data comes from project.study.architecture, so a
// diagram only ever shows layers the project actually has.
//
// A step with `fan: true` renders as a bus of sibling systems rather than a
// single node, for the "one thing feeds many" case.
export default function ArchDiagram({ arch }) {
  if (!arch || !arch.flow || arch.flow.length === 0) return null

  return (
    <figure className="arch">
      <ol className="arch-flow">
        {arch.flow.map((step, i) => (
          <li key={step.label} className={`arch-step${step.fan ? ' fan' : ''}`}>
            {i > 0 && <span className="arch-arrow" aria-hidden="true">↓</span>}
            <div className="arch-node">
              <span className="arch-label">{step.label}</span>
              {step.note && (
                <span className="arch-note">
                  {step.fan
                    ? step.note.split(' · ').map((n) => (
                        <span key={n} className="arch-chip">{n}</span>
                      ))
                    : step.note}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
      {arch.caption && <figcaption className="arch-cap">{arch.caption}</figcaption>}
    </figure>
  )
}
