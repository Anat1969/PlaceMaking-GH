import Rich, { Lines } from '../components/Rich'
import { PLACES, placeById, walkById } from '../data/places'
import { RINGS, elementById, ELEMENTS } from '../data/rings'
import { QUARTERS, recommend, update, useStore, uid, Action } from '../lib/logic'
import { href } from '../lib/route'

// לוח זמנים מוצע ממסמך המקור, אינו סטטוס ביצוע מאומת.
// לוח הזמנים של פיילוט טבעת הלב, מתוך המצגת "עיר של טבעות" (ספטמבר 2026)
const PILOT = [
  { m: 'שלב 01', t: 'מיפוי ומחקר', d: 'הליכה בגובה העיניים, תיעוד בשטח באטלס, סקר 12 הקריטריונים.' },
  { m: 'שלב 02', t: 'קונספט ותוכן', d: 'סיפורים מהארכיון, קולות תושבים, בחירת 5 עד 8 מוקדי עוגן.' },
  { m: 'שלב 03', t: 'תכנון מפורט', d: 'שפה גרפית, דיגלול ושילוט, רחבות שהייה וצל.' },
  { m: 'שלב 04', t: 'ייצור והתקנה', d: 'צל וספסלים לפני הקיץ.' },
  { m: 'שלב 05', t: 'השקה', d: 'הפעלה עם התושבים, תיעוד שימוש ובחינה לפני הרחבה.' },
]
const STATUS: Action['status'][] = ['רעיון', 'מתוכנן', 'בביצוע', 'בוצע']
const stColor = { 'רעיון': '#B9B2A4', 'מתוכנן': '#596774', 'בביצוע': '#75644E', 'בוצע': '#1F8A5B' }

// עונה מתאימה: צל ומים לפני הקיץ, תאורה לפני החורף
const seasonQuarter = (el: string, i: number) => {
  if (['shade', 'water', 'fitness', 'green'].includes(el)) return QUARTERS[1]
  if (el === 'light') return QUARTERS[3]
  return QUARTERS[Math.min(QUARTERS.length - 1, 1 + (i % 3))]
}

