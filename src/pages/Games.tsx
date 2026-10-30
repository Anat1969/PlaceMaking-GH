import VoiceAnswer from '../components/VoiceAnswer'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import CityMap from '../components/CityMap'
import Rich, { Lines } from '../components/Rich'
import { ESCAPE, HUNT, ACTIVATIONS } from '../data/experience'
import { placeById } from '../data/places'
import { coverOf } from '../data/media'
import { RINGS } from '../data/rings'
import { useGeo, meters } from '../lib/senses'
import { href } from '../lib/route'

const KEY = 'pm-ashdod-game'
type G = { solved: Record<number, boolean>; found: Record<number, boolean> }
const load = (): G => { try { return { solved: {}, found: {}, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return { solved: {}, found: {} } } }

export default function Games() {
  const [g, setG] = useState<G>(load)
  const [active, setActive] = useState(0)
  const [answer, setAnswer] = useState('')
  const [wrong, setWrong] = useState(false)
  const [field, setField] = useState(false)
  const { pos, err: geoError } = useGeo(field)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(g)) } catch { /* */ } }, [g])
  const r = ESCAPE.riddles[active]
  const p = placeById(r.place)!
  const dist = pos ? Math.round(meters(pos, [p.lat, p.lng])) : null
  const locked = field && (dist === null || dist > 80)
  const code = ESCAPE.riddles.map((x, i) => (g.solved[i] ? x.digit(x.answer) : '·'))
  const done = ESCAPE.riddles.every((_, i) => g.solved[i])
  const check = () => {
    if (answer.trim().replace(/\s/g, '') === r.answer) {
      setG({ ...g, solved: { ...g.solved, [active]: true } })
      setWrong(false)
      setAnswer('')
      navigator.vibrate?.(120)
    } else setWrong(true)
  }
  const img = coverOf(r.place)
  return (
    <div className="page">
      <span className="label">משחקים בעיר · טבעת הלב</span>
      <h1 className="page-title">עיר בריחה: {ESCAPE.title}</h1>
      <div className="page-sub"><Lines text={ESCAPE.intro} /></div><p className="muted">התיבה היא סיפור מסגרת למשחק. אפשר לשחק כאן באופן עצמאי; אין צורך באביזר שהותקן בשטח.</p>

      <div className="card tx-light" style={{ padding: 20, color: '#fff' }}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <strong style={{ fontSize: 18 }}>הקוד של התיבה</strong>
          <span className="label" style={{ color: '#9CC7DF', margin: 0 }}>{Object.keys(g.solved).length} מתוך {ESCAPE.riddles.length}</span>
        </div>
        <div className="code-box" style={{ margin: '12px 0' }}>{code.map((c, i) => <motion.span key={i + c} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>{c}</motion.span>)}</div>
        {done && <p style={{ textAlign: 'center', fontSize: 18 }}><mark className="insight" style={{ color: 'var(--ink)', background: 'var(--marker)' }}>התיבה נפתחה. במשחק בשטח יחכו בה מפה מהארכיון וגלויה, לכתוב עליה זיכרון ולהשאיר לבאים אחריכם.</mark></p>}
      </div>

      <div className="grid-split" style={{ marginTop: 18 }}>
        <div>
          <div className="row" style={{ marginBottom: 10 }}>
            {ESCAPE.riddles.map((x, i) => (
              <button key={i} className="press chip" aria-pressed={i === active} onClick={() => { setActive(i); setWrong(false); setAnswer('') }} style={g.solved[i] ? { borderColor: 'var(--bank)', color: i === active ? '#fff' : 'var(--bank)' } : undefined}>
                {i + 1}. {x.title}
              </button>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {img && <div className="photo-hero" style={{ height: 220 }}><img src={img.src} alt={img.caption} /></div>}
            <div style={{ padding: 16 }}>
              <span className="label">תחנה {active + 1} · {r.title}</span>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 20, margin: '4px 0 10px' }}>{r.clue}</p>
              {locked ? (
                <div className="tone tone-neutral"><p>החידה נפתחת רק במקום. {dist !== null ? `אתם במרחק ${dist} מ'.` : 'מאתר מיקום.'} לכו אל {p.name}.</p></div>
              ) : g.solved[active] ? (
                <div className="tone tone-solution"><p>{r.reveal}</p></div>
              ) : (
                <>
                  <p style={{ fontSize: 16 }}><strong>{r.q}</strong></p><details className="source-limits"><summary>פתיחת תיק המידע לחידה בתוך האפליקציה</summary><p>{p.body}</p><p><strong>נתון מתוך תוכן המשחק:</strong> {r.answer}</p><p className="src">{p.source.label} · זהו נתון מתוכן המשחק הקיים, לא בדיקת מקור מחודשת.</p></details>
                  <div className="row">
                    <input className="field" inputMode="numeric" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && check()} aria-label="התשובה" placeholder="התשובה" style={{ width: 140 }} />
                    <button className="press btn btn-primary" onClick={check}>בדיקה</button>
                  </div>
                  <VoiceAnswer key={active} onText={setAnswer} />{wrong && <p style={{ color: 'var(--cut)', marginTop: 6 }}>לא בדיוק. הרמז נמצא בסיפור של התחנה: <a href={href('place', { id: r.place })}>{p.name}</a>.</p>}
                </>
              )}
            </div>
          </div>
          <div className="row" style={{ marginTop: 10, justifyContent: 'space-between' }}>
            <button className="press chip" aria-pressed={field} onClick={() => setField(!field)}>{field ? 'מצב שטח: אפשר לחזור למשחק מהבית' : 'משחק מתוך האפליקציה · מעבר לשטח'}</button>
            <button className="press chip" onClick={() => setG({ solved: {}, found: {} })}>משחק חדש</button>{geoError&&<p role="status">{geoError} אפשר לחזור למשחק מתוך האפליקציה.</p>}
          </div>
        </div>
        <div className="card" style={{ padding: 0, height: 420 }}>
          <CityMap places={ESCAPE.riddles.map((x) => placeById(x.place)!)} selected={r.place} fit showQuarters={false} me={pos} height="420px" onSelect={(id) => { const k = ESCAPE.riddles.findIndex((x) => x.place === id); if (k >= 0) setActive(k) }} />
        </div>
      </div>

      <div className="grid-3" style={{ marginTop: 18 }}>
        <div className="tone tone-neutral"><h4>במציאות</h4><p>שילוט וקודי QR בשטח הם הצעה לפיתוח, ואינם נדרשים כדי לשחק כאן. נתוני החידה זמינים בתיק המידע.</p></div>
        <div className="tone tone-neutral"><h4>מי מפעיל</h4><p>המשחק כאן פועל עצמאית: קוראים את תיק המידע, עונים ומקבלים משוב מיידי. ההתקדמות נשמרת במכשיר.</p></div>
        <div className="tone tone-insight"><Rich as="p">{`החידות לא נכתבות בשביל המשחק. ==כל תשובה היא עובדה מהסיפור של העיר.==`}</Rich></div>
      </div>

      <h2 className="section-title">ציד טבעות: לילדים בגובה העיניים</h2>
      <p className="section-sub">אפשר לחקור את התחנות מתוך האפליקציה. הטמנת טבעות בשטח היא הצעה בלבד; אין להניח שהותקנו.</p>
      <div className="grid-3">
        {HUNT.map((h, i) => {
          const hp = placeById(h.place)
          const ring = RINGS[i % 3]
          return (
            <button key={i} className="press card" aria-pressed={!!g.found[i]} onClick={() => setG({ ...g, found: { ...g.found, [i]: !g.found[i] } })} style={{ textAlign: 'right', display: 'grid', gridTemplateColumns: '54px minmax(0,1fr)', gap: 12, alignItems: 'center', ...(g.found[i] ? { background: ring.wash, color: 'var(--ink)', borderColor: ring.color } : {}) }}>
              <svg viewBox="0 0 54 54" width="54" height="54"><circle cx="27" cy="27" r="20" fill="none" stroke={ring.color} strokeWidth="9" strokeDasharray={g.found[i] ? 'none' : '4 6'} /></svg>
              <span>
                <strong style={{ display: 'block' }}>{hp?.name}</strong>
                <span style={{ fontSize: 13 }}>{hp?.lead}</span>
                <span className="muted" style={{ display: 'block', fontSize: 12 }}>{g.found[i] ? h.note : 'לחצו לסימון החקירה'}</span>
              </span>
            </button>
          )
        })}
      </div>

      <h2 className="section-title">רעיונות להפעלות בשטח · טרם הופעלו כאן</h2>
      <div className="grid-3">
        {ACTIVATIONS.map((a) => (
          <div key={a.name} className="card"><strong>{a.name}</strong><p className="muted" style={{ margin: '4px 0 0' }}>{a.who} · {a.time} · {a.season}</p></div>
        ))}
      </div>
    </div>
  )
}
