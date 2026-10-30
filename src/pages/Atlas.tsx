import { useMemo, useState, useCallback } from 'react'
import CityMap from '../components/CityMap'
import PlaceKnowledge from '../components/PlaceKnowledge'
import { SYSTEMS, SystemId, proposedSystems, UNLOCATED, needsLocation } from '../data/identity'
import RingGlyph from '../components/RingGlyph'
import { PLACES, LAYERS, Layer, WALKS, placeById } from '../data/places'
import { RINGS, RingId, ELEMENTS } from '../data/rings'
import { profile, total, weakest, useStore, update, uid } from '../lib/logic'
import { go, href, Route } from '../lib/route'

const STEPS = [
  { y: -1500, t: 'העת העתיקה' },
  { y: 700, t: 'אשדוד ים' },
  { y: 1948, t: '1948' },
  { y: 1965, t: 'העיר הצעירה' },
  { y: 1996, t: 'שנות ה-90' },
  { y: 2013, t: 'קריית התרבות' },
  { y: 2026, t: 'היום, 70 שנה' },
  { y: 2028, t: 'פיילוט ומיזמים' },
  { y: 2032, t: 'התחדשות' },
  { y: 2040, t: 'העיר העתידית' },
]

export default function Atlas({ route }: { route: Route }) {
  const store = useStore()
  const sel = route.params.place
  const [layers, setLayers] = useState<Layer[]>(route.params.layer ? [route.params.layer as Layer] : (Object.keys(LAYERS) as Layer[]))
  const [search, setSearch] = useState('')
  const [system, setSystem] = useState<SystemId | 'all'>('all')
  const [ring, setRing] = useState<RingId | 'all'>('all')
  const [step, setStep] = useState(6)
  const [walk, setWalk] = useState<string>('rings')
  const [docMode, setDocMode] = useState(false)
  const [docEl, setDocEl] = useState('bench')
  const [docState, setDocState] = useState<'קיים' | 'חסר' | 'פגום'>('חסר')
  const year = STEPS[step].y

  const places = useMemo(
    () => PLACES.filter((p) => layers.includes(p.layer) && (ring === 'all' || p.ring === ring) && p.era <= year && (system === 'all' || proposedSystems(p).includes(system)) && `${p.name} ${p.area} ${p.body}`.includes(search.trim())),
    [layers, ring, year, store.survey, search, system],
  )
  const walks = useMemo(() => (walk === 'none' ? [] : walk === 'rings' ? WALKS.filter((w) => w.ring) : WALKS.filter((w) => w.id === walk)), [walk])
  const select = useCallback((id: string) => go('atlas', { place: id }), [])
  const onMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!docMode) return
      update((s) => ({ ...s, docs: [...s.docs, { id: uid(), lat, lng, element: docEl, state: docState, note: '', at: new Date().toISOString() }] }))
    },
    [docMode, docEl, docState],
  )
  const toggle = (l: Layer) => setLayers((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]))
  const p = sel ? placeById(sel) : undefined
  const list = [...places].sort((a, b) => total(a) - total(b))

  return (
    <div className="atlas">
      <div className="atlas-map">
        <CityMap streetControl places={places} selected={sel} onSelect={select} walks={walks} docs={store.docs} onMapClick={onMapClick} />
        <div className="timebar">
          <span className="tlabel label" style={{ margin: 0 }}>ציר הזמן</span>
          <input type="range" min={0} max={STEPS.length - 1} value={step} onChange={(e) => setStep(+e.target.value)} aria-label="ציר זמן" aria-valuetext={STEPS[step].t} />
          <div style={{ textAlign: 'center' }}>
            <div className="year">{year < 0 ? `${-year} לפנה"ס` : year}</div>
            <div className="muted" style={{ fontSize: 11 }}>{STEPS[step].t}</div>
          </div>
        </div>
        <div className="legend">
          <h4>מקרא</h4>
          <div className="li"><svg width="22" height="22" viewBox="0 0 100 100">{RINGS.map((r, i) => <circle key={r.id} cx="50" cy="50" r={[42, 30, 18][i]} fill="none" stroke={r.color} strokeWidth="11" />)}</svg><span>אותו סמל; טבעת מודגשת = שיוך ראשי</span></div>
          {RINGS.map((r) => <div className="li" key={r.id}><span className="sw" style={{ background: r.color }} />{r.name} · {r.drive} · {r.order}</div>)}
          {Object.entries(LAYERS).map(([k, l]) => <div className="li lg-layer" key={k}><span className="sw" style={{ background: l.color, borderRadius: '50%' }} />{l.name}</div>)}
          <div className="li">קו מקווקו: ניתוב מורשת מחושב, ללא אימות שטח</div>
          <div className="li">תוואי הטבעות בבירור ואינו מוצג כמסלול</div>
          {store.docs.length > 0 && <div className="li"><span className="sw" style={{ background: '#B3261E' }} />תיעוד שטח: חסר, פגום, קיים</div>}
        </div>
      </div>

      <aside className="atlas-side">
        {p ? (
          <div className="rise" key={p.id}>
            <div className="crumbs"><a href={href('atlas')}>אטלס</a> / {LAYERS[p.layer].name}</div>
            <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap' }}>
              <RingGlyph p={profile(p)} size={88} labels />
              <div style={{ minWidth: 0 }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{p.name}</h2>
                <div className="muted">{p.area}{p.approx ? ' · מיקום משוער' : ''}</div>
              </div>
            </div>
            <p style={{ marginTop: 12 }}><strong>{p.lead}</strong></p>
            {needsLocation(p) && <p className="tone tone-problem">המיקום בבירור; הנקודה אינה מוצגת במפה.</p>}
            <PlaceKnowledge p={p} key={p.id} />
            <span className="label" style={{ marginTop: 14 }}>מדדי איכות · הערכת פתיחה או סקר, בנפרד מהשיוך לטבעת</span>
            <div className="grid-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 6, margin: '10px 0' }}>
              {RINGS.map((r) => (
                <div key={r.id} style={{ borderTop: `3px solid ${r.color}`, padding: '6px 4px', background: r.wash }}>
                  <span className="label">{r.name}</span>
                  <span className="num" style={{ fontSize: 20, color: r.color }}>{profile(p)[r.id]}</span>
                </div>
              ))}
            </div>
            <div className="tone tone-problem" style={{ margin: '10px 0' }}>
              <h4>הפער: {RINGS.find((r) => r.id === weakest(p))!.name}</h4>
              <p>{RINGS.find((r) => r.id === weakest(p))!.needs.join(', ')}.</p>
            </div>
            <div className="row">
              <a className="press btn btn-primary" href={href('place', { id: p.id })}>לכרטיס המקום</a>
              <a className="press btn" href={href('atlas')}>לרשימה</a>
            </div>
          </div>
        ) : (
          <>
            <h1 className="page-title" style={{ fontSize: 26 }}>אטלס העיר</h1>
            <p className="muted" style={{ marginBottom: 12 }}>{places.length} מקומות בשנת {year < 0 ? 'העת העתיקה' : year}. ציר הזמן הוא קריאה מתוך המאגר; שנות תכנון ותקופות משוערות אינן מועדי ביצוע מאושרים.</p>

            <label className="label" htmlFor="atlas-search">חיפוש בעיר</label>
            <input id="atlas-search" className="field" style={{ width: '100%', marginBottom: 10 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="שם מקום, רובע או סיפור" />
            <label className="label" htmlFor="atlas-system">מערכות זהות · שיוך מוצע</label>
            <select id="atlas-system" className="field" style={{ width: '100%', marginBottom: 10 }} value={system} onChange={(e) => setSystem(e.target.value as SystemId | 'all')}><option value="all">כל המערכות</option>{Object.entries(SYSTEMS).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select>
            <details className="knowledge-queue"><summary>נושאים לבירור מיקום ותוואי ({UNLOCATED.length})</summary><p>מקור: הנחיית ענת, 30.10.2026. אחראי ומועד השלמה טרם נקבעו.</p>{UNLOCATED.map((item) => <p key={item.id}><strong>{item.name}</strong><br />{item.task}</p>)}</details>
            <span className="label">שכבות ארגון המאגר</span>
            <div className="row" style={{ marginBottom: 10 }}>
              {(Object.keys(LAYERS) as Layer[]).map((l) => (
                <button key={l} className="press chip" aria-pressed={layers.includes(l)} onClick={() => toggle(l)}>{LAYERS[l].name}</button>
              ))}
            </div>
            <span className="label">טבעת</span>
            <div className="row" style={{ marginBottom: 10 }}>
              <button className="press chip" aria-pressed={ring === 'all'} onClick={() => setRing('all')}>כולן</button>
              {RINGS.map((r) => <button key={r.id} className="press chip" aria-pressed={ring === r.id} onClick={() => setRing(r.id)} style={ring === r.id ? { background: r.color, borderColor: r.color } : { color: r.color }}>{r.name}</button>)}
            </div>
            <span className="label">מסלול על המפה</span>
            <select className="field" style={{ width: '100%', marginBottom: 10 }} value={walk} onChange={(e) => setWalk(e.target.value)} aria-label="מסלול על המפה">
              <option value="rings">שלוש הטבעות · תוואים בבירור</option>
              <option value="none">בלי מסלול</option>
              {WALKS.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>

            <div className="card" style={{ margin: '6px 0 14px', padding: 12, background: docMode ? '#FFF9D6' : undefined }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 14 }}>תיעוד שטח</strong>
                <button className="press chip" aria-pressed={docMode} onClick={() => setDocMode(!docMode)}>{docMode ? 'פעיל: לחצו על המפה' : 'הפעלה'}</button>
              </div>
              {docMode && (
                <div className="row" style={{ marginTop: 8 }}>
                  <select className="field" value={docEl} onChange={(e) => setDocEl(e.target.value)} aria-label="רכיב">
                    {ELEMENTS.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  {(['חסר', 'פגום', 'קיים'] as const).map((s) => <button key={s} className="press chip" aria-pressed={docState === s} onClick={() => setDocState(s)}>{s}</button>)}
                </div>
              )}
              <p className="muted" style={{ margin: '6px 0 0' }}>{store.docs.length ? <>תועדו <bdi className="num">{store.docs.length}</bdi> רכיבים. נשמר במכשיר.</> : 'ספסל חסר, פנס שבור, שלט קיים: לחיצה על המפה מוסיפה נקודה.'}</p>
              {store.docs.length > 0 && <button className="press chip" style={{ marginTop: 6 }} onClick={() => update((s) => ({ ...s, docs: s.docs.slice(0, -1) }))}>ביטול האחרון</button>}
            </div>

            <span className="label">לפי סדר עדיפות: הנמוך ביותר קודם</span>
            <div style={{ display: 'grid', gap: 6 }}>
              {list.length === 0 && <p role="status">לא נמצאו מקומות. שנו את החיפוש, התקופה או הסינון.</p>}
              {list.map((x) => (
                <a key={x.id} className="card card-link" href={href('atlas', { place: x.id })} style={{ padding: 8, display: 'grid', gridTemplateColumns: '40px minmax(0,1fr) auto', gap: 10, alignItems: 'center' }}>
                  <RingGlyph p={profile(x)} size={40} stroke={9} />
                  <span style={{ minWidth: 0 }}>
                    <strong style={{ fontSize: 14, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.name}</strong>
                    <span className="muted" style={{ fontSize: 12 }}>{LAYERS[x.layer].name}</span>
                  </span>
                  <bdi className="num" style={{ fontSize: 14 }}>{total(x)}</bdi>
                </a>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
