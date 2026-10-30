import {useState} from 'react'
import { Lines } from '../components/Rich'
import { ELEMENTS, RINGS, CRITERIA } from '../data/rings'
import { PLACES } from '../data/places'
import { recommend } from '../lib/logic'

export default function Kit() {
  const [query,setQuery]=useState('')
  const matches=ELEMENTS.filter(e=>`${e.name} ${e.note} ${e.tier}`.includes(query.trim()))
  const demand = new Map<string, number>()
  PLACES.forEach((p) => recommend(p).forEach((r) => demand.set(r.el.id, (demand.get(r.el.id) || 0) + 1)))
  return (
    <div className="page">
      <h1 className="page-title">ארגז הכלים</h1>
      <div className="page-sub"><Lines text={`**${ELEMENTS.length} רכיבים** של שיטוט ושהייה: ספסל, צל, פנס, שלט, גרפיטי, פסל ועוד. כל רכיב משרת טבעת, נשען על תקן או מקור, ויש לו עונה. המספר בכל כרטיס: בכמה מקומות הוא מופיע בין ההמלצות המחושבות. זו הצעת בדיקה, לא סקר שטח.`} /></div>
      <div className="collection-toolbar"><label>חיפוש כלי<input className="field" value={query} onChange={e=>setQuery(e.target.value)} placeholder="שם רכיב, צורך או דרגה"/></label><span>{matches.length} כלים</span></div>
      {!matches.length&&<p className="collection-empty">לא נמצאו כלים. נסו שם רכיב אחר.</p>}
      {RINGS.filter(r=>matches.some(e=>e.ring===r.id)).map((r) => (
        <section key={r.id}>
          <h2 className="section-title" style={{ color: r.color }}>{r.name} · {r.drive}</h2>
          <p className="section-sub">{r.definition} הצרכים: {r.needs.join(', ')}.</p>
          <div className="grid-3">
            {matches.filter((e) => e.ring === r.id).map((e) => (
              <div key={e.id} className="card" style={{ borderTop: `4px solid ${r.color}` }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: 19, fontFamily: 'var(--serif)' }}>{e.name}</h3>
                  <span><bdi className="num" style={{ fontSize: 22, color: r.color }}>{demand.get(e.id) || 0}</bdi> <span className="muted">מקומות</span></span>
                </div>
                <p style={{ fontSize: 14 }}>{e.note}</p>
                <span className="label">משפר</span>
                <p style={{ fontSize: 14 }}><strong>{e.serves.map((s) => CRITERIA.find((c) => c.id === s)!.name).join(', ')}</strong></p>
                <div className="row" style={{ gap: 16 }}>
                  <div><span className="label">דרגה</span><strong style={{ fontSize: 14 }}>{e.tier}</strong></div>
                  <div><span className="label">עונה</span><span style={{ fontSize: 14 }}>{e.season}</span></div>
                </div>
                <p className="src">נשען על: {e.basis}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
