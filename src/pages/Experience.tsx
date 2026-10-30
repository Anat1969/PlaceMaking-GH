import Rich, { Lines } from '../components/Rich'
import { SENSES, SCALES, ACTIVATIONS } from '../data/experience'
import { RINGS } from '../data/rings'
import { PHOTOS, Photo } from '../data/media'
import { href } from '../lib/route'

const DOORS = [
  { page: 'tour', params: { id: 'ring-lev' }, title: 'סיור חי', line: 'הטלפון מזהה את התחנה, מקריא את הסיפור ומקליט את שלכם.', tx: 'tx-sound', photo: '/media/s07-c.jpg' },
  { page: 'mapping', title: 'מיפוי הקרנה', line: 'הבניין מספר את עצמו באור. מעבדה, תוכנות, פסטיבלים ואשדוד.', tx: 'tx-light', photo: '/media/s01-night.jpg' },
  { page: 'walls', title: 'קירות מספרים', line: 'גרפיטי מהעיר ועד גובה ילד, וקירות ירוקים למפעלים.', tx: 'tx-concrete', photo: '/media/s25-eshkol.jpg' },
  { page: 'games', title: 'עיר בריחה וציד טבעות', line: 'חידה בכל תחנה, וקוד שפותח את תיבת הארכיון.', tx: 'tx-sand', photo: '/media/s14-arches.jpg' },
]

export default function Experience() {
  const all: Photo[] = Object.values(PHOTOS).flat().filter((p) => p.kind !== 'old')
  const mosaic = [all.find((p) => p.src.includes('s14-arches')), ...all.filter((p) => !p.src.includes('s14-arches'))].filter(Boolean).slice(0, 11) as Photo[]
  return (
    <>
      <section className="xp-hero">
        <img src="/media/fortress-sunset.jpg" alt="מצודת אשדוד ים בשקיעה" />
        <div className="in">
          <div className="label" style={{ color: '#9CC7DF' }}>חוויית המבקר · כל החושים</div>
          <h1>לא לקרוא על העיר.<br />לחוות אותה.</h1>
          <Lines text="לראות, לשמוע, לגעת, לנשום ולטעום. ==הצבע אומר איפה, הטקסטורה אומרת איך, וקנה המידה אומר מאיזה מרחק.==" />
          <div className="hero-credit">מצודת אשדוד ים בשקיעה · מקף־עברי, CC BY-SA 4.0, ויקישיתוף</div>
        </div>
      </section>

      <div className="page">
        <h2 className="section-title">מקרו: שלוש הטבעות אומרות איפה</h2>
        <div className="grid-3">
          {RINGS.map((r) => (
            <a key={r.id} className="card card-link" href={href('walk', { id: `ring-${r.id}` })} style={{ borderTop: `6px solid ${r.color}` }}>
              <span className="label">{r.order} · {r.drive}</span>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: r.color }}>{r.name}</h3>
              <p className="muted" style={{ margin: 0 }}>{r.definition}</p>
            </a>
          ))}
        </div>

        <h2 className="section-title">ביניים: חמשת החושים אומרים איך</h2>
        <p className="section-sub">לכל חוש טקסטורה קבועה. היא חוזרת בשלט, במפה ובאפליקציה.</p>
        <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 210px), 1fr))' }}>
          {SENSES.map((s) => (
            <div key={s.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className={s.texture} style={{ height: 70 }} />
              <div style={{ padding: 14 }}>
                <span className="label">{s.verb}</span>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{s.name}</h3>
                <p style={{ fontSize: 14, margin: '4px 0 8px' }}><strong>{s.line}</strong></p>
                <ul style={{ margin: 0, paddingInlineStart: 16, fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.8 }}>{s.tools.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </div>
          ))}
        </div>

        <h2 className="section-title">מיקרו: סולם קנה המידה, מהעיר אל היד</h2>
        <p className="section-sub">אותו רעיון, בחמישה מרחקים. העובר בכביש רואה מגדלור מואר, והילד רואה ציפור בגובה העיניים שלו.</p>
        <div className="scale-ladder">
          {SCALES.map((s, i) => (
            <div key={s.id}>
              <div className="bar-h" style={{ width: `${100 - i * 18}%` }} />
              <span className="label">{s.ratio}</span>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{s.name}</h3>
              <p style={{ fontSize: 13, margin: '4px 0' }}>{s.seen}</p>
              <p style={{ fontSize: 13, margin: '4px 0' }}><strong>{s.tools}</strong></p>
              <p className="muted" style={{ margin: 0 }}>{s.example}</p>
            </div>
          ))}
        </div>

        <h2 className="section-title">ארבע דלתות לחוויה</h2>
        <div className="grid-2">
          {DOORS.map((d) => (
            <a key={d.page} className="card card-link" href={href(d.page, d.params)} style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: '42% minmax(0,1fr)' }}>
              <div className="photo-hero" style={{ minHeight: 170 }}><img src={d.photo} alt="" loading="lazy" /></div>
              <div style={{ padding: 16, position: 'relative' }}>
                <div className={d.tx} style={{ height: 8, marginBottom: 10 }} />
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: 22 }}>{d.title}</h3>
                <p className="muted" style={{ margin: '4px 0 0' }}>{d.line}</p>
              </div>
            </a>
          ))}
        </div>

        <h2 className="section-title">האווירה: העיר בתמונות</h2>
        <p className="section-sub">מתוך תיק התיעוד של אתרי השימור.</p>
        <div className="mosaic">
          {mosaic.map((p, i) => (
            <figure key={p.src} className={i === 0 ? 'm-big' : i % 4 === 1 ? 'm-wide' : ''}>
              <img src={p.src} alt={p.caption} loading="lazy" />
              <figcaption>{p.caption}</figcaption>
            </figure>
          ))}
        </div>
        <p className="src">צילומים: {mosaic[0]?.credit}.</p>

        <h2 className="section-title">הפעלות לאורך השנה</h2>
        <div className="grid-3">
          {ACTIVATIONS.map((a) => {
            const r = RINGS.find((x) => x.id === a.ring)!
            return (
              <div key={a.name} className="card" style={{ borderRight: `4px solid ${r.color}` }}>
                <strong style={{ fontSize: 16 }}>{a.name}</strong>
                <div className="row" style={{ gap: 14, marginTop: 6 }}>
                  <div><span className="label">למי</span><span style={{ fontSize: 13 }}>{a.who}</span></div>
                  <div><span className="label">משך</span><span style={{ fontSize: 13 }}>{a.time}</span></div>
                  <div><span className="label">מתי</span><span style={{ fontSize: 13 }}>{a.season}</span></div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="tone tone-insight" style={{ marginTop: 16 }}>
          <Rich as="p">{`החוויה לא מחליפה את הספסל והצל. ==היא הסיבה לבוא, והספסל הוא הסיבה להישאר.==`}</Rich>
        </div>
      </div>
    </>
  )
}
