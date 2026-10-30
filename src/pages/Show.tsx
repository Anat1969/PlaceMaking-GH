import { useEffect, useState, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import CityRings from '../components/CityRings'
import RingGlyph from '../components/RingGlyph'
import { Lines } from '../components/Rich'
import { RINGS, RingId } from '../data/rings'
import { PLACES, WALKS, LAYERS } from '../data/places'
import { cityStats, profile, total } from '../lib/logic'
import { href } from '../lib/route'

// מצגת לראש העיר: נבנית מהנתונים, כך שכל שינוי באטלס מופיע גם כאן.
export default function Show() {
  const [i, setI] = useState(0)
  const stats = cityStats()
  const worst = [...PLACES].filter((p) => p.layer === 'heritage').sort((a, b) => total(a) - total(b)).slice(0, 3)
  const slides: { k: string; body: ReactNode }[] = [
    {
      k: 'פתיחה',
      body: (
        <div className="grid-2" style={{ alignItems: 'center' }}>
          <div>
            <h2>אשדוד, עיר של טבעות</h2>
            <Lines className="big" text="70 שנה אחרי 22 המשפחות הראשונות. ==העיר כמוזיאון חי, שמספר את סיפורו תוך כדי תנועה.==" />
          </div>
          <CityRings />
        </div>
      ),
    },
    {
      k: 'שלוש טבעות',
      body: (
        <>
          <h2>שלוש טבעות, שלושה צרכים</h2>
          <div className="grid-3">
            {RINGS.map((r) => (
              <div key={r.id} style={{ borderTop: `6px solid ${r.color}`, paddingTop: 12 }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 40, color: r.color, fontWeight: 700 }}>{r.name}</div>
                <div className="big"><p><strong>{r.drive} · {r.time}</strong></p><p>{r.definition}</p></div>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      k: 'מאגר אחד',
      body: (
        <>
          <h2>{PLACES.length} מקומות, מאגר אחד</h2>
          <div className="grid-kpi">
            {Object.entries(LAYERS).map(([k, l]) => (
              <div key={k} style={{ borderRight: `5px solid ${l.color}`, paddingRight: 14 }}>
                <div className="num" style={{ fontSize: 54 }}>{PLACES.filter((p) => p.layer === k).length}</div>
                <div className="big">{l.name}</div>
              </div>
            ))}
          </div>
          <Lines className="big" text={`ועוד **${WALKS.length} מסלולים** ו-**21 רובעים**. ==שימור, התחדשות ופלייסמייקינג, לראשונה על מפה אחת.==`} />
        </>
      ),
    },
    {
      k: 'האבחנה',
      body: (
        <>
          <h2>מה חסר לעיר</h2>
          <div className="grid-3">
            {RINGS.map((r) => (
              <div key={r.id}>
                <div className="num" style={{ fontSize: 80, color: r.color, lineHeight: 1 }}>{stats.byRing[r.id]}</div>
                <div className="big">{r.name}: ממוצע מתוך 100</div>
              </div>
            ))}
          </div>
          <Lines className="big" text={`הפערים הגדולים: **${stats.needs.slice(0, 3).map((n) => n.c.name).join(', ')}**. ==יש סיפור ויש נוף. חסרים צל ושלט.==`} />
        </>
      ),
    },
    {
      k: 'טביעת אצבע',
      body: (
        <>
          <h2>כל אתר מקבל טביעת אצבע</h2>
          <div className="grid-3">
            {worst.map((p) => (
              <div key={p.id} style={{ display: 'grid', justifyItems: 'start', gap: 8 }}>
                <div style={{ background: '#FFFDF8', padding: 10 }}><RingGlyph p={profile(p)} size={130} labels /></div>
                <div className="big"><p><strong>{p.name}</strong></p><p>{p.lead}</p></div>
              </div>
            ))}
          </div>
          <Lines className="big" text="קשת קצרה היא פער. ==ההמלצה נגזרת מהפער, לא מהטעם האישי.==" />
        </>
      ),
    },
    {
      k: 'הפיילוט',
      body: (
        <>
          <h2>פיילוט 70: טבעת הלב</h2>
          <Lines className="big" text="רובעים א', ב', ד' ו-ה'. 5 עד 8 מוקדי עוגן: ספסל, צל, שלט ותחנת סיפור. ספטמבר 2026: מיפוי. מאי 2027: השקה. **80,000 ₪**, ועוד כ-**70,000 ₪** מ-MUNI100 לוותיקים. ==פחות מ-2% מתקציב שבעת המיזמים, ומוכיח את השיטה לפני ההשקעה.==" />
        </>
      ),
    },
    {
      k: 'הבקשה',
      body: (
        <>
          <h2>הבקשה: אישור הפיילוט</h2>
          <Lines className="big" text="אישור תקציב הפיילוט בטבעת הלב. מינוי צוות שטח שמתעד באטלס מהשבוע הבא. השקה בשבוע ה-70. ==כל ספסל שיוצב יופיע כאן, מדוד ומתוזמן.==" />
          <div className="row" style={{ marginTop: 20 }}>
            <a className="press btn" href={href('walk', { id: 'ring-lev' })} style={{ background: 'transparent', color: '#fff' }}>לטבעת הלב</a>
            <a className="press btn" href={href('atlas')} style={{ background: 'transparent', color: '#fff' }}>לאטלס</a>
          </div>
        </>
      ),
    },
  ]
  const n = slides.length
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === ' ') setI((x) => Math.min(n - 1, x + 1))
      if (e.key === 'ArrowRight') setI((x) => Math.max(0, x - 1))
      if (e.key === 'Escape') location.hash = '/'
    }
    addEventListener('keydown', on)
    return () => removeEventListener('keydown', on)
  }, [n])
  return (
    <div className="show" role="region" aria-label="מצגת">
      <div className="show-top">
        <span>אדריכלות העיר אשדוד · שלוש טבעות</span>
        <span><bdi className="num">{i + 1}/{n}</bdi> · {slides[i].k}</span>
        <a className="press chip" href="#/" style={{ background: 'transparent', color: '#fff' }}>יציאה</a>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} className="show-slide" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.35 }}>
          {slides[i].body}
        </motion.div>
      </AnimatePresence>
      <div className="show-nav">
        <button className="press btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0} style={{ background: 'transparent', color: '#fff' }}>הקודם</button>
        <div className="show-dots">{slides.map((s, k) => <button key={k} aria-label={s.k} aria-current={k === i} onClick={() => setI(k)} />)}</div>
        <button className="press btn" onClick={() => setI(Math.min(n - 1, i + 1))} disabled={i === n - 1} style={{ background: 'var(--marker)', color: 'var(--ink)', borderColor: 'var(--marker)' }}>הבא</button>
      </div>
    </div>
  )
}

export type { RingId }
