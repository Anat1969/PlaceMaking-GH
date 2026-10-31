import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import CityRings from '../components/CityRings'
import { RINGS, RingId } from '../data/rings'
import { CONCEPTS } from '../data/concepts'
import { PLACES, WALKS } from '../data/places'
import { QUARTERS } from '../data/city'
import { href } from '../lib/route'

// הכריכה: כניסה אחת לאפליקציה. העיר מצטיירת כשלוש טבעות על רקע הים, והתמונות מתחלפות מאחור כמו זיכרון.
const BG = [
  { src: 'media/fortress-sunset.jpg', cap: 'מצודת אשדוד ים בשקיעה · מקף־עברי, CC BY-SA 4.0' },
  { src: 'media/archive-shikunim.jpg', cap: 'השיכונים, מתיק התיעוד · רשימת שימור ותיק תיעוד' },
  { src: 'media/s07-c.jpg', cap: 'מרכז רובע א\' · רשימת שימור ותיק תיעוד' },
  { src: 'media/s25-eshkol.jpg', cap: 'תחנת הכוח אשכול, מתיק התיעוד · רשימת שימור ותיק תיעוד' },
  { src: 'media/s01-night.jpg', cap: 'המגדלור בגבעת יונה בלילה · רשימת שימור ותיק תיעוד' },
]

function Count({ to, delay = 0 }: { to: number; delay?: number }) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? to : 0)
  useEffect(() => {
    if (reduce) return
    let raf = 0
    const t0 = performance.now() + delay
    const tick = (t: number) => {
      const k = Math.min(1, Math.max(0, (t - t0) / 1400))
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to])
  return <bdi className="num">{n}</bdi>
}

export default function Cover() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<RingId | null>(null)
  const [bg, setBg] = useState(0)
  useEffect(() => {
    if (reduce) return
    const t = setInterval(() => setBg((k) => (k + 1) % BG.length), 7000)
    return () => clearInterval(t)
  }, [reduce])
  const words = ['אשדוד,', 'עיר', 'של', 'טבעות']
  const base = import.meta.env.BASE_URL

  return (
    <section className="cover" aria-label="כריכת האפליקציה">
      <div className="cover-bg" aria-hidden="true">
        <AnimatePresence>
          <motion.img key={bg} src={base + BG[bg].src} alt="" initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 0.22, scale: reduce ? 1.04 : 1.12 }} exit={{ opacity: 0 }} transition={{ opacity: { duration: 2 }, scale: { duration: 9, ease: 'linear' } }} />
        </AnimatePresence>
      </div>
      <div className="cover-sea" aria-hidden="true" />
      <div className="cover-70" aria-hidden="true">70</div>

      <div className="cover-in">
        <div className="cover-copy">
          <motion.div className="kicker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            אדריכלות העיר אשדוד · תוכנית אב לפלייסמייקינג וחוויית מבקר
          </motion.div>
          <h1 aria-label="אשדוד, עיר של טבעות">
            {words.map((w, i) => (
              <motion.span key={i} className={i === 0 ? 'cv-line' : ''} initial={reduce ? false : { opacity: 0, y: 40, rotateX: -50 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: 0.35 + i * 0.16, duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>
                {w}
              </motion.span>
            ))}
          </h1>
          <motion.div className="lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}>
            <p>העיר כמוזיאון חי, שמספר את סיפורו תוך כדי תנועה.</p>
            <p>שלוש טבעות: <strong>הגוף</strong> ליד הים, <strong>הלב</strong> ברובעים הוותיקים, <strong>הרוח</strong> במרכז.</p>
            <p><mark className="insight">כל מקום מתועד, נמדד, מתוכנן ומסופר במקום אחד.</mark></p>
          </motion.div>
          <motion.div className="row cover-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
            <a className="press btn btn-primary" href={href('home')}>כניסה לאפליקציה</a>
            <a className="press btn" href={href('atlas')}>לאטלס העיר</a>
            <a className="press btn" href={href('show')}>מצגת לראש העיר</a>
          </motion.div>
          <motion.dl className="cover-facts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.7 }}>
            <div><dt>מקומות במאגר</dt><dd><Count to={PLACES.length} delay={1700} /></dd></div>
            <div><dt>מסלולים</dt><dd><Count to={WALKS.length} delay={1800} /></dd></div>
            <div><dt>רובעים</dt><dd><Count to={QUARTERS.length} delay={1900} /></dd></div>
            <div><dt>שנים לעיר</dt><dd><Count to={70} delay={2000} /></dd></div>
          </motion.dl>
        </div>
        <div className="cover-map">
          <CityRings active={active} onPick={(r) => setActive(active === r ? null : r)} />
        </div>
      </div>

      <div className="cover-rings">
        {RINGS.map((r, i) => {
          const c = CONCEPTS.find((x) => x.ring === r.id)
          return (
            <motion.a key={r.id} className="ring-cell" href={href('walk', { id: `ring-${r.id}` })}
              onMouseEnter={() => setActive(r.id)} onMouseLeave={() => setActive(null)} onFocus={() => setActive(r.id)} onBlur={() => setActive(null)}
              initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2 + i * 0.15 }}>
              <div className="dr" style={{ color: r.color }}>{r.order} · {r.time} · {r.drive}</div>
              <div className="nm" style={{ color: r.color }}>{r.name}</div>
              <p>{r.definition}</p>
              <p style={{ color: '#F5EFE4' }}><strong>{c ? `${c.impulse}: ${c.action}` : r.value}</strong></p>
            </motion.a>
          )
        })}
      </div>
      <div className="cover-credit" aria-live="off">{BG[bg].cap}</div>
    </section>
  )
}
