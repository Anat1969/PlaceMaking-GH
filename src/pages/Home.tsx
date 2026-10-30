import { useState } from 'react'
import { motion } from 'framer-motion'
import CityRings from '../components/CityRings'
import Rich, { Lines } from '../components/Rich'
import { RINGS, RingId, ELEMENTS } from '../data/rings'
import { PLACES, WALKS, LAYERS } from '../data/places'
import { QUARTERS } from '../data/city'
import { cityStats } from '../lib/logic'
import { href } from '../lib/route'
import { SENSES } from '../data/experience'

const LOOP = [
  { n: '01', t: 'מתעדים', d: 'כל ספסל, צל, שלט, פנס, גרפיטי ופסל, נקודה על המפה, עם מצב: קיים, חסר או פגום.' },
  { n: '02', t: 'מודדים', d: '12 קריטריוני האיכות של יאן גל, בשלוש טבעות. כל מקום מקבל טביעת אצבע.' },
  { n: '03', t: 'ממליצים', d: 'הפער החלש ביותר מקבל את הרכיב שמתקן אותו, קודם הקל, הזול והמהיר.' },
  { n: '04', t: 'מתזמנים', d: 'כל התערבות נכנסת לרבעון, לפי עונה: צל לפני הקיץ, תאורה לפני החורף.' },
  { n: '05', t: 'מספרים', d: 'הסיפור של הרובע, הקהילה והמבנה יוצא מהארכיון אל הרחוב.' },
  { n: '06', t: 'מציגים', d: 'מצגת אחת שנבנית מהנתונים, לראש העיר ולתושבים.' },
]

