import Rich, { Lines } from '../components/Rich'
import WallLab from '../components/WallLab'
import { SOFTWARE, FESTIVALS, EXAMPLES, STAGES, THEMES } from '../data/experience'
import { placeById } from '../data/places'
import { coverOf, byGroup } from '../data/media'
import { href } from '../lib/route'

const PROCESS = [
  { n: '01', t: 'סקר ומדידה', d: 'צילום החזית מול, מדידה או סריקה תלת־ממדית, ובדיקת נקודת הצפייה של הקהל.' },
  { n: '02', t: 'מודל ותבנית', d: 'שרטוט מדויק של החזית: קשתות, חלונות וקורות. על התבנית הזו בונים את התוכן.' },
  { n: '03', t: 'תוכן', d: 'סיפור מהארכיון, באנימציה שמתאימה לכל פתח. כאן אמנים ותושבים עובדים יחד.' },
  { n: '04', t: 'מקרנים', d: 'בחירת מקרנים לפי גודל החזית, מרחק ואור הסביבה. מגדלים ועמדות זמניות, בלי עיגון למבנה.' },
  { n: '05', t: 'מיפוי באתר', d: 'הצמדת פינות ורשת בתוכנה, בדיוק כמו במעבדה למעלה, וכיול צבע.' },
  { n: '06', t: 'מופע', d: 'בטיחות, תנועה, שכנים ותיעוד. כל מופע מצולם ונשמר בארכיון.' },
]

