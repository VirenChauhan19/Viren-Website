const slides = [
  [32, '01 / The invitation', 'A physical experience brings the campaign into the airport. Establish the setting before explaining the interface.'],
  [34, '02 / Choose a language', 'Show the first decision a visitor makes. Add your rationale and any feedback that shaped this screen.'],
  [36, '03 / Find your chant', 'Make the core interaction tangible: a visitor chooses how to participate in the Roar Zone.'],
  [39, '04 / See the result', 'Close the sequence with the proposed leaderboard. Explain the scoring and feedback only once the intended behavior is confirmed.'],
]

export default function AtlantaPreview() {
  return <section className="atl-preview" aria-label="Local case study concept">
    <p className="atl-preview-note">LOCAL EDITORIAL PREVIEW · Screens shown for your review. Public-use clearance and individual credits pending.</p>
    <span className="kicker">The proposed case study</span>
    <h2>From a citywide encounter<br />to a fan connection.</h2>
    <p className="atl-preview-lead">The team’s “The Match Is Here” proposal connects community, citywide media, and interactive experiences around the World Cup period. The portfolio story should move from that bigger vision into one carefully explained interaction.</p>
    <div className="atl-preview-facts"><div><span>My credited role</span><strong>UX/UI Lead</strong></div><div><span>Team deliverable</span><strong>Final partner presentation</strong></div><div><span>Work shown</span><strong>Proposed concepts</strong></div></div>
    <h3>The bigger journey</h3>
    <p>Start with the team’s path from awareness to belonging. This gives the individual screens a purpose within the broader campaign.</p>
    <img src="/tmp/pdfs/atl-slide-9.jpg" alt="Team proposal mapping awareness, discovery, participation, connection, engagement, conversion, and belonging" />
    <h3>One experience, step by step.</h3>
    <p>The Roar Zone is the strongest visual sequence in the deck for explaining UX. These are team presentation visuals; your ownership of individual screens still needs to be established.</p>
    <div className="atl-preview-grid">{slides.map(([page, title, caption]) => <figure key={page}><img src={`/tmp/pdfs/atl-slide-${page}.jpg`} alt={title} loading="lazy" /><figcaption><h4>{title}</h4><p>{caption}</p></figcaption></figure>)}</div>
    <div className="atl-preview-ending"><div><span className="kicker">Make it yours</span><h3>The decisions behind the screens.</h3><p>Add the screens you owned, the tools you used, and one example of feedback that changed the design. Those details will turn the presentation into your case study.</p></div><div><span className="kicker">The outcome</span><h3>A team proposal delivered.</h3><p>The final presentation is the supported outcome. Launch status, client adoption, and engagement results should only appear if you have evidence for them.</p></div></div>
  </section>
}