export default function Home() {
  const [active, setActive] = useState<RingId | null>(null)
  const stats = cityStats()
  const weak = stats.needs.slice(0, 3)
  const ringOf = (id: RingId) => RINGS.find((r) => r.id === id)!
  return (
    <>
      <section className="hero">
        <div className="hero-in">
          <div>
            <div className="kicker">אדריכלות העיר אשדוד · תוכנית אב לפלייסמייקינג וחוויית מבקר</div>
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              אשדוד,<br />עיר של טבעות
            </motion.h1>
            <div className="lead">
              <p>העיר כמוזיאון חי, שמספר את סיפורו תוך כדי תנועה.</p>
              <p>שלוש טבעות: <strong>הגוף</strong> ליד הים, <strong>הלב</strong> ברובעים הוותיקים, <strong>הרוח</strong> במרכז.</p>
              <p><mark className="insight">כל מקום מתועד, נמדד, מתוכנן ומסופר במקום אחד.</mark></p>
            </div>
            <div className="row">
              <a className="press btn btn-primary" href={href('atlas')}>לאטלס העיר</a>
              <a className="press btn" href={href('show')}>מצגת לראש העיר</a>
            </div>
          </div>
          <CityRings active={active} onPick={(r) => setActive(active === r ? null : r)} />
        </div>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div className="ring-row">
            {RINGS.map((r) => (
              <a key={r.id} className="ring-cell" href={href('walk', { id: `ring-${r.id}` })} onMouseEnter={() => setActive(r.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(r.id)} onBlur={() => setActive(null)}>
                <div className="dr" style={{ color: r.color }}>{r.order} · {r.time} · {r.drive}</div>
                <div className="nm" style={{ color: r.color }}>{r.name}</div>
                <p>{r.definition}</p>
                <p style={{ color: '#F5EFE4' }}><strong>{r.value}</strong></p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="page">
        <div className="grid-kpi rise">
          {[
            [PLACES.length, 'מקומות במאגר אחד'],
            [Object.keys(LAYERS).length, 'שכבות: שימור, התחדשות, מיזמים, עוגנים'],
            [WALKS.length, 'מסלולי שיטוט, 3 מהם טבעות'],
            [QUARTERS.length, 'רובעים וקהילות'],
            [ELEMENTS.length, 'רכיבים בארגז הכלים'],
            ['80,000 ₪', 'אומדן פיילוט טבעת הלב'],
          ].map(([v, t], i) => (
            <div className="card kpi" key={i}>
              <div className="v">{v}</div>
              <div className="t">{t}</div>
            </div>
          ))}
        </div>

        <h2 className="section-title">מה הכלי עושה</h2>
        <p className="section-sub">לולאה אחת, מהשטח ועד ההחלטה, וחזרה לשטח.</p>
        <div className="steps">
          {LOOP.map((s) => (
            <div className="step" key={s.n}>
              <div className="n">{s.n}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title">חוויה בכל החושים</h2>
        <p className="section-sub">לא רק לקרוא על העיר: לראות אותה באור, לשמוע אותה בקול, לשחק בה ולנשום בה.</p>
        <div className="mosaic">
          {[
            { src: '/media/s14-arches.jpg', t: 'מיפוי הקרנה על קשתות המצודה', to: 'mapping', cls: 'm-big' },
            { src: '/media/s01-night.jpg', t: 'המגדלור בלילה', to: 'mapping', cls: 'm-wide' },
            { src: '/media/s25-eshkol.jpg', t: 'קירות המנוע: גרפיטי וקיר ירוק', to: 'walls', cls: '' },
            { src: '/media/s07-c.jpg', t: 'סיור חי בטבעת הלב', to: 'tour', cls: '' },
            { src: '/media/archive-shikunim.jpg', t: 'עיר בריחה: תיבת הארכיון', to: 'games', cls: 'm-wide' },
          ].map((m) => (
            <a key={m.src} href={href(m.to, m.to === 'tour' ? { id: 'ring-lev' } : undefined)} className={m.cls} style={{ position: 'relative', overflow: 'hidden', display: 'block' }}>
              <figure style={{ margin: 0, height: '100%' }}><img src={m.src} alt={m.t} loading="lazy" /><figcaption>{m.t}</figcaption></figure>
            </a>
          ))}
        </div>
        <div className="row" style={{ marginTop: 10, gap: 14 }}>
          {SENSES.map((s) => <span key={s.id} className="sense-chip"><i className={s.texture} />{s.name}</span>)}
          <a className="press btn" href={href('xp')} style={{ marginInlineStart: 'auto' }}>לכל החוויה</a>
        </div>

        <h2 className="section-title">אבחנה עירונית במבט אחד</h2>
        <p className="section-sub">ממוצע הטבעות בכל {PLACES.length} המקומות. הערכת פתיחה, עד שסקר השטח יחליף אותה.</p>
        <div className="grid-3">
          {RINGS.map((r) => (
            <div className="card" key={r.id} style={{ borderTop: `4px solid ${r.color}` }}>
              <span className="label">{r.name} · {r.drive} · {r.dim}</span>
              <div className="row" style={{ alignItems: 'baseline' }}>
                <span className="num" style={{ fontSize: 40, color: r.color }}>{stats.byRing[r.id]}</span>
                <span className="muted">מתוך 100</span>
              </div>
              <div className="bar" style={{ marginTop: 8 }}><i style={{ width: `${stats.byRing[r.id]}%`, background: r.color }} /></div>
              <p className="muted" style={{ marginTop: 8 }}>הצרכים: {r.needs.join(', ')}.</p>
            </div>
          ))}
        </div>
        <div className="grid-3" style={{ marginTop: 14 }}>
          <div className="tone tone-problem">
            <h4>הבעיה: שלושת הפערים הגדולים</h4>
            {weak.map((w) => (
              <p key={w.c.id}><strong>{w.c.name}</strong> ({ringOf(w.c.ring).name}): ממוצע <bdi className="num">{w.avg.toFixed(1)}</bdi> מתוך 3.</p>
            ))}
          </div>
          <div className="tone tone-solution">
            <h4>הפתרון: קל, זול ומהיר קודם</h4>
            <p><strong>שילוט ו-QR</strong> לכל אתר שימור.</p>
            <p><strong>ספסל וצל</strong> כל 100 מ' במסלול הלב.</p>
            <p><strong>תחנת סיפור</strong> לכל מתחם התחדשות, לפני ההריסה.</p>
          </div>
          <div className="tone tone-insight">
            <h4>התובנה</h4>
            <Lines text="לאשדוד יש סיפור ונוף, וחסר לה הצל והשלט. ==הפער הוא בגוף ובשכל, לא בלב.== לכן הפיילוט מתחיל בטבעת הלב, שם הסיפור כבר קיים." />
          </div>
        </div>

        <div className="grid-2" style={{ marginTop: 40, alignItems: 'stretch' }}>
          <div className="quote" style={{ margin: 0 }}>
            עיר אינה צריכה להמציא את עצמה. היא צריכה רק לקרוא נכון את מה שכבר נתן לה הנוף.
            <cite>DNA אשדוד, ארבעה יסודות · אדריכלות העיר אשדוד</cite>
          </div>
          <div className="haiku">
            ספסל בצל שקמה<br />סבתא ממרוקו מספרת<br />הים עוד שומע
            <small>הייקו: שלוש הטבעות ברגע אחד. הצל לגוף, הסיפור ללב, הים לרוח.</small>
          </div>
        </div>

        <h2 className="section-title">ארבע השכבות של המאגר</h2>
        <div className="grid-2">
          {Object.entries(LAYERS).map(([k, l]) => (
            <a key={k} className="card card-link" href={href('atlas', { layer: k })} style={{ borderRight: `4px solid ${l.color}` }}>
              <strong>{l.name}</strong>
              <p className="muted" style={{ margin: 0 }}><Rich>{l.desc}</Rich></p>
            </a>
          ))}
        </div>
      </div>
    </>
  )
}