export default function Mapping() {
  const gallery = byGroup('mapping')
  return (
    <>
      <section className="xp-hero" style={{ minHeight: 400 }}>
        <img src="/media/lyon-mapping.jpg" alt="מיפוי הקרנה על קתדרלת סן ז'אן בליון" />
        <div className="in">
          <div className="label" style={{ color: '#9CC7DF' }}>Projection Mapping · מיפוי וידאו</div>
          <h1>הבניין מספר<br />את עצמו באור</h1>
          <Lines text="מקרנים חזקים מקרינים אנימציה על חזית, פסל או חומה. התוכן מותאם בדיוק לקשתות, לחלונות ולקימורים. ==בלי לגעת במבנה, אפשר לספר בו 70 שנה.==" />
          <div className="hero-credit">קתדרלת סן ז'אן, חג האורות בליון · Gérald Martinez, CC BY-SA 3.0, ויקישיתוף</div>
        </div>
      </section>
      <div className="page">
        <h2 className="section-title">המעבדה: נסו בעצמכם</h2>
        <p className="section-sub">ככה עובדות תוכנות המיפוי: מצמידים ארבע פינות לחזית, והתוכן מתעוות בפרספקטיבה. בחרו מבנה ותוכן.</p>
        <WallLab initialMode="project" />

        <h2 className="section-title">ארבעה נושאים, ארבעה סוגי מבנים</h2>
        <p className="section-sub">הסדר הקונספטואלי: כל טבעת מקבלת את הסיפור שלה, והתעשייה מקבלת נושא משלה, "המנוע".</p>
        {Object.entries(THEMES).map(([k, th]) => (
          <section key={k} style={{ marginBottom: 22 }}>
            <div className="row" style={{ alignItems: 'baseline', borderBottom: `3px solid ${th.color}`, paddingBottom: 6, marginBottom: 10 }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: 24, color: th.color }}>{th.name}</h3>
              <span className="muted">{th.line}</span>
            </div>
            <div className="grid-2">
              {STAGES.filter((s) => s.theme === k).map((s) => {
                const p = placeById(s.place)
                const img = s.photo || coverOf(s.place)?.src
                return (
                  <div key={s.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'grid', gridTemplateColumns: img ? '38% minmax(0,1fr)' : 'minmax(0,1fr)' }}>
                    {img && <div className="photo-hero" style={{ minHeight: 200 }}><img src={img} alt={s.title} loading="lazy" style={{ filter: 'brightness(.8)' }} /></div>}
                    <div style={{ padding: 14 }}>
                      <a href={href('place', { id: s.place })} style={{ textDecoration: 'none' }}><h4 style={{ fontSize: 18 }}>{s.title}</h4></a>
                      <p className="muted" style={{ margin: '2px 0 6px' }}>{s.story}</p>
                      <p style={{ fontSize: 14 }}><strong>התוכן:</strong> {s.content}</p>
                      <div className="row" style={{ gap: 14 }}>
                        <div><span className="label">צפייה</span><span style={{ fontSize: 13 }}>{s.view}</span></div>
                        <div><span className="label">פורמט</span><span style={{ fontSize: 13 }}>{s.format}</span></div>
                      </div>
                      <p className="src" style={{ marginTop: 6 }}>זהירות: {s.care}{p?.approx ? ' · מיקום משוער' : ''}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
        <div className="grid-3">
          <div className="tone tone-problem"><h4>הבעיה</h4><p>אחרי השקיעה מבני השימור נעלמים. הסיפור שלהם לא נראה, והרחוב ריק.</p></div>
          <div className="tone tone-solution"><h4>ההמלצה</h4><p>פיילוט: ערב אחד בבית קנדה בשבוע ה-70, ומופע עונתי על חומות המצודה בקיץ.</p></div>
          <div className="tone tone-insight"><Rich as="p">{`פראג הקרינה 600 שנה על השעון שלה. ==אשדוד יכולה להקרין 70 שנה על בית קנדה.==`}</Rich></div>
        </div>

        <h2 className="section-title">איך זה נעשה במציאות</h2>
        <div className="steps">
          {PROCESS.map((s) => <div className="step" key={s.n}><div className="n">{s.n}</div><h3>{s.t}</h3><p>{s.d}</p></div>)}
        </div>

        <h2 className="section-title">דוגמאות מהארץ ומהעולם</h2>
        {gallery.length > 0 && (
          <div className="mosaic" style={{ marginBottom: 12 }}>
            {gallery.slice(0, 6).map((g, i) => (
              <figure key={g.key} className={i === 0 ? 'm-big' : ''}>
                <img src={g.url} alt={g.subject} loading="lazy" />
                <figcaption>{g.subject} · <a href={g.page} target="_blank" rel="noreferrer" style={{ color: '#fff' }}>{g.author}, {g.license}</a></figcaption>
              </figure>
            ))}
          </div>
        )}
        <div className="grid-2">
          {EXAMPLES.map((e) => (
            <div key={e.name} className="card">
              <span className="label">{e.where} · {e.who}</span>
              <h4 style={{ fontSize: 18 }}>{e.name}</h4>
              <p style={{ fontSize: 14 }}>{e.idea}</p>
              <div className="tone tone-insight" style={{ boxShadow: 'none' }}><p>לאשדוד: {e.lesson}</p></div>
            </div>
          ))}
        </div>

        <h2 className="section-title">פסטיבלים</h2>
        <div className="gantt">
          <table style={{ minWidth: 0 }}>
            <thead><tr><th>פסטיבל</th><th>איפה</th><th>מתי</th><th>מה רואים</th></tr></thead>
            <tbody>{FESTIVALS.map((f) => <tr key={f.name}><td><strong>{f.name}</strong></td><td>{f.where}</td><td>{f.when}</td><td>{f.note}</td></tr>)}</tbody>
          </table>
        </div>

        <h2 className="section-title">התוכנות</h2>
        <div className="grid-3">
          {SOFTWARE.map((s) => (
            <div key={s.name} className="card">
              <strong style={{ fontFamily: 'var(--mono)', direction: 'ltr', display: 'block', textAlign: 'right' }}>{s.name}</strong>
              <span className="label" style={{ marginTop: 2 }}>{s.who}</span>
              <p style={{ fontSize: 14, margin: 0 }}>{s.use}</p>
            </div>
          ))}
        </div>
        <p className="src">שמות התוכנות והפסטיבלים לפי האתרים הרשמיים שלהם. מועדי פסטיבלים משתנים משנה לשנה.</p>
      </div>
    </>
  )
}
