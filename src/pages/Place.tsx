import CityMap from '../components/CityMap'
import RingGlyph, { RingBars } from '../components/RingGlyph'
import Rich, { Lines } from '../components/Rich'
import { placeById, LAYERS, WALKS, PLACES } from '../data/places'
import { CRITERIA, RINGS } from '../data/rings'
import { profile, recommend, scoresOf, surveyed, update, useStore, uid, QUARTERS } from '../lib/logic'
import { href } from '../lib/route'

const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => Math.hypot((a.lat - b.lat) * 111, (a.lng - b.lng) * 94.6)

export default function PlacePage({ id }: { id: string }) {
  const store = useStore()
  const p = placeById(id)
  if (!p) return <div className="page"><div className="tone tone-problem"><h4>המקום לא נמצא</h4><p>הקישור ישן או שגוי. חזרו <a href={href('atlas')}>לאטלס</a>.</p></div></div>
  const pr = profile(p)
  const s = scoresOf(p)
  const recs = recommend(p)
  const walks = WALKS.filter((w) => w.stops.some((x) => x.place === p.id))
  const near = PLACES.filter((x) => x.id !== p.id).sort((a, b) => dist(a, p) - dist(b, p)).slice(0, 4)
  const planned = store.actions.filter((a) => a.place === p.id)
  const setScore = (c: string, v: number) => update((st) => ({ ...st, survey: { ...st.survey, [p.id]: { ...(st.survey[p.id] || {}), [c]: v } } }))
  const addAction = (element: string) => update((st) => ({ ...st, actions: [...st.actions, { id: uid(), place: p.id, element, quarter: QUARTERS[1], status: 'רעיון' }] }))

  return (
    <div className="page">
      <div className="crumbs"><a href={href('atlas')}>אטלס</a> / <a href={href('atlas', { layer: p.layer })}>{LAYERS[p.layer].name}</a> / {p.name}</div>
      <div className="grid-split">
        <div>
          <h1 className="page-title">{p.name}</h1>
          <div className="row" style={{ marginBottom: 14 }}>
            <span className={`ring-tag ring-${p.ring}`}>{RINGS.find((r) => r.id === p.ring)!.name}</span>
            <span className="muted">{p.area} · {p.eraLabel}{p.approx ? ' · מיקום משוער' : ''}</span>
          </div>
          <Lines text={p.body} className="page-sub" />
          {p.extra && (
            <div className="grid-kpi" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))' }}>
              {Object.entries(p.extra).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="card" style={{ padding: 10 }}><span className="label">{k}</span><Rich as="div">{`**${v}**`}</Rich></div>
              ))}
            </div>
          )}
          <div className="src">מקור: {p.source.url ? <a href={p.source.url} target="_blank" rel="noreferrer">{p.source.label}</a> : p.source.label}</div>
        </div>
        <div className="card" style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 16, alignItems: 'center' }}>
          <RingGlyph p={pr} size={130} labels />
          <RingBars p={pr} />
          <p className="muted" style={{ gridColumn: '1 / -1', margin: 0 }}>{surveyed(p) ? <span className="saved">סקר שטח נשמר. הציון מעודכן.</span> : 'הערכת פתיחה. סמנו בסקר למטה, והציון יתעדכן.'}</p>
        </div>
      </div>

      <h2 className="section-title">המלצות: מה יחזק את המקום</h2>
      <p className="section-sub">הפער הגדול קודם, והרכיב הזול והמהיר ביותר שמתקן אותו.</p>
      <div className="grid-2">
        {recs.map((r) => {
          const ring = RINGS.find((x) => x.id === r.el.ring)!
          const has = planned.some((a) => a.element === r.el.id)
          return (
            <div key={r.el.id} className="card" style={{ borderRight: `4px solid ${ring.color}` }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 17 }}>{r.el.name}</strong>
                <span className="label" style={{ margin: 0 }}>{r.el.tier}</span>
              </div>
              <div className="tone tone-problem" style={{ margin: '8px 0', boxShadow: 'none' }}><p>{r.why}</p></div>
              <p style={{ fontSize: 14 }}>{r.el.note}</p>
              <p className="muted">מתי: {r.el.season}.</p>
              <p className="src" style={{ marginTop: 0 }}>נשען על: {r.el.basis}</p>
              <button className="press btn" disabled={has} onClick={() => addAction(r.el.id)}>{has ? 'בתוכנית' : 'הוספה לתוכנית'}</button>
            </div>
          )
        })}
      </div>
      {planned.length > 0 && <p style={{ marginTop: 10 }}><a href={href('plan')}>{planned.length} התערבויות בתוכנית העבודה של המקום</a></p>}

      <h2 className="section-title">סקר שטח: 12 קריטריוני האיכות</h2>
      <p className="section-sub">לפי יאן גל (Jan Gehl). 0 = אין, 3 = מצוין. כל סימון נשמר מיד.</p>
      <div className="grid-3">
        {RINGS.map((r) => (
          <div key={r.id} className="card" style={{ borderTop: `4px solid ${r.color}` }}>
            <strong style={{ color: r.color }}>{r.name} · {r.drive}</strong>
            {CRITERIA.filter((c) => c.ring === r.id).map((c) => (
              <div key={c.id} style={{ marginTop: 10 }}>
                <div style={{ fontSize: 14 }}><strong>{c.name}</strong></div>
                <div className="muted" style={{ fontSize: 12 }}>{c.ask}</div>
                <div className="row" style={{ marginTop: 4, gap: 4 }}>
                  {[0, 1, 2, 3].map((v) => (
                    <button key={v} className="press chip" style={{ minWidth: 36 }} aria-pressed={(s[c.id] ?? 0) === v} aria-label={`${c.name}: ${v}`} onClick={() => setScore(c.id, v)}>{v}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <details className="card" style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 600 }}>איך חושבה הערכת הפתיחה</summary>
        <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, fontSize: 14, lineHeight: 1.8 }}>{p.why.map((w, i) => <li key={i}>{w}</li>)}</ul>
        <p className="muted" style={{ marginTop: 8 }}>ציון טבעת = סכום ארבעת הקריטריונים שלה, חלקי 12, כפול 100. סקר שטח גובר על ההערכה.</p>
      </details>

      <div className="grid-2" style={{ marginTop: 32 }}>
        <div>
          <h2 className="section-title" style={{ marginTop: 0 }}>על המפה</h2>
          <div className="card" style={{ padding: 0, height: 320 }}>
            <CityMap places={[p, ...near]} selected={p.id} fit showQuarters={false} height="320px" onSelect={(id) => (location.hash = href('place', { id }).slice(1))} />
          </div>
        </div>
        <div>
          <h2 className="section-title" style={{ marginTop: 0 }}>מסלולים שעוברים כאן</h2>
          {walks.length ? walks.map((w) => (
            <a key={w.id} className="card card-link" href={href('walk', { id: w.id })} style={{ marginBottom: 8 }}>
              <strong>{w.title}</strong>
              <p className="muted" style={{ margin: 0 }}>{w.stops.find((x) => x.place === p.id)!.text}</p>
            </a>
          )) : <div className="tone tone-neutral"><Rich as="p">עוד אין מסלול שעובר כאן. ==הזדמנות לתחנה חדשה.==</Rich></div>}
          <h2 className="section-title">בסביבה</h2>
          {near.map((x) => (
            <a key={x.id} className="card card-link" href={href('place', { id: x.id })} style={{ marginBottom: 6, padding: 10 }}>
              <strong style={{ fontSize: 14 }}>{x.name}</strong> <span className="muted">· <bdi className="num">{Math.round(dist(x, p) * 1000)}</bdi> מ'</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
