import Rich, { Lines } from '../components/Rich'
import WallLab from '../components/WallLab'
import { MURALS, SCALES, GREEN } from '../data/experience'
import { byGroup } from '../data/media'
import { href } from '../lib/route'

export default function Walls() {
  const murals = byGroup('mural')
  const greens = byGroup('green')
  return (
    <>
      <section className="xp-hero" style={{ minHeight: 380 }}>
        <img src="/media/s25-eshkol.jpg" alt="תחנת הכוח אשכול" />
        <div className="in">
          <div className="label" style={{ color: '#9CC7DF' }}>גרפיטי · ציורי קיר · קירות ירוקים</div>
          <h1>קירות מספרים</h1>
          <Lines text="קיר אטום הוא דף ריק. במפעל, בשיכון, בגובה ילד ועל גג הגן. ==אותו סיפור, בחמישה קני מידה.==" />
        </div>
      </section>
      <div className="page">
        <h2 className="section-title">גרפיטי במקרו ובמיקרו</h2>
        <p className="section-sub">מהקיר שרואים מהכביש ועד הציפור שרואה ילד בן חמש.</p>
        <div style={{ display: 'grid', gap: 10 }}>
          {MURALS.map((m) => {
            const sc = SCALES.find((s) => s.id === m.scale)!
            const idx = SCALES.indexOf(sc)
            return (
              <div key={m.title} className="card" style={{ display: 'grid', gridTemplateColumns: '120px minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
                <div>
                  <div style={{ height: 6, background: 'var(--lev)', width: `${100 - idx * 18}%`, marginBottom: 6 }} />
                  <span className="label">{sc.ratio}</span>
                  <strong style={{ fontFamily: 'var(--serif)', fontSize: 20 }}>{sc.name}</strong>
                </div>
                <div>
                  <h4 style={{ fontSize: 18 }}>{m.title}</h4>
                  <p style={{ fontSize: 14, margin: '4px 0' }}>{m.idea}</p>
                  <div className="row" style={{ gap: 18 }}>
                    <div><span className="label">איפה</span><span style={{ fontSize: 13 }}>{m.where}</span></div>
                    <div><span className="label">מי יוצר</span><span style={{ fontSize: 13 }}>{m.who}</span></div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="grid-2" style={{ marginTop: 14 }}>
          <div className="tone tone-insight"><Rich as="p">{`ההתחדשות בונה מגדלים של 30 קומות ליד גני ילדים. ==מלמעלה, גג הגן הופך לדף בספר.== נקודת מבט שלא הייתה קיימת עד היום.`}</Rich></div>
          <div className="tone tone-insight"><Rich as="p">{`ברובע ב' הרחובות נקראים על שם חיות וציפורים, וברובע ח' על שם פרחים. ==שם הרחוב הוא כבר התוכן לציור בגובה ילד.==`}</Rich></div>
        </div>

        <h2 className="section-title">המעבדה: ציור קיר וקיר ירוק</h2>
        <p className="section-sub">אותה מעבדה של מיפוי ההקרנה, במצב יום. בחרו מבנה, טיפול ותוכן, והצמידו את הפינות לקיר.</p>
        <WallLab initialMode="mural" facadeIds={['eshkol', 'kanada', 'fortress']} />

        {murals.length > 0 && (
          <>
            <h3 style={{ marginTop: 24, fontFamily: 'var(--serif)' }}>השראה מהעולם</h3>
            <div className="mosaic" style={{ marginTop: 8 }}>
              {murals.slice(0, 5).map((g, i) => (
                <figure key={g.key} className={i === 0 ? 'm-big' : ''}>
                  <img src={g.url} alt={g.subject} loading="lazy" />
                  <figcaption>{g.subject} · <a href={g.page} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>{g.author}, {g.license}</a></figcaption>
                </figure>
              ))}
            </div>
          </>
        )}

        <h2 className="section-title" style={{ color: 'var(--bank)' }}>קירות ירוקים למפעלים</h2>
        <p className="section-sub">טבע חוזר לאזור המלאכותי, והמפעל הופך לשכן טוב.</p>
        <div className="grid-kpi">
          {GREEN.goals.map((g) => (
            <div key={g.t} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="tx-leaf" style={{ height: 10 }} />
              <div style={{ padding: 14 }}><strong>{g.t}</strong><p className="muted" style={{ margin: '4px 0 0' }}>{g.d}</p></div>
            </div>
          ))}
        </div>
        <div className="tone tone-problem" style={{ marginTop: 12 }}><h4>בלי הבטחות שווא</h4><p>{GREEN.honest}</p></div>

        <h3 style={{ marginTop: 22, fontFamily: 'var(--serif)' }}>שלוש מערכות, משלוש דרגות</h3>
        <div className="grid-3" style={{ marginTop: 8 }}>
          {GREEN.systems.map((s) => (
            <div key={s.t} className="card" style={{ borderTop: '4px solid var(--bank)' }}>
              <span className="label">{s.tier}</span>
              <strong style={{ fontSize: 17 }}>{s.t}</strong>
              <p style={{ fontSize: 14, margin: '4px 0 0' }}>{s.d}</p>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 22, fontFamily: 'var(--serif)' }}>איפה באשדוד</h3>
        <div className="grid-3" style={{ marginTop: 8 }}>
          {GREEN.sites.map((s) => (
            <a key={s.t} className="card card-link" href={href('place', { id: s.place })} style={{ borderRight: '4px solid var(--bank)' }}>
              <strong>{s.t}</strong>
              <p className="muted" style={{ margin: '4px 0 0' }}>{s.d}</p>
            </a>
          ))}
        </div>

        <h3 style={{ marginTop: 22, fontFamily: 'var(--serif)' }}>מקורות השראה</h3>
        {greens.length > 0 && (
          <div className="strip" style={{ margin: '8px 0' }}>
            {greens.map((g) => (
              <figure key={g.key}>
                <img src={g.url} alt={g.subject} loading="lazy" />
                <figcaption>{g.subject} · <a href={g.page} target="_blank" rel="noreferrer">{g.author}, {g.license}</a></figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="grid-3">
          {GREEN.refs.map((r) => <div key={r.t} className="card"><strong>{r.t}</strong><p className="muted" style={{ margin: '4px 0 0' }}>{r.d}</p></div>)}
        </div>
        <div className="tone tone-solution" style={{ marginTop: 14 }}>
          <h4>ההמלצה</h4>
          <p>מתחילים במטפסים על כבלים לאורך גדר תחנת הכוח, בשיתוף חברת החשמל. זה זול, איטי ואמיתי. אחרי שנה מודדים אבק וחום, ומחליטים על קיר חי.</p>
        </div>
      </div>
    </>
  )
}