export default function Plan() {
  const store = useStore()
  const acts = store.actions
  const set = (id: string, patch: Partial<Action>) => update((s) => ({ ...s, actions: s.actions.map((a) => (a.id === id ? { ...a, ...patch } : a)) }))
  const remove = (id: string) => update((s) => ({ ...s, actions: s.actions.filter((a) => a.id !== id) }))
  const autoPilot = () => {
    const w = walkById('ring-lev')!
    const next: Action[] = []
    w.stops.forEach((s, i) => {
      const p = placeById(s.place)
      if (!p) return
      recommend(p, 6).filter((r) => r.el.tier !== 'הון').slice(0, 2).forEach((r) => {
        if (acts.some((a) => a.place === p.id && a.element === r.el.id)) return
        next.push({ id: uid(), place: p.id, element: r.el.id, quarter: seasonQuarter(r.el.id, i), status: 'רעיון', note: 'הצעה אוטומטית לבדיקה · פיילוט טבעת הלב' })
      })
    })
    update((s) => ({ ...s, actions: [...s.actions, ...next] }))
  }
  const byRing = RINGS.map((r) => ({ r, n: acts.filter((a) => elementById(a.element).ring === r.id).length }))
  const csv = () => {
    const rows = [['מקום', 'רכיב', 'טבעת', 'רבעון', 'סטטוס', 'הערה'], ...acts.map((a) => [placeById(a.place)?.name || '', elementById(a.element).name, RINGS.find((r) => r.id === elementById(a.element).ring)!.name, a.quarter, a.status, a.note || '']),
      [], ['תיעוד שטח'], ['רכיב', 'מצב', 'קו רוחב', 'קו אורך', 'תאריך'], ...store.docs.map((d) => [elementById(d.element).name, d.state, d.lat.toFixed(5), d.lng.toFixed(5), d.at.slice(0, 10)])]
    const blob = new Blob(['﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'placemaking-ashdod.csv'
    a.click()
  }

  return (
    <div className="page"><p className="app-data-notice">תוכנית עבודה אישית. המלצות, רבעונים ואומדני מקור הם בסיס לבדיקה; אינם אישור תקציבי או לוח ביצוע מאושר.</p>
      <h1 className="page-title">תכנון ותזמון</h1>
      <div className="page-sub"><Lines text="כל המלצה שנבחרה נכנסת לכאן, עם רבעון וסטטוס. ==העונה קובעת את הסדר: צל לפני הקיץ, תאורה לפני החורף.==" /></div>

      <h2 className="section-title">פיילוט טבעת הלב · שלבי עבודה מוצעים</h2>
      <p className="section-sub">שלבי עבודה מוצעים. היקף הפיילוט, מועדי הביצוע והתקציב דורשים אימות, תמחור ואישור לפני ביצוע.</p>
      <div className="steps">
        {PILOT.map((s, i) => (
          <div className="step" key={i}>
            <div className="n">{s.m}</div>
            <h3>{s.t}</h3>
            <p>{s.d}</p>
          </div>
        ))}
      </div>

      <div className="row" style={{ margin: '24px 0 8px', justifyContent: 'space-between' }}>
        <div className="row">
          <button className="press btn btn-primary" onClick={autoPilot}>יצירת טיוטה לפיילוט</button>
          <button className="press btn" onClick={csv} disabled={!acts.length && !store.docs.length}>הורדה לאקסל</button>
        </div>
        {store.savedAt > 0 && <span className="saved">נשמר במכשיר</span>}
      </div>
      <p className="muted">"בניית תוכנית" עוברת על תחנות טבעת הלב, ומוסיפה לכל אחת שתי המלצות אוטומטיות לבדיקה שאינן השקעת הון, ברבעון שמתאים לעונה.</p>

      <div className="grid-kpi" style={{ margin: '16px 0' }}>
        <div className="card kpi"><div className="v">{acts.length}</div><div className="t">התערבויות בתוכנית</div></div>
        {byRing.map(({ r, n }) => <div key={r.id} className="card kpi" style={{ borderTop: `4px solid ${r.color}` }}><div className="v" style={{ color: r.color }}>{n}</div><div className="t">{r.name} · {r.drive}</div></div>)}
        <div className="card kpi"><div className="v">{acts.filter((a) => elementById(a.element).tier === 'קל-זול-מהיר').length}</div><div className="t">קל, זול ומהיר</div></div>
      </div>

      {acts.length === 0 ? (
        <div className="tone tone-neutral"><h4>התוכנית ריקה</h4><Rich as="p">{`לחצו **יצירת טיוטה לפיילוט**, או הוסיפו המלצות מכרטיס של מקום באטלס.`}</Rich></div>
      ) : (
        <div className="gantt">
          <table>
            <thead>
              <tr>
                <th>מקום ורכיב</th>
                {QUARTERS.map((q) => <th key={q} style={{ textAlign: 'center' }}>{q}</th>)}
                <th>סטטוס</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {[...acts].sort((a, b) => QUARTERS.indexOf(a.quarter) - QUARTERS.indexOf(b.quarter)).map((a) => {
                const el = elementById(a.element)
                const ring = RINGS.find((r) => r.id === el.ring)!
                const p = placeById(a.place)
                return (
                  <tr key={a.id}>
                    <td style={{ minWidth: 200 }}>
                      <a href={href('place', { id: a.place })} style={{ fontWeight: 600, textDecoration: 'none' }}>{p?.name}</a>
                      <div style={{ color: ring.color, fontSize: 12 }}>{el.name} · {el.tier}</div>
                    </td>
                    {QUARTERS.map((q) => (
                      <td key={q} className="cell">
                        <button className="press" title={`העברה ל${q}`} aria-label={`${el.name} ב${p?.name}: העברה ל${q}`} onClick={() => set(a.id, { quarter: q })}
                          style={{ width: '100%', height: 24, padding: 0, background: a.quarter === q ? ring.color : 'transparent', borderColor: a.quarter === q ? ring.color : 'var(--rule-soft)', boxShadow: a.quarter === q ? 'var(--shadow-1)' : 'none' }} />
                      </td>
                    ))}
                    <td>
                      <select className="field" style={{ padding: '4px 6px', fontSize: 12, borderRight: `4px solid ${stColor[a.status]}` }} value={a.status} onChange={(e) => set(a.id, { status: e.target.value as Action['status'] })} aria-label="סטטוס">
                        {STATUS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td><button className="press chip" onClick={() => remove(a.id)} aria-label="הסרה">הסרה</button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="section-title">שבעת המיזמים: אומדני מקור</h2>
      <p className="section-sub">אומדנים מתוך "שבעת מיזמי הפלייסמייקינג", אגף אדריכלות העיר, נובמבר 2025.</p>
      <div className="grid-3">
        {PLACES.filter((p) => p.layer === 'project').map((p) => (
          <a key={p.id} className="card card-link" href={href('place', { id: p.id })} style={{ borderRight: `4px solid ${RINGS.find((r) => r.id === p.ring)!.color}` }}>
            <strong>{p.name}</strong>
            <div className="muted">{p.area}</div>
            <div className="num" style={{ fontSize: 20, marginTop: 6 }}>{p.extra?.['אומדן']}</div>
          </a>
        ))}
      </div>
      <div className="tone tone-insight" style={{ marginTop: 14 }}>
        <Rich as="p">{`סך שבעת המיזמים: **5,615,000 ₪**. הפיילוט בטבעת הלב עולה ==פחות מ-2% מזה, ומוכיח את השיטה לפני ההשקעה הגדולה.==`}</Rich>
      </div>
      <p className="muted" style={{ marginTop: 10 }}>רכיבים זמינים: {ELEMENTS.length}. ההמלצות נגזרות מסקר השטח, ומתעדכנות עם כל סימון.</p>
    </div>
  )
}
