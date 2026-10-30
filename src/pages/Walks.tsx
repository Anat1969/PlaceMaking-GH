import { walkColor } from '../data/walk-colors'
import CityMap from '../components/CityMap'
import RingGlyph from '../components/RingGlyph'
import Rich, { Lines } from '../components/Rich'
import { WALKS, Walk, placeById, Place } from '../data/places'
import { RINGS, RingId } from '../data/rings'
import { profile, recommend, weakest } from '../lib/logic'
import { href } from '../lib/route'

import { PATHS } from '../data/paths'
import { coverOf } from '../data/media'

// אורך ניתוב מחושב בלבד. אין לאמוד אורך שימושי באמצעות מרחק אווירי.
const km = (w: Walk) => !w.ring && PATHS[w.id] ? (PATHS[w.id].meters / 1000).toFixed(1) : '—'
const minutes = (w: Walk) => !w.ring && PATHS[w.id] ? String(Math.round(PATHS[w.id].meters / 1000 / 4 * 60)) : '—'
const avgProfile = (ps: Place[]) => Object.fromEntries(RINGS.map((r) => [r.id, Math.round(ps.reduce((a, p) => a + profile(p)[r.id], 0) / ps.length)])) as Record<RingId, number>

export function WalksPage() {
  return (
    <div className="page">
      <a className="press chip" href="#/route-editor">עריכת הטבעות על המפה</a><h1 className="page-title">מסלולי שיטוט ושהייה</h1>
      <div className="page-sub"><Lines text={`**${WALKS.length} מסלולים**: שלוש הטבעות, ותשעה מסלולי מורשת מרשימת השימור. ==כל מסלול נמדד כמו מקום: מה חסר לאורכו.==`} /></div>
      <div className="grid-3">
        {WALKS.map((w) => {
          const ps = w.stops.map((s) => placeById(s.place)!).filter(Boolean)
          const ring = w.ring ? RINGS.find((r) => r.id === w.ring)! : null
          return (
            <a key={w.id} className="card card-link" href={href('walk', { id: w.id })} style={{ borderTop: `4px solid ${walkColor(w)}`, paddingTop: 0 }}>
              {(() => { const c = ps.map((x) => coverOf(x.id)).find(Boolean); return c ? <div className="photo-hero" style={{ height: 130, margin: '0 -18px 12px' }}><img src={c.src} alt="" loading="lazy" /></div> : <div style={{ height: 16 }} /> })()}
              <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                <div style={{ minWidth: 0 }}>
                  <span className="label">{w.theme}</span>
                  <h3 style={{ fontSize: 18, fontFamily: 'var(--serif)' }}>{w.title}</h3>
                </div>
                <RingGlyph p={avgProfile(ps)} size={54} stroke={9} />
              </div>
              <p className="muted" style={{ marginTop: 6 }}>{w.description}</p>
              <div className="row muted" style={{ fontSize: 13 }}><span><bdi className="num">{w.stops.length}</bdi> תחנות</span>·<span><bdi className="num">{km(w)}</bdi> ק"מ</span>·<span><bdi className="num">{minutes(w)}</bdi> דק' הליכה</span></div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export function WalkPage({ id }: { id: string }) {
  const w = WALKS.find((x) => x.id === id)
  if (!w) return <div className="page"><div className="tone tone-problem"><h4>המסלול לא נמצא</h4><p>חזרו <a href={href('walks')}>למסלולים</a>.</p></div></div>
  const ps = w.stops.map((s) => placeById(s.place)!).filter(Boolean)
  const pr = avgProfile(ps)
  const ring = w.ring ? RINGS.find((r) => r.id === w.ring)! : null
  const gaps = new Map<string, { name: string; n: number; tier: string }>()
  ps.forEach((p) => recommend(p, 3).forEach((r) => {
    const g = gaps.get(r.el.id) || { name: r.el.name, n: 0, tier: r.el.tier }
    g.n++
    gaps.set(r.el.id, g)
  }))
  const topGaps = [...gaps.values()].sort((a, b) => b.n - a.n).slice(0, 5)
  const weakRing = (Object.keys(pr) as RingId[]).sort((a, b) => pr[a] - pr[b])[0]
  return (
    <div className="page">
      <div className="crumbs"><a href={href('walks')}>מסלולים</a> / {w.title}</div>
      <div className="grid-split">
        <div>
          <h1 className="page-title" style={ring ? { color: ring.color } : undefined}>{w.title}</h1>
          <div className="page-sub"><Lines text={w.description} /></div>
          <div className="grid-kpi" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }}>
            <div className="card kpi"><div className="v">{w.stops.length}</div><div className="t">תחנות</div></div>
            <div className="card kpi"><div className="v">{km(w)}</div><div className="t">ק"מ לאורך השביל</div></div>
            <div className="card kpi"><div className="v">{minutes(w)}</div><div className="t">דקות הליכה</div></div>
          </div>
          <div className="card" style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: 14, alignItems: 'center' }}>
            <RingGlyph p={pr} size={92} labels />
            <div>
              <div className="tone tone-problem" style={{ boxShadow: 'none' }}><h4>חסר לאורך המסלול</h4><p>{topGaps.map((g) => `${g.name} (${g.n})`).join(', ')}.</p></div>
              <div className="tone tone-insight" style={{ boxShadow: 'none', marginTop: 6 }}><Rich as="p">{`הטבעת החלשה במסלול: ==${RINGS.find((r) => r.id === weakRing)!.name}==. שם מתחילים.`}</Rich></div>
            </div>
          </div>
          <a className="press btn btn-primary" href={href('tour', { id: w.id })} style={{ marginTop: 14 }}>תוכן התחנות וסיור חי</a>
          <p className="src">מקור: {w.source}. {w.ring ? 'התוואי והתחנות מוצגים בצבע המסלול. זהו תוואי מחושב ומוצע לדיוק, לא מסלול ניווט מאומת.' : 'ניתוב הולכי רגל מחושב מ־OpenStreetMap; טרם אומתו תנאי השטח והנגישות.'}</p>
        </div>
        <div className="card" style={{ padding: 0, height: 440 }}>
          <CityMap places={ps} walks={[w]} numbered fit showQuarters={false} height="440px" onSelect={(pid) => (location.hash = href('place', { id: pid }).slice(1))} />
        </div>
      </div>

      <h2 className="section-title">התחנות</h2>
      <p className="section-sub">לכל תחנה: הסיפור, טביעת האצבע, וההתערבות שתהפוך אותה למקום שעוצרים בו.</p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
        {w.stops.map((s, i) => {
          const p = placeById(s.place)
          if (!p) return null
          const rec = recommend(p, 1)[0]
          const wr = RINGS.find((r) => r.id === weakest(p))!
          return (
            <li key={i} className="card" style={{ display: 'grid', gridTemplateColumns: '42px 64px minmax(0,1fr)', gap: 14, alignItems: 'center' }}>
              <span className="num" style={{ fontSize: 26, color: ring ? ring.color : 'var(--sea)' }}>{String(i + 1).padStart(2, '0')}</span>
              <RingGlyph p={profile(p)} size={64} stroke={9} />
              <div style={{ minWidth: 0 }}>
                <a href={href('place', { id: p.id })} style={{ fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>{p.name}</a>
                <p style={{ margin: '2px 0' }}>{s.text}</p>
                {rec && <p className="muted" style={{ margin: 0 }}>להוסיף: <strong style={{ color: wr.color }}>{rec.el.name}</strong>, כדי לחזק את {wr.name}. {rec.el.tier}.</p>}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
